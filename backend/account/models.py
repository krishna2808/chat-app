from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin
from django.db import models
from datetime import datetime
# Create your models here.


class UserModelManager(BaseUserManager):
    #def __init__(self):
    #    self.fields = {}

    def create_user(self, email,username, mobile, password=None):
        if not email:
            raise ValueError('Users must have an email address')

        if not username:
            raise ValueError('Users must have an username address')

        user = self.model(
            email=self.normalize_email(email),
            username= username,
            mobile=mobile, 
            password=password

        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email,username, mobile,password=None):
        #if len(password) < 8:
        #    raise ValueError('Password must be bigger than 8 Char')

        user = self.create_user(
            email=email,
            username= username,
            mobile=mobile, 
            password=password 
       )
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user




class User(AbstractUser, PermissionsMixin):
    # Use email as the unique identifier

    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    username = models.CharField(
        max_length=225,
        unique=True
    )
    first_name = models.CharField(max_length=225, null=True, blank=True)
    last_name = models.CharField(max_length=225, null=True, blank=True)
    mobile = models.CharField(max_length=225, null=True, blank=True)
    address = models.CharField(max_length=225, null=True, blank=True)
    bio = models.TextField()  
    image = models.ImageField(
        null=True, 
        blank=True, 
        upload_to = f"images/account/{str(datetime.now())}/",
        default='images/default_pic.png'
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_private_account = models.BooleanField(default = 0)

    otp = models.CharField(max_length=225, null=True, blank=True)

    # Define the field that will be used for authentication
    USERNAME_FIELD = 'email'
    # Add any other required fields for the `createsuperuser` management command
    REQUIRED_FIELDS = ['username', 'mobile']
    objects = UserModelManager()
    def __str__(self):
        return self.email
    def full_name(self):
        return self.first_name+" "+self.last_name

    """def save(self, *args, **kwargs):
        if not self.pk:
            # Use the set_password method to hash and set the password
            self.set_password(self.password)  # Replace 'default_password' with your desired default password
        super().save(*args, **kwargs)"""

# def get_username(instance):
#     print("instance", instance)
#     return User.objects.get(user)



class Friend(models.Model):
    current_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follower")
    friend_request = models.IntegerField(default=-1)
    created_datetime = models.DateTimeField(auto_now_add=True)
    
    
    def __str__(self):
        return str(self.current_user.username) + '  '+  str(self.friend.username)
    
    class Meta: 
      ordering = ['-created_datetime']