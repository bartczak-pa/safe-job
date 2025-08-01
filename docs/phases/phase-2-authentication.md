# Phase 2: Authentication & User Management - Detailed Implementation Plan

**Duration**: Week 2 (7 days)

**Dependencies**: Phase 1 completion

**Risk Level**: Medium (magic link implementation complexity)

**Team**: 1 full-stack developer + Claude Code

## Overview

Phase 2 implements the complete authentication and user management system for the Safe Job platform. This includes passwordless magic link authentication, JWT token management, user profile system, and the foundation for candidate/employer differentiation. This phase is critical as it establishes the security foundation for all subsequent features.

## Success Criteria

- [ ] Magic link authentication system fully operational
- [ ] JWT token management with secure refresh mechanism
- [ ] User registration and profile management complete
- [ ] Email verification workflow functional
- [ ] Frontend authentication UI with state management
- [ ] Security audit passed with no critical vulnerabilities

## Detailed Task Breakdown

### 2.1 Magic Link Authentication System

#### 2.1.1 Backend Authentication Infrastructure

**Duration**: 1.5 days

**Priority**: Critical

**Risk Level**: High

**Tasks:**

- [ ] Implement custom User model with email-based authentication
- [ ] Create magic link token generation and validation system
- [ ] Set up secure JWT token authentication with DRF
- [ ] Implement email verification workflow with Resend
- [ ] Create authentication middleware and permissions

**Acceptance Criteria:**

- User model supports email-only authentication (no passwords)
- Magic link tokens are cryptographically secure with expiration
- JWT tokens properly signed and validated
- Email delivery successful with proper error handling
- Security vulnerabilities tested and mitigated

**Implementation Details:**

**Custom User Model (`users/models.py`):**

```python
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.gis.db import models
import uuid

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True)
    language_preference = models.CharField(max_length=5, default='en')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def generate_username(self):
        """Generate unique username from email"""
        base = self.email.split('@')[0].lower()
        username = base
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{counter}"
            counter += 1
        return username
```

**Magic Link System (`authentication/utils/magic_link.py`):**

```python
import secrets
import hashlib
from datetime import datetime, timedelta
from django.core.cache import cache
from django.urls import reverse
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class MagicLinkManager:
    EXPIRY_MINUTES = 15
    TOKEN_LENGTH = 32

    @classmethod
    def generate_magic_link(cls, user, request_type='login'):
        """Generate secure magic link token"""
        token = secrets.token_urlsafe(cls.TOKEN_LENGTH)

        # Store token with expiry
        cache_key = f"magic_link:{token}"
        cache_data = {
            'user_id': str(user.id),
            'email': user.email,
            'type': request_type,
            'created_at': datetime.now().isoformat()
        }
        cache.set(cache_key, cache_data, timeout=cls.EXPIRY_MINUTES * 60)

        # Generate URL
        verify_url = reverse('authentication:verify-magic-link')
        return f"{settings.FRONTEND_URL}{verify_url}?token={token}"

    @classmethod
    def verify_magic_link(cls, token):
        """Verify and consume magic link token"""
        cache_key = f"magic_link:{token}"
        data = cache.get(cache_key)

        if not data:
            return None, "Token expired or invalid"

        # Delete token (single use)
        cache.delete(cache_key)

        try:
            user = User.objects.get(id=data['user_id'])
            return user, None
        except User.DoesNotExist:
            return None, "User not found"
```

**JWT Authentication (`authentication/jwt.py`):**

```python
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model

User = get_user_model()

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user = User.objects.get(id=payload['user_id'])
            return (user, token)
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
            raise AuthenticationFailed('Invalid token')

    @staticmethod
    def generate_token(user):
        """Generate JWT token for user"""
        payload = {
            'user_id': str(user.id),
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(days=7),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
```

#### 2.1.2 Authentication API Endpoints

**Duration**: 1 day

**Priority**: Critical

**Tasks:**

- [ ] Create user registration endpoint with email verification
- [ ] Implement magic link request endpoint
- [ ] Build magic link validation endpoint with JWT generation
- [ ] Create secure logout and token refresh functionality
- [ ] Add user profile management endpoints

**Acceptance Criteria:**

- Registration creates user and sends verification email
- Magic link request generates and emails secure token
- Token validation returns JWT for authenticated requests
- Logout invalidates tokens properly
- Profile endpoints require authentication

