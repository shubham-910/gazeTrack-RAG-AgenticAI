from rest_framework import serializers
from django.contrib.auth.models import User
from .models import GadResponse, PredictionData, CategoryData, LLMResponse

class UserRegisterSerializer(serializers.Serializer):
    """
    Serializer for user registration.
    """
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    retypePassword = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_name(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        password = data.get('password')
        retype_password = data.get('retypePassword')
        if password and retype_password and password != retype_password:
            raise serializers.ValidationError({"retypePassword": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('retypePassword')
        username = validated_data.pop('name')
        email = validated_data['email']
        password = validated_data['password']
        
        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_staff = False
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for validating login credentials.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying and updating user profile information.
    """
    status = serializers.BooleanField(source='is_active', read_only=True)
    datejoined = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'email', 'status', 'datejoined']
        read_only_fields = ['email', 'datejoined']

    def get_datejoined(self, obj):
        return obj.date_joined.strftime('%Y-%m-%d')


class GadResponseSerializer(serializers.ModelSerializer):
    """
    Serializer for GAD-7 mental health assessment scores.
    """
    class Meta:
        model = GadResponse
        fields = [
            'id', 'question_1', 'question_2', 'question_3', 
            'question_4', 'question_5', 'question_6', 'question_7', 
            'difficulty', 'is_filled', 'total_score', 'submitted_at'
        ]
        read_only_fields = ['id', 'total_score', 'submitted_at']

    def validate(self, data):
        # Validate that each question value is between 0 and 3
        questions = [
            'question_1', 'question_2', 'question_3', 
            'question_4', 'question_5', 'question_6', 'question_7'
        ]
        for q in questions:
            val = data.get(q)
            if val is not None and (val < 0 or val > 3):
                raise serializers.ValidationError({q: "Score must be between 0 and 3."})
        return data


class PredictionDataSerializer(serializers.ModelSerializer):
    """
    Serializer to receive raw coordinates and viewport dimensions to calculate attentional bias.
    """
    x = serializers.ListField(child=serializers.FloatField(), write_only=True)
    screen_width = serializers.IntegerField(write_only=True, required=False, default=1920)
    screen_height = serializers.IntegerField(write_only=True, required=False, default=1080)

    class Meta:
        model = PredictionData
        fields = [
            'id', 'category_number', 'left_count', 'right_count', 
            'final_prediction', 'test_date', 'x', 'screen_width', 'screen_height'
        ]
        read_only_fields = ['id', 'left_count', 'right_count', 'final_prediction', 'test_date']


class CategoryDataSerializer(serializers.ModelSerializer):
    """
    Serializer representing visual stimuli options.
    """
    class Meta:
        model = CategoryData
        fields = ['id', 'category_number', 'category_name', 'is_positive', 'image_metadata', 'image_description']


class LLMResponseSerializer(serializers.ModelSerializer):
    """
    Serializer representing the AI clinical responses.
    """
    class Meta:
        model = LLMResponse
        fields = ['id', 'user', 'response_llm', 'techniques', 'next_steps', 'prediction_test', 'created_at']
        read_only_fields = ['id', 'created_at']
