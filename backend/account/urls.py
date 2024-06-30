from django.urls import path
from .views import *
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('signup/', AccountCreateAPI.as_view(), name="signup"),
    path('signin/', LoginView.as_view(), name="signin"),
    path('profile/', ProfileAPI.as_view(), name = "profile"),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('otp-verify/', OTPVerificationView.as_view(), name='otp-verify'),
    #path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),

    #path('profile/<str:username>/', ProfileAPI.as_view(), name = "profile"),
    #path('account/<str:username>/', AccountAPI.as_view(), name="account"),
]
