import urllib.request
import urllib.parse
import base64
import json
from decouple import config

TWILIO_ACCOUNT_SID = config('TWILIO_ACCOUNT_SID', default='')
TWILIO_AUTH_TOKEN = config('TWILIO_AUTH_TOKEN', default='')
TWILIO_VERIFY_SERVICE_SID = config('TWILIO_VERIFY_SERVICE_SID', default='')
DEBUG = config('DEBUG', default=True, cast=bool)

def send_real_otp(phone_number):
    """
    Sends an OTP verification code via Twilio Verify API.
    """
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_VERIFY_SERVICE_SID:
        if DEBUG:
            # Dev fallback
            print(f"[OTP DEV] Simulated sending code to {phone_number}")
            return {"status": "pending", "message": "Development mock OTP sent."}
        else:
            raise ValueError("Twilio credentials are not configured in production settings.")

    url = f"https://verify.twilio.com/v2/Services/{TWILIO_VERIFY_SERVICE_SID}/Verifications"
    data = urllib.parse.urlencode({
        'To': phone_number,
        'Channel': 'sms'
    }).encode('utf-8')

    req = urllib.request.Request(url, data=data, method='POST')
    
    # Basic Auth
    auth_str = f"{TWILIO_ACCOUNT_SID}:{TWILIO_AUTH_TOKEN}"
    auth_b64 = base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')
    req.add_header("Authorization", f"Basic {auth_b64}")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        try:
            err_json = json.loads(err_msg)
            message = err_json.get("message", "Failed to send OTP.")
        except Exception:
            message = f"HTTP Error {e.code}"
        raise ValueError(message)

def verify_real_otp(phone_number, code):
    """
    Verifies the OTP code via Twilio Verify API.
    """
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_VERIFY_SERVICE_SID:
        if DEBUG:
            # Dev fallback: mock code 123456
            if code == '123456':
                return {"status": "approved"}
            else:
                raise ValueError("Invalid verification code (Mock mode).")
        else:
            raise ValueError("Twilio credentials are not configured in production settings.")

    url = f"https://verify.twilio.com/v2/Services/{TWILIO_VERIFY_SERVICE_SID}/VerificationCheck"
    data = urllib.parse.urlencode({
        'To': phone_number,
        'Code': code
    }).encode('utf-8')

    req = urllib.request.Request(url, data=data, method='POST')
    
    # Basic Auth
    auth_str = f"{TWILIO_ACCOUNT_SID}:{TWILIO_AUTH_TOKEN}"
    auth_b64 = base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')
    req.add_header("Authorization", f"Basic {auth_b64}")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        try:
            err_json = json.loads(err_msg)
            message = err_json.get("message", "Failed to verify OTP.")
        except Exception:
            message = f"HTTP Error {e.code}"
        raise ValueError(message)
