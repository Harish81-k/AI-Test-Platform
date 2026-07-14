from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests

from django.conf import settings
import traceback


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "password")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class UserProfileView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class GoogleLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):

        credential = request.data.get("credential")

        if not credential:
            return Response(
                {"error": "Google credential is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            print("========== GOOGLE LOGIN ==========")
            print("Credential received:", credential[:40], "...")

            idinfo = id_token.verify_oauth2_token(
                credential,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )

            email = idinfo.get("email")
            name = idinfo.get("name", "")
            email_verified = idinfo.get("email_verified", False)

            print("Email:", email)

            if not email:
                return Response(
                    {"error": "Email not found in Google token."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not email_verified:
                return Response(
                    {"error": "Google email is not verified."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            username = email.split("@")[0]

            counter = 1
            original_username = username

            while User.objects.filter(username=username).exclude(email=email).exists():
                username = f"{original_username}{counter}"
                counter += 1

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": username,
                    "first_name": name,
                },
            )

            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "Login successful",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as e:
            print("Google Token Verification Error")
            traceback.print_exc()

            return Response(
                {"error": f"Google verification failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            print("Unexpected Google Login Error")
            traceback.print_exc()

            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )