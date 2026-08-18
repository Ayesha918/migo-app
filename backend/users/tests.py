from django.test import TestCase
from django.core import mail
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import PhoneAccount, Learner

class UserAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Setup clean outbox
        mail.outbox = []

    def test_email_signup_sends_verification_email(self):
        url = reverse('signup_account')
        data = {
            'email': 'TEST@migo.com',
            'password': 'secretpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], 'test@migo.com')

        # Check model creation
        account = PhoneAccount.objects.get(phone_number='test@migo.com')
        self.assertFalse(account.is_verified)
        self.assertIsNotNone(account.verification_token)
        self.assertIsNotNone(account.verification_token_created_at)

        # Check outbox contains verification email
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Verify your Migo Account', mail.outbox[0].subject)
        self.assertIn(account.verification_token, mail.outbox[0].body)

    def test_unverified_user_cannot_login(self):
        # Create unverified account
        account = PhoneAccount.objects.create(
            phone_number='unverified@migo.com',
            password=make_password('password123'),
            is_verified=False
        )
        url = reverse('login_account')
        data = {
            'email': 'unverified@migo.com',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(response.data['unverified'])

    def test_verify_email(self):
        account = PhoneAccount.objects.create(
            phone_number='verify@migo.com',
            password=make_password('password123'),
            is_verified=False,
            verification_token='valid-token-123',
            verification_token_created_at=timezone.now()
        )
        url = reverse('verify_email')
        response = self.client.post(url, {'token': 'valid-token-123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        account.refresh_from_db()
        self.assertTrue(account.is_verified)
        self.assertIsNone(account.verification_token)

    def test_verify_email_expired(self):
        account = PhoneAccount.objects.create(
            phone_number='verify@migo.com',
            password=make_password('password123'),
            is_verified=False,
            verification_token='expired-token-123',
            verification_token_created_at=timezone.now() - timezone.timedelta(days=2) # 48 hours ago
        )
        url = reverse('verify_email')
        response = self.client.post(url, {'token': 'expired-token-123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expired', response.data['error'])

    def test_duplicate_signup_verified(self):
        PhoneAccount.objects.create(
            phone_number='verified@migo.com',
            password=make_password('password123'),
            is_verified=True
        )
        url = reverse('signup_account')
        response = self.client.post(url, {'email': 'verified@migo.com', 'password': 'newpassword123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already exists', response.data['error'])

    def test_duplicate_signup_unverified(self):
        account = PhoneAccount.objects.create(
            phone_number='unverified@migo.com',
            password=make_password('password123'),
            is_verified=False,
            verification_token='old-token'
        )
        url = reverse('signup_account')
        response = self.client.post(url, {'email': 'unverified@migo.com', 'password': 'newpassword123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('verification email has been sent', response.data['message'])

        account.refresh_from_db()
        self.assertNotEqual(account.verification_token, 'old-token')
        self.assertEqual(len(mail.outbox), 1)

    def test_forgot_password_sends_email(self):
        account = PhoneAccount.objects.create(
            phone_number='reset@migo.com',
            password=make_password('old-pass'),
            is_verified=True
        )
        url = reverse('forgot_password')
        response = self.client.post(url, {'email': 'reset@migo.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        account.refresh_from_db()
        self.assertIsNotNone(account.password_reset_token)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(account.password_reset_token, mail.outbox[0].body)

    def test_reset_password(self):
        account = PhoneAccount.objects.create(
            phone_number='reset@migo.com',
            password=make_password('old-pass'),
            is_verified=True,
            password_reset_token='reset-token-999',
            password_reset_token_created_at=timezone.now()
        )
        url = reverse('reset_password')
        response = self.client.post(url, {'token': 'reset-token-999', 'password': 'new-super-password'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        account.refresh_from_db()
        self.assertIsNone(account.password_reset_token)
        self.assertTrue(check_password('new-super-password', account.password))

    def test_reset_password_token_reuse_fails(self):
        account = PhoneAccount.objects.create(
            phone_number='reset@migo.com',
            password=make_password('old-pass'),
            is_verified=True,
            password_reset_token=None
        )
        url = reverse('reset_password')
        response = self.client.post(url, {'token': 'reset-token-999', 'password': 'new-super-password'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
