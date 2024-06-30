from django.shortcuts import render
from rest_framework import mixins
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.http import Http404
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from .models import User
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
# from . import CustomAuthentication
from rest_framework.authentication import BasicAuthentication
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.views import TokenObtainPairView
from .utils import send_otp_email
import random
from django.core.exceptions import ObjectDoesNotExist
from rest_framework_simplejwt.tokens import AccessToken


# Create your views here.



class OTPVerificationView(APIView):
    """
    API endpoint for verifying an OTP (One-Time Password) and changing the user's password.

    This API allows users to verify an OTP sent to their email and change their password.

    Methods:
        post(request):
            Verify the provided OTP and change the user's password if the verification is successful.

    Example:
        To verify an OTP and change the password:
        ```
        POST /otp-verification/
        {
            "email": "user@example.com",
            "otp": "123456",
            "new_password": "new_password"
        }
        ```

    Note:
        - The user is identified by their email address.
        - The OTP is checked against the stored OTP for the user.
        - The user's password is updated upon successful OTP verification.

    """
    def post(self, request):
        """
        Verify the provided OTP and change the user's password if the verification is successful.

        Parameters:
            request (Request): The HTTP request object containing the OTP verification data.

        Returns:
            Response: A response indicating the success of the OTP verification and password change.

        Status Codes:
            200 OK: Successful OTP verification and password change.
            400 Bad Request: Invalid input data or OTP verification failed.

        Example:
            ```
            POST /otp-verification/
            {
                "email": "user@example.com",
                "otp": "123456",
                "new_password": "new_password"
            }
            ```
        """
        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']

            # Retrieve the user based on the provided email
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({'detail': 'Please Enter valid Email'}, status=status.HTTP_400_BAD_REQUEST)
            # Check if the provided OTP matches the stored OTP for the user
            if user.otp == otp:  # Assuming you have a UserProfile model with an 'otp' field
                # Update the user's password
                user.set_password(new_password)
                # Clear the OTP after successful verification
                user.otp = None
                user.save()
                return Response({'detail': 'Password changed successfully'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Please Enter valid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



def generate_otp():
    return random.randint(1000, 9999)

class PasswordResetView(APIView):
    """
    API endpoint for initiating a password reset process.

    This API allows users to request a password reset by providing their email address.
    An OTP (One-Time Password) is generated and sent to the user's email for verification.

    Methods:
        post(request):
            Initiate the password reset process by sending an OTP to the user's email.

    Example:
        To request a password reset:
        ```
        POST /password-reset/
        {
            "email": "user@example.com"
        }
        ```

    Note:
        - The email address is used to identify the user.
        - If the email exists, an OTP is generated and sent to the user's email.
        - You need to implement the `generate_otp` and `send_otp_email` functions.

    """
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email = email)
            if user.exists():
                otp = generate_otp()  # You need to implement a function to generate OTP
                send_otp_email(email, otp)  # You need to implement a function to send OTP via email
                return Response({'detail': 'OTP sent your email'}, status=status.HTTP_200_OK)
            return Response({"detail": "Email is not exists"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AccountCreateAPI(generics.CreateAPIView):

    """
    API endpoint for creating a new user account.

    This API allows users to create a new user account.

    Attributes:
        queryset (QuerySet): The query set of User objects used for creating new accounts.
        serializer_class (Serializer): The serializer class used for user account serialization.

    Methods:
        perform_create(serializer):
            Perform the creation of a new user account.

    Example:
        To create a new user account:
        ```
        POST /accounts/create/
        {
            "username": "new_user",
            "password": "new_password",
            "email": "new_user@example.com"
            // Other account fields...
        }
        ```

    """
    queryset = User.objects.all()
    serializer_class = AccountSerializer

# class LoginView(TokenObtainPairView):
#     pass 
class LoginView(TokenObtainPairView):
    """
    Custom login view for obtaining JWT tokens.

    This view extends the TokenObtainPairView from the rest_framework_simplejwt
    package, providing token-based authentication.

    Methods:
        post(request, format=None):
            Obtain a JSON Web Token (JWT) pair for user authentication.

    Example:
        To obtain a JWT pair for user authentication:
        ```
        POST /token/
        {
            "username": "example_user",
            "password": "example_password"
        }
        ```

    Note:
        This view inherits the behavior of TokenObtainPairView for token generation.

    """

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        access_token = response.data["access"]
        user_id   =   AccessToken(access_token)["user_id"]
        user = User.objects.get(id=user_id)
        response_data = {
            'access': access_token,
            'username': user.username,
            'id': user.id, 
            'login_user_image' : str(user.image.name)
        }
        return Response(response_data)


class ProfileAPI(generics.RetrieveUpdateAPIView):
    """
    API endpoint for retrieving and updating user profiles.

    This API allows authenticated users to retrieve and update their user profiles.

    Attributes:
        permission_classes (list): A list of permission classes required for accessing this API.
            By default, it is set to [IsAuthenticated], meaning only authenticated users can
            interact with this API.
        queryset (QuerySet): The query set of User objects used for retrieving and updating.
        serializer_class (Serializer): The serializer class used for user profile serialization.

    Methods:
        get_queryset():
            Get the query set of User objects.

        get_object():
            Get the currently authenticated user.
    Example:
        To retrieve the user profile details:
        ```
        GET /profile/
        ```

        To update the user profile:
        ```
        PATCH /profile/
        {
            "first_name": "Updated",
            "last_name": "User",
            "email": "updated.user@example.com"
            // Other profile fields...
        }
        ```

    """
    #authentication_classes = [CustomAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = User.objects.all()
    serializer_class = ProfileSerializer

    def get_queryset(self):
        user = self.request.user
        return User.objects.filter(email = user.email)

    def get_object(self):
        return self.request.user
    def delete(self, request):
        username = request.data.get('username')
        user = User.objects.get(username = username)
        user.delete()
        return Response({"msg" : "User deleted"}, status=status.HTTP_204_NO_CONTENT) 



   #Simple DRF.
    """
    def get_object(self, email):
        try:
            return User.objects.get(email = email)
        except:
            raise Http404

    def get(self, request, format=None):
        email = request.user
        if email:
            user = self.get_object(email)
            serializer = ProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def patch(self, request, format=None):
        email = request.user
        user = self.get_object(email)
        serializer = ProfileSerializer(user,data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
    """



"""
class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)
        if user:
            #login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            response =  Response({'access_token': str(token)}, status=status.HTTP_200_OK)
            response.set_cookie(key =  "token", value=token, httponly=True,  samesite="None")
            return response
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
"""
