from datetime import timedelta
from django.db.models import Q
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError 
from .models import User, Task
from .serializers import UserRegistrationSerializer, UserSerializer, LoginSerializer, TaskSerializer
from .utils import CreateResponse
from .permissions import IsTaskCreator
from rest_framework_simplejwt.views import TokenRefreshView

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            request.data['refresh'] = refresh_token
            
        response = super().post(request, *args, **kwargs)
        
        # If refresh was successful, add user data
        if response.status_code == 200 and 'access' in response.data:
            try:
                # Get user from refresh token
                refresh = RefreshToken(refresh_token)
                user_id = refresh.payload.get('user_id')
                user = User.objects.get(id=user_id)
                
                # Add user data to response
                response.data['user'] = {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            except (User.DoesNotExist, TokenError):
                pass
                
        return response


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def _get_user_response(self, user):
        """Helper method to format user responses consistently"""
        return Response(self.get_serializer(user).data)

    @action(detail=False, methods=['get', 'put'], permission_classes=[IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            return self._get_user_response(request.user)
        
        serializer = self.get_serializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return self._get_user_response(request.user)
    
    # for updating first_name or second_name
    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def update_field(self, request):
        field = request.data.get('field')
        value = request.data.get('value')
        
        if field not in ['email', 'contact_number'] or not value:
            return Response(
                {"detail": "Invalid or missing field/value"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        setattr(request.user, field, value)
        request.user.save()
        return self._get_user_response(request.user)
    
    @action(detail=True, methods=['get'])
    def get_user(self, request, pk=None):
        user = get_object_or_404(User, pk=pk)
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
class UserRegistrationViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [] 

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        user = User.objects.get(username=serializer.data['username'])
        refresh = RefreshToken.for_user(user)
        headers = self.get_success_headers(serializer.data)
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED, headers=headers)
        
class LoginViewSet(viewsets.ViewSet):
    permission_classes = []
    def create(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        refresh = RefreshToken.for_user(user)
        response = Response(
            CreateResponse.create_user_response(user, token_data=refresh),
            status=status.HTTP_200_OK
        )
        
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            max_age=1209600,  # 14 days
            httponly=True,
            secure=True,
            samesite='Lax',
            path='/',
            domain=None,
        )
        return response


class LogoutViewSet(viewsets.ViewSet):
    def create(self, request):

        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError as e:
                print(f"Token blacklist error: {str(e)}")
        else:
            print("No refresh_token cookie found to blacklist")
        
        response = Response(
            {"detail": "Successfully logged out."},
            status=status.HTTP_200_OK
        )
        
        # Clear cookie with same settings as login
        response.set_cookie(
            key='refresh_token',
            value='Token from South Park',  # Easily identifiable in browser dev tools
            max_age=0,
            expires=0,  # Immediate expiration
            path='/',
            domain=None,
            secure=True,
            httponly=True,
            samesite='Lax'
        )
        
        return response

class TaskPaginator(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        return Response({
            'pagination': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'current_page': self.page.number,
                'total_pages': self.page.paginator.num_pages,
                'page_size': self.page_size,
                'total_items': self.page.paginator.count
            },
            'results': data
        })
        
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter, DjangoFilterBackend]
    ordering_fields = ['created_at', 'updated_at', 'status', 'title']
    search_fields = ['title', 'description']
    ordering = ['-created_at']  # Default ordering
    filterset_fields = ['status']
    pagination_class = TaskPaginator

    def get_base_queryset(self):
        """Base queryset without any user filtering"""
        return Task.objects.all()

    def get_queryset(self):
        """
        Returns queryset filtered based on request parameters and user permissions.
        This is used by DRF for the standard list/retrieve/update/destroy actions.
        """
        queryset = self.get_base_queryset()
        
        # For standard list view, show all tasks (or filter by user_id if provided)
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user__id=user_id)
            
        return queryset

    def get_permissions(self):
        """
        Custom permission handling:
        - For create/list: only require IsAuthenticated
        - For update/delete: require IsTaskCreator
        """
        if self.action in ['update', 'partial_update', 'destroy', 
                         'complete', 'update_title', 'update_description']:
            self.permission_classes = [IsAuthenticated, IsTaskCreator]
        return super().get_permissions()

    def perform_create(self, serializer):
        """Automatically set the user to the current user when creating a task."""
        serializer.save(user=self.request.user)

    def _get_filtered_queryset(self, base_queryset=None):
        """
        Shared method to apply filtering, ordering and searching to any queryset.
        """
        queryset = base_queryset if base_queryset is not None else self.get_base_queryset()
        return self.filter_queryset(queryset)

    def _get_paginated_response(self, queryset):
        """Shared method to paginate and serialize a queryset"""
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        return Response({
            'pagination': {
                'next': None,
                'previous': None,
                'current_page': 1,
                'total_pages': 1,
                'page_size': self.pagination_class.page_size,
                'total_items': queryset.count()
            },
            'results': []
        })

    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """
        Get all tasks for the currently authenticated user.
        Supports all the same filtering/ordering as the main list view.
        """
        queryset = self.get_base_queryset().filter(user=request.user)
        filtered_queryset = self._get_filtered_queryset(queryset)
        return self._get_paginated_response(filtered_queryset)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search tasks by title containing the search term.
        Supports all the same filtering/ordering as the main list view.
        """
        search_term = request.query_params.get('q')
        if not search_term:
            return Response(
                {"detail": "Search term 'q' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Start with base search queryset
        queryset = self.get_base_queryset().filter(
            Q(title__icontains=search_term)
        )
        
        # Apply all filters and ordering
        filtered_queryset = self._get_filtered_queryset(queryset)
        return self._get_paginated_response(filtered_queryset)

    def list(self, request, *args, **kwargs):
        """
        List all tasks (or filtered by user_id if provided).
        Supports filtering by status and ordering by any field.
        """
        queryset = self._get_filtered_queryset()
        return self._get_paginated_response(queryset)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = 'COMPLETED'
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_title(self, request, pk=None):
        task = self.get_object()
        print(f"Checking title edit for task created at {task.created_at}")  # Debug logging
        print(f"Current time: {timezone.now()}")  # Debug logging
        print(f"Can edit title: {task.can_edit_title()}")  # Debug logging
        
        if not task.can_edit_title():
            return Response(
                {"detail": "Title can only be updated within 5 minutes of creation"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        title = request.data.get('title')
        if not title:
            return Response(
                {"detail": "Title is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if Task.objects.filter(user=task.user, title=title).exclude(pk=task.pk).exists():
            return Response(
                {"detail": "You already have a task with this title"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        task.title = title
        task.save()
        return Response(self.get_serializer(task).data)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsTaskCreator])
    def update_description(self, request, pk=None):
        task = self.get_object()
        description = request.data.get('description', '')
        
        task.description = description
        task.save()
        return Response(self.get_serializer(task).data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {"detail": "Status is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if new_status not in dict(Task.STATUS_CHOICES):
            return Response(
                {"detail": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not task.can_change_to_new() and new_status == 'NEW':
            return Response(
                {"detail": "Cannot set status back to NEW once task has progressed"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        task.status = new_status
        task.save()
        return Response(self.get_serializer(task).data)
    
    @action(detail=True, methods=['get'])
    def can_edit_title(self, request, pk=None):
        task = self.get_object()
        return Response({
            'can_edit': task.can_edit_title(),
            'created_at': task.created_at,
            'current_time': timezone.now(),
            'cutoff_time': task.created_at + timedelta(minutes=5)
        })

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        self.perform_destroy(task)
        return Response(
            {"detail": "Task deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )