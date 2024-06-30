
from rest_framework import serializers
from .models import User


class PasswordResetSerializer(serializers.Serializer):
    """
    Serializer for handling the input data for initiating a password reset.

    This serializer is used to validate and process the input data provided when initiating a password reset.

    Fields:
        email (EmailField): The email address associated with the user account for which the password reset is requested.

    Example:
        To initiate a password reset:
        ```json
        {
            "email": "user@example.com"
        }
        ```

    Notes:
        - The email field is required and must be a valid email address.
        - This serializer is used in conjunction with the PasswordResetView to handle password reset requests.

    """

    email = serializers.EmailField()

class OTPVerificationSerializer(serializers.Serializer):
    """
    Serializer for handling the input data for OTP verification and password change.

    This serializer is used to validate and process the input data provided during OTP verification
    and password change.

    Fields:
        email (EmailField): The email address associated with the user account.
        otp (CharField): The One-Time Password (OTP) received by the user.
        new_password (CharField): The new password to be set for the user account.

    Example:
        To verify an OTP and change the password:
        ```json
        {
            "email": "user@example.com",
            "otp": "123456",
            "new_password": "new_password"
        }
        ```

    Notes:
        - The email field is required and must be a valid email address.
        - The otp field is required and represents the OTP received by the user.
        - The new_password field is write-only and represents the new password to be set for the user.
        - This serializer is used in conjunction with the OTPVerificationView to handle OTP verification
          and password change requests.

    """
    email = serializers.EmailField()
    otp = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

class AccountSerializer(serializers.ModelSerializer):

    """
    Serializer for handling user account creation.

    This serializer is used to validate and process the input data provided during user account creation.

    Fields:
        email (EmailField): The email address associated with the user account.
        username (CharField): The username for the user account.
        mobile (CharField): The mobile number associated with the user account.
        password (CharField): The password for the user account.

    Methods:
        create(validated_data):
            Override the create method to use the create_user method for creating a new user instance.

    Example:
        To create a new user account:
        ```json
        {
            "email": "user@example.com",
            "username": "new_user",
            "mobile": "1234567890",
            "password": "password123"
        }
        ```

    Notes:
        - The create method is overridden to use the create_user method of the User model for creating a new user.
        - This serializer is used in conjunction with the AccountCreateAPI to handle user account creation.

    """
    class Meta:
        model = User
        fields = ['email', 'username', 'mobile', 'password', ]
    def create(self, validated_data):
        """
         We need to override create method from ModelSerializer. beacause 
         this method use create method for create new models of instance.
         but our User Model we have created function create_user and it is set_password use
         hashing. and create method is not use set_password
         it is save models like this... 
         create(usename = username, password =password)
        """
        username = validated_data.get("username")
        email = validated_data.get("email")
        mobile = validated_data.get("mobile")
        password = validated_data.get("password")
        user = User.objects.create_user(
                    email=email,
                    username=username, 
                    mobile=mobile,
                    password=password
               )
        return user


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for handling user profile information.

    This serializer is used to serialize and deserialize user profile information, including
    email, username, mobile, first name, last name, address, and image.

    Fields:
        email (EmailField): The email address associated with the user profile.
        username (CharField): The username for the user profile.
        mobile (CharField):firstName The mobile number associated with the user profile.
        first_name (CharField): The first name of the user.
        last_name (CharField): The last name of the user.
        address (CharField): The address information of the user.
        image (ImageField): The image associated with the user profile.

    Example:
        Serialized representation of a user profile:
        ```json
        {
            "email": "user@example.com",
            "username": "example_user",
            "mobile": "1234567890",
            "first_name": "John",
            "last_name": "Doe",
            "address": "123 Main Street, City",
            "image": "path/to/image.jpg"
        }
        ```

    Notes:
        - This serializer is used in conjunction with the ProfileAPI to handle user profile information.

    """

    class Meta:
        model = User
        fields = ['email', 'username', 'mobile', 'is_private_account', 'first_name', 'last_name', "address","image" , "bio"]
