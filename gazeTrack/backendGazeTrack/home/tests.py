import json
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from home.models import GadResponse, PredictionData, LLMResponse
from home.services.gaze_service import calculate_gaze_bias
from home.services.agent_service import generate_mock_feedback

class GazeTrackAPITests(APITestCase):

    def setUp(self):
        # Create test users and set up basic configurations
        self.user = User.objects.create_user(username="testuser", email="testuser@example.com", password="testpassword123")
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    # 1. Authentication Tests
    def test_user_registration(self):
        # Reset auth credentials to test registration publicly
        self.client.credentials()
        url = reverse('handleRegister')
        data = {
            "name": "newuser",
            "email": "newuser@example.com",
            "password": "newpassword123",
            "retypePassword": "newpassword123"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="newuser@example.com").exists())

    def test_user_login(self):
        self.client.credentials()
        url = reverse('handleLogin')
        data = {
            "email": "testuser@example.com",
            "password": "testpassword123"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user_id'], self.user.id)

    def test_user_profile(self):
        url = reverse('getUserProfile')
        response = self.client.get(url, {'userId': self.user.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    # 2. GAD-7 Questionnaire Tests
    def test_gad_form_submission_and_score(self):
        url = reverse('gadForm')
        data = {
            "question_1": 2,
            "question_2": 3,
            "question_3": 1,
            "question_4": 0,
            "question_5": 2,
            "question_6": 1,
            "question_7": 3,
            "difficulty": "Somewhat difficult",
            "is_filled": 1
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['total_score'], 12)  # 2+3+1+0+2+1+3 = 12
        
        # Verify db insert
        gad_record = GadResponse.objects.get(id=response.data['id'])
        self.assertEqual(gad_record.total_score, 12)
        self.assertEqual(gad_record.user, self.user)

    # 3. Viewport-Aware Gaze Math Calculations
    def test_calculate_gaze_bias_left(self):
        # Center of 1920 is 960. Dead-zone (5%) is 96.
        # Left boundary is 864. Right boundary is 1056.
        x_coords = [100, 200, 300, 900, 950, 1100]  # 3 left, 2 deadzone, 1 right
        results = calculate_gaze_bias(x_coords, screen_width=1920, margin_percentage=0.05)
        
        self.assertEqual(results['left_count'], 3)
        self.assertEqual(results['right_count'], 1)
        self.assertEqual(results['final_prediction'], 'Left')

    def test_calculate_gaze_bias_right(self):
        x_coords = [1100, 1200, 1500, 1600, 500, 920]  # 4 right, 1 left, 1 deadzone
        results = calculate_gaze_bias(x_coords, screen_width=1920, margin_percentage=0.05)
        
        self.assertEqual(results['left_count'], 1)
        self.assertEqual(results['right_count'], 4)
        self.assertEqual(results['final_prediction'], 'Right')

    def test_calculate_gaze_bias_outliers(self):
        # Coordinates outside screen width (0-1000)
        x_coords = [-50, 500, 1200, 800, 200]  # screen width 1000. Center 500. Margin 50. Left boundary 450. Right boundary 550.
        # -50 is outlier (discarded). 1200 is outlier (discarded). 500 is in deadzone. 800 is right. 200 is left.
        results = calculate_gaze_bias(x_coords, screen_width=1000, margin_percentage=0.05)
        
        self.assertEqual(results['left_count'], 1)
        self.assertEqual(results['right_count'], 1)
        self.assertEqual(results['final_prediction'], 'Balanced')

    # 4. Agent Clinical Logic Fallback Generation
    def test_generate_mock_feedback_left_bias(self):
        feedback = generate_mock_feedback(anxiety_level="Severe anxiety", bias_ratio=0.75, final_prediction="Left")
        
        self.assertIn("clinical_assessment", feedback)
        self.assertEqual(feedback["attention_bias_ratio"], 0.75)
        self.assertTrue(len(feedback["cognitive_techniques"]) >= 2)
        self.assertTrue(len(feedback["actionable_next_steps"]) >= 2)
        # Verify text focuses on negative threat biases
        self.assertIn("threat-monitoring", feedback["clinical_assessment"])

    def test_generate_mock_feedback_right_bias(self):
        feedback = generate_mock_feedback(anxiety_level="Minimal anxiety", bias_ratio=0.20, final_prediction="Right")
        
        self.assertIn("clinical_assessment", feedback)
        self.assertEqual(feedback["attention_bias_ratio"], 0.20)
        # Verify text focuses on positive pathways
        self.assertIn("positive stimuli", feedback["clinical_assessment"])

