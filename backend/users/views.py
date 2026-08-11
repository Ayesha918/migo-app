# backend/users/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Learner, PhoneAccount, DeviceSession
from .serializers import LearnerSerializer
from .otp_service import send_real_otp, verify_real_otp


def normalize_phone_number(phone):
    """
    Cleans and normalizes phone number to E.164 format.
    E.g. '9876543210' -> '+919876543210'
    """
    cleaned = ''.join(c for c in phone if c.isdigit() or c == '+')
    if not cleaned.startswith('+'):
        cleaned = f"+91{cleaned}"
    return cleaned


@api_view(['POST'])
def register_learner(request):
    """
    POST /api/users/register
    Body: { name, age, known_language, learning_language, avatar, phone_number, device_id }
    Creates a new Learner, links it to PhoneAccount, and returns the generated learner_id.
    """
    phone_number = request.data.get('phone_number')
    device_id = request.data.get('device_id')

    serializer = LearnerSerializer(data=request.data)
    if serializer.is_valid():
        learner = serializer.save()

        if phone_number:
            normalized = normalize_phone_number(phone_number)
            phone_account, _ = PhoneAccount.objects.get_or_create(phone_number=normalized)
            learner.phone_account = phone_account
            learner.save()

            if device_id:
                DeviceSession.objects.get_or_create(phone_account=phone_account, device_id=device_id)

        return Response(LearnerSerializer(learner).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def search_learner(request):
    """
    GET /api/users/search?learner_id=MG000001
    GET /api/users/search?name=ravi
    Returns matching learner(s) for the Login screen.
    """
    learner_id = request.query_params.get('learner_id', '').strip()
    name = request.query_params.get('name', '').strip()

    if not learner_id and not name:
        return Response(
            {'error': 'Provide either learner_id or name to search.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if learner_id:
        # Exact match expected for a Learner ID
        learners = Learner.objects.filter(learner_id__iexact=learner_id)
    else:
        # Partial, case-insensitive match for name search
        learners = Learner.objects.filter(name__icontains=name)

    if not learners.exists():
        return Response(
            {'error': 'No matching learner found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = LearnerSerializer(learners, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def send_otp(request):
    """
    POST /api/users/otp/send
    Body: { phone_number }
    Sends a 6-digit OTP code to the actual phone number via Twilio Verify API.
    """
    phone_number = request.data.get('phone_number')
    if not phone_number:
        return Response({'error': 'Phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    normalized = normalize_phone_number(phone_number)
    try:
        send_real_otp(normalized)
        return Response({'message': 'OTP sent successfully.'}, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def verify_otp(request):
    """
    POST /api/users/otp/verify
    Body: { phone_number, otp, device_id }
    Verifies the OTP via Twilio Verify API and creates PhoneAccount/DeviceSession.
    """
    phone_number = request.data.get('phone_number')
    otp = request.data.get('otp')
    device_id = request.data.get('device_id')

    if not phone_number or not otp:
        return Response({'error': 'Phone number and OTP are required.'}, status=status.HTTP_400_BAD_REQUEST)

    normalized = normalize_phone_number(phone_number)
    try:
        check_res = verify_real_otp(normalized, otp)
        if check_res.get('status') == 'approved':
            # Success: Get or create phone account
            phone_account, _ = PhoneAccount.objects.get_or_create(phone_number=normalized)

            # Register device session if device_id is provided
            if device_id:
                DeviceSession.objects.get_or_create(phone_account=phone_account, device_id=device_id)

            return Response({'verified': True, 'phone_number': normalized}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Verification code is incorrect or expired.'}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def check_device(request):
    """
    GET /api/users/check-device?learner_id=MG000001&device_id=abc
    Checks if device_id is trusted for learner's phone account.
    """
    learner_id = request.query_params.get('learner_id', '').strip()
    device_id = request.query_params.get('device_id', '').strip()

    if not learner_id or not device_id:
        return Response({'error': 'Provide both learner_id and device_id.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        learner = Learner.objects.get(learner_id__iexact=learner_id)
    except Learner.DoesNotExist:
        return Response({'error': 'Learner not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Legacy fallback: if learner has no phone account, skip verification (trusted directly)
    if not learner.phone_account:
        return Response({'verified': True}, status=status.HTTP_200_OK)

    # Check if a DeviceSession exists
    exists = DeviceSession.objects.filter(phone_account=learner.phone_account, device_id=device_id).exists()
    return Response({'verified': exists}, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_phone_learners(request):
    """
    GET /api/users/phone-learners?phone_number=+91XXXX
    Returns all learners linked to this phone number.
    """
    phone_number = request.query_params.get('phone_number', '').strip()
    if not phone_number:
        return Response({'error': 'Phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

    normalized = normalize_phone_number(phone_number)
    try:
        phone_account = PhoneAccount.objects.get(phone_number=normalized)
        learners = phone_account.learners.all()
    except PhoneAccount.DoesNotExist:
        learners = Learner.objects.none()

    serializer = LearnerSerializer(learners, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)