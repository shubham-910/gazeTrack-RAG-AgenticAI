import json
import random
import logging
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.http import JsonResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.authtoken.models import Token

from home.models import CategoryData, GadResponse, PredictionData, LLMResponse, SessionEmbedding
from home.serializers import (
    UserRegisterSerializer, UserLoginSerializer, UserProfileSerializer,
    GadResponseSerializer, PredictionDataSerializer, CategoryDataSerializer, LLMResponseSerializer
)
from home.services.gaze_service import calculate_gaze_bias
from home.services.agent_service import generate_agent_cbt_feedback, embed_text, generate_rag_response

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            try:
                send_mail(
                    subject="Account Registration Successful - GazeTrack",
                    message=f"""Dear {user.username or 'User'},
                    
Welcome to GazeTrack. Your account has been successfully created with us.
We are happy to have you on our platform. Enjoy our application.

Best regards,
The GazeTrack Team""",
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception as e:
                logger.error(f"Failed to send registration email: {str(e)}")
            return Response("User Created Successfully", status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(request=request, email=email, password=password)
            if user is not None:
                token, created = Token.objects.get_or_create(user=user)
                is_filled = 1 if GadResponse.objects.filter(user=user).exists() else 0
                response_data = {
                    'token': token.key,
                    'user_id': user.id,
                    'name': user.username,
                    'is_filled': is_filled
                }
                return Response(response_data, status=status.HTTP_200_OK)
            return Response("Invalid Credentials", status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
            logout(request)
            return Response("Logged out successfully", status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SendResetLinkView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            token_generator = PasswordResetTokenGenerator()
            token = token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}reset-password/{user.id}/{token}"
            
            send_mail(
                subject="Password Reset Request - GazeTrack",
                message=f"""Dear {user.username or 'User'},
                
We received a request to reset the password for your account on GazeTrack. If you initiated this request, please click the link below to reset your password:

{reset_url}

If you did not request a password reset, please ignore this email.
For your security, this link will expire in 24 hours.

Best regards,
The GazeTrack Team""",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=True,
            )
            return Response({"message": "Password reset link sent successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, user_id, token):
        new_password = request.data.get('new_password')
        retype_password = request.data.get('retype_password')
        
        if new_password != retype_password:
            return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(id=user_id)
            token_generator = PasswordResetTokenGenerator()
            if not token_generator.check_token(user, token):
                return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
                
            user.set_password(new_password)
            user.save()
            
            try:
                send_mail(
                    subject="Password Reset Successful - GazeTrack",
                    message=f"""Dear {user.username or 'User'},
                    
Your password for the account associated with {user.email} on GazeTrack has been successfully updated.
Please use your new credentials to log in to your account.

Best regards,
The GazeTrack Team""",
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception as e:
                logger.error(f"Failed to send password reset confirmation: {str(e)}")
                
            return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_400_BAD_REQUEST)


class GadFormView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GadResponseSerializer(data=request.data)
        if serializer.is_valid():
            total_score = sum([
                serializer.validated_data.get('question_1', 0),
                serializer.validated_data.get('question_2', 0),
                serializer.validated_data.get('question_3', 0),
                serializer.validated_data.get('question_4', 0),
                serializer.validated_data.get('question_5', 0),
                serializer.validated_data.get('question_6', 0),
                serializer.validated_data.get('question_7', 0)
            ])
            gad_resp = serializer.save(user=request.user, total_score=total_score)
            return Response({
                'message': 'Form submitted successfully!',
                'total_score': total_score,
                'id': gad_resp.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateGadFormView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, user_id):
        # Allow updating the latest unfilled or filled GAD form for the user
        gad_response = GadResponse.objects.filter(user_id=user_id).last()
        if not gad_response:
            return Response({"error": "Form not found for this user"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = GadResponseSerializer(gad_response, data=request.data, partial=True)
        if serializer.is_valid():
            total_score = sum([
                serializer.validated_data.get('question_1', gad_response.question_1),
                serializer.validated_data.get('question_2', gad_response.question_2),
                serializer.validated_data.get('question_3', gad_response.question_3),
                serializer.validated_data.get('question_4', gad_response.question_4),
                serializer.validated_data.get('question_5', gad_response.question_5),
                serializer.validated_data.get('question_6', gad_response.question_6),
                serializer.validated_data.get('question_7', gad_response.question_7)
            ])
            serializer.save(total_score=total_score)
            return Response({
                'message': 'Form updated successfully!',
                'total_score': total_score
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetGadResponseView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            gad_response = GadResponse.objects.filter(user_id=user_id, is_filled=True).latest('submitted_at')
            serializer = GadResponseSerializer(gad_response)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except GadResponse.DoesNotExist:
            return Response({"error": "No GAD response found for the user."}, status=status.HTTP_404_NOT_FOUND)


class GetUserProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('userId')
        if not user_id:
            return Response({"error": "userId is required"}, status=status.HTTP_400_BAD_REQUEST)
        user = get_object_or_404(User, id=user_id)
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateUserProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get('userId')
        username = request.data.get('username')
        email = request.data.get('email')
        
        if not all([user_id, username, email]):
            return Response({"error": "userId, username, and email are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = get_object_or_404(User, id=user_id)
        user.username = username
        user.email = email
        user.save()
        return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)


class PredictView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PredictionDataSerializer(data=request.data)
        if serializer.is_valid():
            x_coords = serializer.validated_data['x']
            screen_width = serializer.validated_data.get('screen_width', 1920)
            
            # Viewport-aware gaze analysis calculation
            gaze_results = calculate_gaze_bias(x_coords, screen_width=screen_width)
            
            prediction_entry = PredictionData.objects.create(
                user=request.user,
                category_number=serializer.validated_data['category_number'],
                left_count=gaze_results['left_count'],
                right_count=gaze_results['right_count'],
                final_prediction=gaze_results['final_prediction'],
                test_date=timezone.now()
            )
            
            return Response({
                "id": prediction_entry.id,
                "left_count": prediction_entry.left_count,
                "right_count": prediction_entry.right_count,
                "final_prediction": prediction_entry.final_prediction,
                "test_date": prediction_entry.test_date
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetUserGazeDataView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('userId')
        if not user_id:
            return Response({"error": "user id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        predictions = PredictionData.objects.filter(user_id=user_id).order_by('-test_date')
        data_list = []
        
        for pred in predictions:
            llm_responses = pred.llm_responses.all()
            for resp in llm_responses:
                data_list.append({
                    "prediction_id": pred.id,
                    "category_number": pred.category_number,
                    "left_count": pred.left_count,
                    "right_count": pred.right_count,
                    "final_prediction": pred.final_prediction,
                    "test_date": pred.test_date,
                    "llm_response_id": resp.id,
                    "response_llm": resp.response_llm,
                    "techniques": resp.techniques,
                    "next_steps": resp.next_steps,
                    "llm_created_at": resp.created_at
                })
        return Response(data_list, status=status.HTTP_200_OK)


class AddCategoryView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        if isinstance(data, list):
            created_records = []
            for item in data:
                serializer = CategoryDataSerializer(data=item)
                if serializer.is_valid():
                    category = serializer.save()
                    created_records.append(serializer.data)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response({"created_records": created_records}, status=status.HTTP_201_CREATED)
            
        elif isinstance(data, dict):
            serializer = CategoryDataSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({"error": "Invalid data format."}, status=status.HTTP_400_BAD_REQUEST)


class GetCategoryPhotosView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        category_number = request.query_params.get('category_number')
        if not category_number:
            return Response({"error": "Missing category_number parameter."}, status=status.HTTP_400_BAD_REQUEST)
            
        positive_photos = CategoryData.objects.filter(category_number=category_number, is_positive=1)
        negative_photos = CategoryData.objects.filter(category_number=category_number, is_positive=0)
        
        if not positive_photos.exists() or not negative_photos.exists():
            return Response({"message": "Not enough data to generate pairs."}, status=status.HTTP_404_NOT_FOUND)
            
        pairs = []
        pos_list = list(positive_photos)
        neg_list = list(negative_photos)
        
        # Select up to 3 random pairs
        num_pairs = min(3, len(pos_list), len(neg_list))
        random.shuffle(pos_list)
        random.shuffle(neg_list)
        
        for i in range(num_pairs):
            pos = pos_list[i]
            neg = neg_list[i]
            pairs.append({
                "negative_image": {
                    "id": neg.id,
                    "image_metadata": neg.image_metadata,
                    "image_description": neg.image_description,
                },
                "positive_image": {
                    "id": pos.id,
                    "image_metadata": pos.image_metadata,
                    "image_description": pos.image_description,
                },
            })
            
        return Response({"pairs": pairs}, status=status.HTTP_200_OK)


class GeneratePersuasiveContentView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Securely runs the Google Gemini CBT Gaze Agent loop.
        Overrides the frontend request to query LLM client-side, making the API call backend-only.
        """
        user_id = request.data.get("user_id")
        prediction_id = request.data.get("prediction_id")
        
        if not user_id or not prediction_id:
            return Response({"error": "user_id and prediction_id are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user = get_object_or_404(User, id=user_id)
        prediction = get_object_or_404(PredictionData, id=prediction_id, user=user)
        
        # Fetch the latest GAD assessment score
        try:
            gad_resp = GadResponse.objects.filter(user=user).latest('submitted_at')
            gad_score = gad_resp.total_score
        except GadResponse.DoesNotExist:
            gad_score = 0
            
        def get_anxiety_message(score):
            if score <= 4: return "Minimal anxiety"
            if score <= 9: return "Mild anxiety"
            if score <= 14: return "Moderate anxiety"
            return "Severe anxiety"
            
        anxiety_level = get_anxiety_message(gad_score)
        
        # Call the Gemini AI Agent CBT service
        agent_data = generate_agent_cbt_feedback(
            user_profile=user,
            gad_score=gad_score,
            anxiety_level=anxiety_level,
            left_count=prediction.left_count,
            right_count=prediction.right_count,
            final_prediction=prediction.final_prediction
        )
        
        # Format techniques and next steps into standard bullet points string for front-end backwards compatibility
        techniques_list = agent_data.get("cognitive_techniques", [])
        tech_bullets = []
        for t in techniques_list:
            if isinstance(t, dict):
                title = t.get('title', 'Technique')
                desc = t.get('description', '')
                tech_bullets.append(f"- **{title}**: {desc}")
            else:
                tech_bullets.append(f"- {t}")
        techniques_bullet = "\n".join(tech_bullets)
        
        next_steps_list = agent_data.get("actionable_next_steps", [])
        next_steps_bullets = [f"- {step}" for step in next_steps_list if isinstance(step, str)]
        next_steps_bullet = "\n".join(next_steps_bullets)
        
        # Assemble standard formatted response lines to support ResultPage formatResponse slicing
        llm_fetch_response_str = f"""Clinical Report:
{agent_data.get('clinical_assessment')}

**Techniques to Enhance Positivity**
{techniques_bullet}

**Next Steps for the User**
{next_steps_bullet}"""

        # Persist LLMResponse in Database
        llm_entry = LLMResponse.objects.create(
            user=user,
            prediction_test=prediction,
            response_llm=llm_fetch_response_str,
            techniques=techniques_bullet,
            next_steps=next_steps_bullet
        )
        
        # --- RAG Integration: Generate and save embedding ---
        # Create a text representation of this session for embedding
        session_text = (
            f"Date: {prediction.test_date.strftime('%Y-%m-%d')}\n"
            f"Anxiety Score: {gad_score} ({anxiety_level})\n"
            f"Attentional Bias: {prediction.final_prediction}\n"
            f"{llm_fetch_response_str}"
        )
        
        embedding_vector = embed_text(session_text)
        
        SessionEmbedding.objects.create(
            user=user,
            prediction_data=prediction,
            llm_response=llm_entry,
            session_text=session_text,
            embedding=embedding_vector
        )
        # ----------------------------------------------------
        
        return Response({
            "status": "success",
            "llm_fetch_response": llm_fetch_response_str,
            "techniques": techniques_bullet,
            "next_steps": next_steps_bullet,
            "id": llm_entry.id
        }, status=status.HTTP_200_OK)


class DeleteAssessmentView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, prediction_id):
        """
        Permanently hard-deletes a specific gaze assessment and cascading LLM responses.
        Satisfies HIPAA/PHI records removal criteria.
        """
        prediction = get_object_or_404(PredictionData, id=prediction_id, user=request.user)
        prediction.delete()
        return Response({"message": "Gaze assessment and related reports permanently deleted."}, status=status.HTTP_200_OK)


class DeleteProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        """
        Permanently hard-deletes the user profile and cascades database deletion to all user-related
        data tables (gaze metrics, anxiety forms, LLM answers, auth tokens) to fully purge PHI.
        """
        user = request.user
        user.delete()
        return Response({"message": "Profile and all clinical data permanently deleted."}, status=status.HTTP_200_OK)


# Retain raw backward compatibility references for standard routes
handleRegister = RegisterView.as_view()
handleLogin = LoginView.as_view()
handleLogout = LogoutView.as_view()
sendResetLink = SendResetLinkView.as_view()
resetPassword = ResetPasswordView.as_view()
gadForm = GadFormView.as_view()
updateGadForm = UpdateGadFormView.as_view()
getGadResponse = GetGadResponseView.as_view()
getUserProfile = GetUserProfileView.as_view()
updateUserProfile = UpdateUserProfileView.as_view()
predictView = PredictView.as_view()
getUserGazeData = GetUserGazeDataView.as_view()
addCategory = AddCategoryView.as_view()
getCategoryPhotos = GetCategoryPhotosView.as_view()
generatePersuasiveContent = GeneratePersuasiveContentView.as_view()
deleteAssessment = DeleteAssessmentView.as_view()
deleteProfile = DeleteProfileView.as_view()

class ChatRAGView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        query = request.data.get('query', '').strip()

        if not query:
            return Response({'error': 'Query is required'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Embed the user's query
        query_embedding = embed_text(query)

        # 2a. Try pgvector L2Distance (works on Supabase / PostgreSQL)
        context_records = []
        try:
            from pgvector.django import L2Distance
            relevant_sessions = SessionEmbedding.objects.filter(
                user=user
            ).order_by(
                L2Distance('embedding', query_embedding)
            )[:3]

            for session in relevant_sessions:
                context_records.append({
                    "id": session.prediction_data.id,
                    "date": session.created_at.strftime('%Y-%m-%d %H:%M'),
                    "text": session.session_text
                })
            logger.info(f"pgvector search returned {len(context_records)} records.")

        except Exception as pgvector_err:
            # 2b. Python fallback — works on SQLite (local dev) when pgvector extension isn't available
            logger.warning(f"pgvector search failed ({str(pgvector_err)}), falling back to Python cosine search.")
            try:
                all_sessions = list(SessionEmbedding.objects.filter(user=user))
                if all_sessions:
                    import math

                    def l2_distance(a, b):
                        """Compute Euclidean (L2) distance between two equal-length lists."""
                        try:
                            # Embedding field can be stored as a list, string repr, or custom type
                            if not isinstance(a, list):
                                a = list(a)
                            if not isinstance(b, list):
                                b = list(b)
                            return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))
                        except Exception:
                            return float('inf')  # Treat unparseable embeddings as maximally distant

                    # Score each session by distance to the query embedding
                    scored = []
                    for session in all_sessions:
                        dist = l2_distance(session.embedding, query_embedding)
                        scored.append((dist, session))

                    # Sort by ascending distance (most similar first) and take top 3
                    scored.sort(key=lambda x: x[0])
                    for _, session in scored[:3]:
                        context_records.append({
                            "id": session.prediction_data.id,
                            "date": session.created_at.strftime('%Y-%m-%d %H:%M'),
                            "text": session.session_text
                        })
                    logger.info(f"Python fallback search returned {len(context_records)} records.")
            except Exception as py_err:
                logger.error(f"Python fallback search also failed: {str(py_err)}")
                return Response({'error': 'Failed to process chat query.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 3. Handle case where user has no past sessions at all
        if not context_records:
            return Response({
                "response": "You don't have any past assessment sessions for me to analyze yet. Please complete a Gaze Test first!",
                "citations": []
            }, status=status.HTTP_200_OK)

        # 4. Generate response using Gemini
        ai_response = generate_rag_response(query, context_records)

        return Response({
            "response": ai_response,
            "citations": [{"id": c["id"], "date": c["date"]} for c in context_records]
        }, status=status.HTTP_200_OK)


chatRAG = ChatRAGView.as_view()


class ConfigView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "mediapipe_wasm_url": settings.MEDIAPIPE_WASM_URL,
            "mediapipe_model_url": settings.MEDIAPIPE_MODEL_URL
        }, status=status.HTTP_200_OK)


configView = ConfigView.as_view()


