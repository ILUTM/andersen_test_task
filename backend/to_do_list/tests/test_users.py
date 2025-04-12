import unittest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from to_do_list.models import User
from to_do_list import views
import json

class UserRegistrationTests(APITestCase):
    def setUp(self):
        self.url = reverse('register-list')
        self.valid_data = {
            'username': 'newuser',
            'password': 'newpass123',
            'first_name': 'John',
            'last_name': 'Doe'
        }

    def test_successful_registration(self):
        response = self.client.post(self.url, self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_registration_missing_required_fields(self):
        invalid_data = {
            'username': 'newuser',
            'password': 'short'  # Missing first_name
        }
        response = self.client.post(self.url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('first_name', response.data)

    def test_registration_duplicate_username(self):
        # Create a user first
        User.objects.create_user(
            username='existinguser',
            password='testpass123',
            first_name='Existing'
        )
        duplicate_data = {
            'username': 'existinguser',
            'password': 'testpass123',
            'first_name': 'Duplicate'
        }
        response = self.client.post(self.url, duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
class AuthenticationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            first_name='Test'
        )
        self.login_url = reverse('login-list')
        self.logout_url = reverse('logout-list')

    def test_successful_login(self):
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertTrue(response.cookies.get('refresh_token'))

    def test_login_invalid_credentials(self):
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_successful_logout(self):
        # First login to get cookies
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        self.client.cookies = login_response.cookies
        
        # Then logout
        response = self.client.post(self.logout_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.cookies.get('refresh_token').value, '')
 
        
class UserProfileTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)
        self.me_url = reverse('user-me')

    def test_get_current_user_profile(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_update_user_profile(self):
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        response = self.client.put(self.me_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        
        
class TokenRefreshTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            first_name='Test'
        )
        self.refresh_url = reverse('token_refresh')
        
        # First login to get refresh token
        login_url = reverse('login-list')
        login_response = self.client.post(login_url, {
            'username': 'testuser',
            'password': 'testpass123'
        }, format='json')
        self.refresh_token = login_response.cookies.get('refresh_token').value

    def test_token_refresh_with_cookie(self):
        self.client.cookies['refresh_token'] = self.refresh_token
        response = self.client.post(self.refresh_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)