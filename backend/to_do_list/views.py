from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError 
from .models import User, Task
from .serializers import UserRegistrationSerializer, UserSerializer, LoginSerializer
from .utils import CreateResponse


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
