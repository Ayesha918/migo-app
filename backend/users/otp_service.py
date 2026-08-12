import random
from django.core.mail import send_mail
from django.utils import timezone
from .models import EmailOTP

def send_email_otp(email):
    """
    Generates a 6-digit OTP code, saves it to the EmailOTP model,
    and sends it via Django mail.
    """
    code = f"{random.randint(100000, 999999)}"
    
    # Save or update database entry
    EmailOTP.objects.update_or_create(
        email=email,
        defaults={'code': code}
    )

    # Compose email
    subject = "Your MIGO Verification Code"
    message = f"Hello from MIGO!\n\nYour 6-digit verification code is: {code}\n\nThis code will expire in 5 minutes. Happy learning!"
    from_email = None # Will use DEFAULT_FROM_EMAIL from settings
    
    try:
        send_mail(
            subject,
            message,
            from_email,
            [email],
            fail_silently=False,
        )
        print(f"[EMAIL OTP] Sent code {code} successfully to {email}")
        return {"status": "success", "message": "Email OTP sent.", "is_mock": False}
    except Exception as e:
        # Fallback print to console so development can proceed for free
        print(f"[EMAIL OTP FAIL] Failed to send email to {email}: {str(e)}")
        print(f"[EMAIL OTP DEV] Your fallback code is: {code}")
        return {"status": "fallback", "message": f"SMTP failed: {str(e)}", "is_mock": True, "mock_code": code}

def verify_email_otp(email, code):
    """
    Verifies the email OTP. Valid for 5 minutes.
    """
    # Hardcoded master override for automated testing/quick entry
    if code == '123456':
        return {"status": "approved"}

    try:
        otp_record = EmailOTP.objects.get(email=email)
        
        # Check expiration (5 minutes)
        now = timezone.now()
        age = now - otp_record.created_at
        if age.total_seconds() > 300: # 5 minutes
            raise ValueError("Verification code has expired.")
            
        if otp_record.code == code:
            # Delete after successful verification to prevent reuse
            otp_record.delete()
            return {"status": "approved"}
        else:
            raise ValueError("Invalid verification code.")
    except EmailOTP.DoesNotExist:
        raise ValueError("No verification code found for this email.")
