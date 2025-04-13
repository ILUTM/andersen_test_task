from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from to_do_list.models import Task, User

class TaskTests(APITestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            first_name='Test'
        )
        
        # Create another user for permission tests
        self.other_user = User.objects.create_user(
            username='otheruser',
            password='otherpass123',
            first_name='Other'
        )
        
        # Create test task
        self.task = Task.objects.create(
            user=self.user,
            title='Test Task',
            description='Test Description',
            status='NEW'
        )
        
        # Authenticate the test client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # URLs
        self.task_list_url = reverse('task-list')
        self.task_detail_url = reverse('task-detail', kwargs={'pk': self.task.id})

    # List and Retrieve Tests
    def test_get_task_list(self):
        response = self.client.get(self.task_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)  # Assuming pagination

    def test_get_task_detail(self):
        response = self.client.get(self.task_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Task')

    # Create Tests
    def test_create_task(self):
        data = {
            'title': 'New Task',
            'description': 'New Description',
            'status': 'NEW'
        }
        response = self.client.post(self.task_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 2)
        self.assertEqual(response.data['user'], self.user.id)

    def test_create_task_invalid_data(self):
        data = {
            'description': 'Missing title'
        }
        response = self.client.post(self.task_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    # Update Tests
    def test_update_task(self):
        data = {
            'title': 'Updated Task',
            'description': 'Updated Description'
        }
        response = self.client.patch(self.task_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.title, 'Updated Task')

    def test_update_task_status(self):
        data = {'status': 'COMPLETED'}
        response = self.client.patch(self.task_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, 'COMPLETED')

    # Permission Tests
    def test_update_other_users_task(self):
        # Switch to other user
        self.client.force_authenticate(user=self.other_user)
        
        data = {'title': 'Should Not Work'}
        response = self.client.patch(self.task_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_other_users_task(self):
        # Switch to other user
        self.client.force_authenticate(user=self.other_user)
        
        response = self.client.delete(self.task_detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # Delete Tests
    def test_delete_task(self):
        response = self.client.delete(self.task_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)

    # Filter Tests
    def test_filter_tasks_by_status(self):
        # Create tasks with different statuses
        Task.objects.create(
            user=self.user,
            title='Completed Task',
            status='COMPLETED'
        )
        
        response = self.client.get(self.task_list_url, {'status': 'COMPLETED'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['status'], 'COMPLETED')