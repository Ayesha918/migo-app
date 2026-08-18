from django.test import TestCase
from django.contrib.auth.hashers import check_password, make_password
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import PhoneAccount, Learner

class UserAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_signup_creates_verified_account(self):
        url = reverse('signup_account')
        data = {
            'email': 'newuser@migo.com',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        account = PhoneAccount.objects.get(phone_number='newuser@migo.com')
        self.assertTrue(account.is_verified)

    def test_login_successful_immediately(self):
        PhoneAccount.objects.create(
            phone_number='user@migo.com',
            password=make_password('password123'),
            is_verified=True
        )
        url = reverse('login_account')
        data = {
            'email': 'user@migo.com',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['verified'])

    def test_duplicate_signup_rejected(self):
        PhoneAccount.objects.create(
            phone_number='existing@migo.com',
            password=make_password('password123'),
            is_verified=True
        )
        url = reverse('signup_account')
        data = {
            'email': 'existing@migo.com',
            'password': 'newpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already exists', response.data['error'])