**API Endpoints (`authentication/api/views.py`):**

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register new user with email verification"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # Send verification email
        magic_link = MagicLinkManager.generate_magic_link(user, 'verify_email')
        EmailService.send_verification_email(user.email, magic_link)

        return Response({
            'message': 'Registration successful. Check your email for verification link.',
            'user_id': str(user.id)
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def request_magic_link(request):
    """Request magic link for login"""
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email__iexact=email)
        magic_link = MagicLinkManager.generate_magic_link(user, 'login')
        EmailService.send_magic_link_email(user.email, magic_link)

        return Response({'message': 'Magic link sent to your email'})
    except User.DoesNotExist:
        # Don't reveal if user exists
        return Response({'message': 'If an account exists, magic link has been sent'})

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_magic_link(request):
    """Verify magic link and return JWT token"""
    token = request.data.get('token')
    if not token:
        return Response({'error': 'Token required'}, status=status.HTTP_400_BAD_REQUEST)

    user, error = MagicLinkManager.verify_magic_link(token)
    if error:
        return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

    # Mark email as verified if this was verification link
    if not user.email_verified:
        user.email_verified = True
        user.save()

    # Generate JWT token
    jwt_token = JWTAuthentication.generate_token(user)

    return Response({
        'token': jwt_token,
        'user': UserSerializer(user).data
    })
```

#### 2.1.3 Frontend Authentication Components

**Duration**: 1.5 days

**Priority**: Critical

**Tasks:**

- [ ] Build registration and login forms with validation
- [ ] Implement magic link request and verification flows
- [ ] Create protected route components and auth guards
- [ ] Add authentication state management with persistence
- [ ] Build user profile editing interface

**Acceptance Criteria:**

- Registration form validates input and shows success/error states
- Magic link flow provides clear user feedback
- Protected routes redirect unauthenticated users
- Authentication state persists across browser sessions
- Profile editing form updates user data

**Authentication Context (`src/store/authStore.ts`):**

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  languagePreference: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: (token: string, user: User) => {
        set({ token, user, isAuthenticated: true });
        // Set token in axios defaults
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        delete axios.defaults.headers.common["Authorization"];
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
```

**Login Component (`src/components/auth/LoginForm.tsx`):**

```typescript
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authAPI } from '../../services/authAPI'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [linkSent, setLinkSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await authAPI.requestMagicLink(data.email)
      setLinkSent(true)
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (linkSent) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
        <p className="text-gray-600">
          We've sent a magic link to your email address. Click the link to log in.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('email')}
          type="email"
          placeholder="Enter your email address"
          error={errors.email?.message}
        />
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Send Magic Link
      </Button>
    </form>
  )
}
```

### 2.2 User Profile System

#### 2.2.1 User Model and Profile Architecture

**Duration**: 1 day

**Priority**: High

**Tasks:**

- [ ] Extend User model with profile-specific fields
- [ ] Create separate profile models for candidates and employers
- [ ] Implement profile completion workflow and validation
- [ ] Add profile image upload with S3 integration
- [ ] Create profile visibility and privacy settings

**Acceptance Criteria:**

- User model contains all necessary profile fields
- Candidate and employer profiles properly linked to users
- Profile completion tracking works accurately
- Image upload saves to S3 with proper permissions
- Privacy settings control profile visibility

**Profile Models:**

```python
# candidates/models.py
class CandidateProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=10, blank=True)
    country = models.CharField(max_length=100, default='Netherlands')

    # Work preferences
    preferred_work_types = models.JSONField(default=list)  # ['temporary', 'contract', 'permanent']
    availability = models.JSONField(default=dict)  # {'days': [], 'hours': {}}
    willing_to_relocate = models.BooleanField(default=False)
    transport_available = models.BooleanField(default=False)

    # Skills and experience
    skills = models.ManyToManyField('jobs.Skill', blank=True)
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    languages = models.JSONField(default=list)  # [{'language': 'en', 'level': 'native'}]

    # Profile completion
    profile_completion_percentage = models.PositiveIntegerField(default=0)
    onboarding_completed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# employers/models.py
class EmployerProfile(models.Model):
    VERIFICATION_CHOICES = [
        ('unverified', 'Unverified'),
        ('pending', 'Pending Verification'),
        ('basic', 'Basic Verification'),
        ('verified', 'Verified'),
        ('premium', 'Premium Verified')
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employer_profile')
    company_name = models.CharField(max_length=200)
    kvk_number = models.CharField(max_length=20, unique=True)  # Dutch Chamber of Commerce
    vat_number = models.CharField(max_length=20, blank=True)

    # Company details
    industry = models.CharField(max_length=100, blank=True)
    company_size = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)

    # Contact information
    contact_person = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)

    # Verification status
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_CHOICES, default='unverified')
    verification_date = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True)

    # Platform permissions
    can_post_jobs = models.BooleanField(default=False)
    can_contact_candidates = models.BooleanField(default=False)
    max_active_jobs = models.PositiveIntegerField(default=5)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 2.2.2 Profile Management Features

**Duration**: 1 day

**Priority**: High

**Tasks:**

- [ ] Build comprehensive profile editing API endpoints
- [ ] Implement profile completion progress tracking
- [ ] Create profile visibility and privacy controls
- [ ] Add profile deactivation and account deletion
- [ ] Build profile image upload with validation

**Acceptance Criteria:**

- Profile editing updates all relevant fields
- Completion percentage calculates correctly
- Privacy settings properly enforced
- Deactivation preserves data appropriately
- Image upload validates file types and sizes

**Profile API Endpoints:**

```python
# candidates/api/views.py
class CandidateProfileViewSet(viewsets.ModelViewSet):
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CandidateProfile.objects.filter(user=self.request.user)

    def get_object(self):
        profile, created = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile

    def perform_update(self, serializer):
        instance = serializer.save()
        # Update completion percentage
        instance.update_completion_percentage()
        instance.save()

    @action(detail=False, methods=['post'])
    def upload_avatar(self, request):
        """Upload profile avatar image"""
        file = request.FILES.get('avatar')
        if not file:
            return Response({'error': 'No file provided'}, status=400)

        # Validate file
        if file.size > 5 * 1024 * 1024:  # 5MB limit
            return Response({'error': 'File too large'}, status=400)

        if not file.content_type.startswith('image/'):
            return Response({'error': 'Invalid file type'}, status=400)

        # Upload to S3
        profile = self.get_object()
        profile.avatar = file
        profile.save()

        return Response({'avatar_url': profile.avatar.url})
```

## Risk Mitigation Strategies

### Security Risks

1. **Magic Link Token Security**
   - **Risk**: Tokens could be intercepted or guessed
   - **Mitigation**: Use cryptographically secure tokens, short expiry, single-use
   - **Testing**: Penetration testing for token vulnerabilities

2. **JWT Token Management**
   - **Risk**: Token hijacking or replay attacks
   - **Mitigation**: Short expiry times, secure storage, proper signing
   - **Monitoring**: Log suspicious authentication attempts

3. **Email Verification Bypass**
   - **Risk**: Users accessing system without email verification
   - **Mitigation**: Strict verification checks on sensitive operations
   - **Enforcement**: Block key features until verified

### Technical Risks

1. **Email Delivery Issues**
   - **Risk**: Magic links not delivered due to SMTP issues
   - **Mitigation**: Use reliable service (Resend), implement delivery tracking
   - **Fallback**: Backup authentication method

2. **State Management Complexity**
   - **Risk**: Authentication state inconsistencies in frontend
   - **Mitigation**: Use proven state management (Zustand), persist properly
   - **Testing**: Comprehensive state transition testing

## Testing Strategy

### Security Testing

- [ ] Test magic link token generation and validation
- [ ] Verify JWT token security and expiration
- [ ] Test authentication bypass attempts
- [ ] Validate email verification requirements
- [ ] Test rate limiting on authentication endpoints

### Functional Testing

- [ ] Complete user registration and verification flow
- [ ] Magic link login process
- [ ] Profile creation and editing
- [ ] Authentication state management
- [ ] Protected route access control

### Integration Testing

- [ ] Frontend-backend authentication flow
- [ ] Email service integration
- [ ] S3 image upload functionality
- [ ] Database profile relationships

## Performance Considerations

### Backend Optimization

- Database indexing on email and user ID fields
- Caching for frequently accessed user data
- Connection pooling for database operations
- Rate limiting to prevent abuse

### Frontend Optimization

- Lazy loading of profile components
- Optimistic updates for profile changes
- Image optimization and compression
- Efficient state updates and re-renders

## Security Audit Checklist

### Authentication Security

- [ ] Magic link tokens are cryptographically secure
- [ ] Token expiration properly enforced
- [ ] JWT tokens properly signed and validated
- [ ] Session management secure
- [ ] Password-related vulnerabilities N/A (passwordless)

### Data Protection

- [ ] Profile data properly encrypted in transit
- [ ] Sensitive data not logged
- [ ] File uploads validated and sanitized
- [ ] Database access properly restricted
- [ ] Privacy settings enforced

## Documentation Requirements

### API Documentation

- [ ] Authentication endpoint documentation
- [ ] Profile management API documentation
- [ ] Error response documentation
- [ ] Rate limiting documentation

### Frontend Documentation

- [ ] Component library documentation
- [ ] State management guide
- [ ] Authentication flow documentation
- [ ] Protected routes implementation

## Deliverables Checklist

### Backend Deliverables

- [ ] Complete User model with authentication
- [ ] Magic link authentication system
- [ ] JWT token management
- [ ] Profile models and API endpoints
- [ ] Email service integration

### Frontend Deliverables

- [ ] Authentication components and forms
- [ ] State management for authentication
- [ ] Protected route system
- [ ] Profile management interface
- [ ] Image upload functionality

### Security Deliverables

- [ ] Security audit report
- [ ] Penetration testing results
- [ ] Authentication flow documentation
- [ ] Security configuration guide

## Next Phase Preparation

### Phase 3 Prerequisites

- [ ] Employer verification workflow designed
- [ ] Document upload system planned
- [ ] Job posting model structure defined
- [ ] Admin interface requirements documented

This comprehensive plan ensures Phase 2 delivers a secure, user-friendly authentication system that forms the foundation for all subsequent platform features.
