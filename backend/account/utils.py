from django.core.mail import send_mail
from django.conf import settings
from account.models import User
def send_otp_email(email, otp):
    try:
        subject = 'Password Reset OTP'
        message = f'Your OTP for password reset is: {otp}'
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        send_mail(subject, message, from_email, recipient_list)
        user = User.objects.get(email = email)
        user.otp = otp
        user.save()
    except Exception as e:
        print("exception ------------- ",e )
        return False
    return True
