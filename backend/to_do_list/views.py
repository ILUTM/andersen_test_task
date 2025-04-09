from django.shortcuts import render, get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError 
from .models import User, Task
from .serializers import UserRegistrationSerializer, UserSerializer, LoginSerializer, TaskSerializer
from .utils import CreateResponse
from .permissions import IsTaskCreator


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

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
            secure=True,  # Must match SameSite=None
            samesite='None',  # Crucial for cross-origin
            path='/',
            domain=None,  # Let browser handle domain
        )
        return response


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter, DjangoFilterBackend]  
    ordering_fields = ['created_at', 'updated_at', 'title']
    search_fields = ['title']
    ordering = ['-created_at']
    filterset_fields = ['status']  

    def get_queryset(self):
        # Filter by status if provided in query params
        queryset = Task.objects.all()
        status = self.request.query_params.get('status', None)
        if status is not None:
            queryset = queryset.filter(status=status)
        return queryset

    def get_permissions(self):
        # Only require IsTaskCreator for update/delete actions
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsTaskCreator]
        return super().get_permissions()

    def perform_create(self, serializer):
        # Automatically set the user to the current user when creating
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        tasks = Task.objects.filter(user=request.user)
        page = self.paginate_queryset(tasks)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTaskCreator])
    def complete(self, request, pk=None):
        # Mark a task as completed
        task = self.get_object()
        task.status = 'COMPLETED'
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsTaskCreator])
    def update_title(self, request, pk=None):
        task = self.get_object()
        
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
    
    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        self.perform_destroy(task)
        return Response(status=status.HTTP_204_NO_CONTENT)