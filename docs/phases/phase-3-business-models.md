# Phase 3: Core Business Models & APIs - Detailed Implementation Plan

**Duration**: Week 3 (7 days)
**Dependencies**: Phase 2 completion
**Risk Level**: Medium (complex business logic)
**Team**: 1 full-stack developer + Claude Code

## Overview

Phase 3 implements the core business models and APIs that power the Safe Job platform's primary functionality. This includes the employer verification system, comprehensive job management system with PostGIS geospatial support, and the foundational admin approval workflows. This phase establishes the business logic that differentiates Safe Job from generic job boards.

## Success Criteria

- [ ] Employer verification system with tiered verification levels operational
- [ ] Complete job posting system with admin approval workflow
- [ ] Geospatial job search with PostGIS integration functional
- [ ] Document upload system for verification materials working
- [ ] Admin interfaces for verification and job approval complete
- [ ] All business logic properly tested and validated

## Detailed Task Breakdown

### 3.1 Employer Verification System

#### 3.1.1 Employer Profile and Verification Models

**Duration**: 1.5 days
**Priority**: Critical
**Risk Level**: Medium

**Tasks:**

- [ ] Create comprehensive EmployerProfile model with Dutch business validation
- [ ] Implement tiered verification system (Basic/Verified/Premium)
- [ ] Build document upload system for verification materials
- [ ] Create verification workflow with admin approval process
- [ ] Add KvK (Chamber of Commerce) number validation integration

**Acceptance Criteria:**

- Employer profiles store all required business information
- Verification tiers properly control platform permissions
- Document upload securely stores verification materials
- Admin workflow tracks verification progress
- KvK validation prevents fraudulent registrations

**Implementation Details:**

**Employer Profile Model (`employers/models.py`):**

```python
from django.contrib.gis.db import models
from django.core.validators import RegexValidator
from django.utils import timezone
import uuid

class EmployerProfile(models.Model):
    VERIFICATION_TIERS = [
        ('unverified', 'Unverified'),
        ('basic', 'Basic Verification'),
        ('verified', 'Verified Agency'),
        ('premium', 'Premium Verified'),
        ('suspended', 'Suspended')
    ]

    COMPANY_SIZES = [
        ('1-10', '1-10 employees'),
        ('11-50', '11-50 employees'),
        ('51-200', '51-200 employees'),
        ('201-500', '201-500 employees'),
        ('500+', '500+ employees')
    ]

    INDUSTRIES = [
        ('construction', 'Construction'),
        ('manufacturing', 'Manufacturing'),
        ('logistics', 'Logistics & Transport'),
        ('hospitality', 'Hospitality'),
        ('healthcare', 'Healthcare'),
        ('agriculture', 'Agriculture'),
        ('cleaning', 'Cleaning Services'),
        ('retail', 'Retail'),
        ('other', 'Other')
    ]

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='employer_profile')
    company_name = models.CharField(max_length=200)
    trading_name = models.CharField(max_length=200, blank=True, help_text="Trading name if different from company name")

    # Dutch Business Registration
    kvk_number = models.CharField(
        max_length=8,
        unique=True,
        validators=[RegexValidator(r'^\d{8}$', 'KvK number must be 8 digits')],
        help_text="Dutch Chamber of Commerce number"
    )
    vat_number = models.CharField(
        max_length=14,
        blank=True,
        validators=[RegexValidator(r'^NL\d{9}B\d{2}$', 'Invalid Dutch VAT number format')],
        help_text="Dutch VAT number (format: NL123456789B01)"
    )

    # Company Details
    industry = models.CharField(max_length=50, choices=INDUSTRIES)
    company_size = models.CharField(max_length=20, choices=COMPANY_SIZES)
    founded_year = models.PositiveIntegerField(null=True, blank=True)
    website = models.URLField(blank=True)
    description = models.TextField(max_length=2000, blank=True)

    # Contact Information
    contact_person_name = models.CharField(max_length=100)
    contact_person_role = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20)

    # Address Information
    street_address = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(
        max_length=7,
        validators=[RegexValidator(r'^\d{4}\s?[A-Za-z]{2}$', 'Invalid Dutch postal code format')]
    )
    province = models.CharField(max_length=50)
    country = models.CharField(max_length=50, default='Netherlands')

    # Geospatial location for job matching
    location = models.PointField(null=True, blank=True, help_text="Geocoded from address")

    # Verification System
    verification_tier = models.CharField(max_length=20, choices=VERIFICATION_TIERS, default='unverified')
    verification_requested_at = models.DateTimeField(null=True, blank=True)
    verification_completed_at = models.DateTimeField(null=True, blank=True)
    verification_expires_at = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True, help_text="Admin notes on verification process")

    # Platform Permissions (based on verification tier)
    can_post_jobs = models.BooleanField(default=False)
    can_contact_candidates = models.BooleanField(default=False)
    can_view_candidate_details = models.BooleanField(default=False)
    max_active_jobs = models.PositiveIntegerField(default=0)
    max_monthly_job_posts = models.PositiveIntegerField(default=0)

    # Compliance and Safety
    has_nen_4400_certification = models.BooleanField(default=False, help_text="NEN 4400-1 certification for staffing agencies")
    nen_4400_certificate_number = models.CharField(max_length=50, blank=True)
    nen_4400_expires_at = models.DateField(null=True, blank=True)

    has_sna_membership = models.BooleanField(default=False, help_text="Member of Dutch Staffing Association (SNA)")
    sna_member_number = models.CharField(max_length=50, blank=True)

    # Platform Statistics
    jobs_posted_count = models.PositiveIntegerField(default=0)
    active_jobs_count = models.PositiveIntegerField(default=0)
    successful_hires_count = models.PositiveIntegerField(default=0)
    average_job_rating = models.FloatField(null=True, blank=True)

    # Account Status
    is_active = models.BooleanField(default=True)
    suspension_reason = models.TextField(blank=True)
    suspended_at = models.DateTimeField(null=True, blank=True)
    suspended_until = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'employers_profile'
        indexes = [
            models.Index(fields=['verification_tier', 'is_active']),
            models.Index(fields=['kvk_number']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.company_name} ({self.get_verification_tier_display()})"

    def update_verification_permissions(self):
        """Update permissions based on verification tier"""
        permission_matrix = {
            'unverified': {
                'can_post_jobs': False,
                'can_contact_candidates': False,
                'can_view_candidate_details': False,
                'max_active_jobs': 0,
                'max_monthly_job_posts': 0
            },
            'basic': {
                'can_post_jobs': True,
                'can_contact_candidates': False,
                'can_view_candidate_details': False,
                'max_active_jobs': 2,
                'max_monthly_job_posts': 5
            },
            'verified': {
                'can_post_jobs': True,
                'can_contact_candidates': True,
                'can_view_candidate_details': True,
                'max_active_jobs': 10,
                'max_monthly_job_posts': 25
            },
            'premium': {
                'can_post_jobs': True,
                'can_contact_candidates': True,
                'can_view_candidate_details': True,
                'max_active_jobs': 50,
                'max_monthly_job_posts': 100
            },
            'suspended': {
                'can_post_jobs': False,
                'can_contact_candidates': False,
                'can_view_candidate_details': False,
                'max_active_jobs': 0,
                'max_monthly_job_posts': 0
            }
        }

        if self.verification_tier in permission_matrix:
            permissions = permission_matrix[self.verification_tier]
            for key, value in permissions.items():
                setattr(self, key, value)

class EmployerVerificationDocument(models.Model):
    DOCUMENT_TYPES = [
        ('kvk_extract', 'KvK Extract (Chamber of Commerce)'),
        ('vat_certificate', 'VAT Registration Certificate'),
        ('nen_4400_cert', 'NEN 4400-1 Certification'),
        ('insurance_cert', 'Professional Liability Insurance'),
        ('bank_statement', 'Bank Statement'),
        ('company_photo', 'Company Photo/Office'),
        ('other', 'Other Supporting Document')
    ]

    employer = models.ForeignKey(EmployerProfile, on_delete=models.CASCADE, related_name='verification_documents')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='verification_documents/%Y/%m/')
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=100)

    # Admin Review
    is_verified = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_documents')

    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['employer', 'document_type']
```

#### 3.1.2 Employer Verification API

**Duration**: 1 day
**Priority**: Critical

**Tasks:**

- [ ] Build employer registration with document upload endpoints
- [ ] Create verification status tracking API
- [ ] Implement admin endpoints for verification review
- [ ] Add KvK validation service integration
- [ ] Build verification notification system

**Acceptance Criteria:**

- Registration creates employer profile with proper validation
- Document upload stores files securely with metadata
- Admin API allows verification status updates
- KvK validation prevents invalid registrations
- Status changes trigger appropriate notifications

**API Implementation (`employers/api/views.py`):**

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.gis.geos import Point
from .serializers import EmployerProfileSerializer, VerificationDocumentSerializer
from ..services import KvKValidationService, GeocodingService

class EmployerProfileViewSet(viewsets.ModelViewSet):
    serializer_class = EmployerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmployerProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Validate KvK number
        kvk_number = serializer.validated_data['kvk_number']
        if not KvKValidationService.validate_kvk_number(kvk_number):
            raise ValidationError({'kvk_number': 'Invalid KvK number'})

        # Geocode address
        address = f"{serializer.validated_data['street_address']}, {serializer.validated_data['city']}, {serializer.validated_data['postal_code']}"
        location = GeocodingService.geocode_address(address)

        employer = serializer.save(
            user=self.request.user,
            location=Point(location['lng'], location['lat']) if location else None
        )

        # Update permissions based on initial tier
        employer.update_verification_permissions()
        employer.save()

    @action(detail=True, methods=['post'])
    def request_verification(self, request, pk=None):
        """Request verification upgrade"""
        employer = self.get_object()

        # Check if all required documents are uploaded
        required_docs = ['kvk_extract', 'vat_certificate', 'insurance_cert']
        uploaded_docs = employer.verification_documents.values_list('document_type', flat=True)

        missing_docs = set(required_docs) - set(uploaded_docs)
        if missing_docs:
            return Response({
                'error': 'Missing required documents',
                'missing_documents': list(missing_docs)
            }, status=status.HTTP_400_BAD_REQUEST)

        employer.verification_requested_at = timezone.now()
        employer.save()

        # Notify admin team
        NotificationService.notify_admin_verification_request(employer)

        return Response({'message': 'Verification request submitted successfully'})

    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        """Upload verification document"""
        employer = self.get_object()

        serializer = VerificationDocumentSerializer(data=request.data)
        if serializer.is_valid():
            document = serializer.save(employer=employer)
            return Response(VerificationDocumentSerializer(document).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployerVerificationAdminViewSet(viewsets.ModelViewSet):
    """Admin-only viewset for managing employer verification"""
    queryset = EmployerProfile.objects.all()
    serializer_class = EmployerProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    @action(detail=True, methods=['post'])
    def approve_verification(self, request, pk=None):
        """Approve employer verification"""
        employer = self.get_object()
        new_tier = request.data.get('verification_tier', 'verified')
        admin_notes = request.data.get('admin_notes', '')

        if new_tier not in dict(EmployerProfile.VERIFICATION_TIERS):
            return Response({'error': 'Invalid verification tier'}, status=400)

        employer.verification_tier = new_tier
        employer.verification_completed_at = timezone.now()
        employer.verification_notes = admin_notes
        employer.update_verification_permissions()
        employer.save()

        # Notify employer
        NotificationService.notify_employer_verification_approved(employer)

        return Response({'message': f'Employer approved with {new_tier} verification'})

    @action(detail=True, methods=['post'])
    def reject_verification(self, request, pk=None):
        """Reject employer verification"""
        employer = self.get_object()
        rejection_reason = request.data.get('rejection_reason', '')

        employer.verification_notes = f"Rejected: {rejection_reason}"
        employer.verification_requested_at = None
        employer.save()

        # Notify employer
        NotificationService.notify_employer_verification_rejected(employer, rejection_reason)

        return Response({'message': 'Verification rejected'})
```

#### 3.1.3 Employer Verification UI

**Duration**: 1 day

**Priority**: High

**Tasks:**

- [ ] Create employer onboarding flow with step-by-step verification
- [ ] Build verification status dashboard with progress tracking
- [ ] Implement document upload interface with drag-and-drop
- [ ] Add verification progress indicators and status updates
- [ ] Build admin verification review interface

**Acceptance Criteria:**

- Onboarding guides employers through verification process
- Status dashboard shows real-time verification progress
- Document upload provides clear feedback and validation
- Progress indicators accurately reflect completion status
- Admin interface allows efficient verification processing

### 3.2 Job Management System

#### 3.2.1 Job Posting Models and Workflow

**Duration**: 1.5 days

**Priority**: Critical

**Risk Level**: Medium

**Tasks:**

- [ ] Create comprehensive Job model with PostGIS geospatial support
- [ ] Implement job posting workflow with admin approval
- [ ] Build job version control system for edit tracking
- [ ] Create skills taxonomy and job requirements system
- [ ] Add job expiration and renewal functionality

**Acceptance Criteria:**

- Job model stores all required posting information
- Workflow progresses from draft → pending → published
- Version control tracks all job changes
- Skills system supports complex job requirements
- Expiration system automatically manages job lifecycle

**Job Models (`jobs/models.py`):**

```python
from django.contrib.gis.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta
import uuid

class SkillCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Skill Categories"
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

class Skill(models.Model):
    SKILL_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert')
    ]

    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['category', 'name']
        ordering = ['category__sort_order', 'name']

    def __str__(self):
        return f"{self.category.name}: {self.name}"

class Job(models.Model):
    JOB_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Approval'),
        ('published', 'Published'),
        ('paused', 'Paused'),
        ('expired', 'Expired'),
        ('filled', 'Filled'),
        ('cancelled', 'Cancelled')
    ]

    JOB_TYPES = [
        ('temporary', 'Temporary Work'),
        ('contract', 'Contract Work'),
        ('permanent', 'Permanent Position'),
        ('project', 'Project Based'),
        ('seasonal', 'Seasonal Work')
    ]

    WORK_SCHEDULES = [
        ('full_time', 'Full Time (40 hours/week)'),
        ('part_time', 'Part Time'),
        ('flexible', 'Flexible Hours'),
        ('shift_work', 'Shift Work'),
        ('weekend_only', 'Weekends Only'),
        ('on_call', 'On Call')
    ]

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employer = models.ForeignKey('employers.EmployerProfile', on_delete=models.CASCADE, related_name='jobs')

    # Job Details
    title = models.CharField(max_length=200)
    description = models.TextField(max_length=5000)
    short_description = models.CharField(max_length=300, help_text="Brief summary for listings")

    job_type = models.CharField(max_length=20, choices=JOB_TYPES)
    work_schedule = models.CharField(max_length=20, choices=WORK_SCHEDULES)

    # Employment Details
    hourly_rate_min = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(10.00)])
    hourly_rate_max = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    hours_per_week = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(60)])

    # Contract Duration
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True, help_text="Leave blank for ongoing positions")
    duration_weeks = models.PositiveIntegerField(null=True, blank=True, help_text="Expected duration in weeks")

    # Location Information (PostGIS)
    work_location_address = models.CharField(max_length=300)
    work_location_city = models.CharField(max_length=100)
    work_location_postal_code = models.CharField(max_length=10)
    work_location_coordinates = models.PointField(help_text="Geocoded work location")
    remote_work_possible = models.BooleanField(default=False)
    travel_required = models.BooleanField(default=False)
    travel_percentage = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MaxValueValidator(100)],
        help_text="Percentage of time spent traveling"
    )

    # Requirements
    minimum_age = models.PositiveIntegerField(default=18, validators=[MinValueValidator(16), MaxValueValidator(70)])
    dutch_language_required = models.CharField(
        max_length=20,
        choices=[
            ('none', 'Not Required'),
            ('basic', 'Basic (A1-A2)'),
            ('intermediate', 'Intermediate (B1-B2)'),
            ('advanced', 'Advanced (C1-C2)')
        ],
        default='basic'
    )
    english_language_required = models.CharField(
        max_length=20,
        choices=[
            ('none', 'Not Required'),
            ('basic', 'Basic (A1-A2)'),
            ('intermediate', 'Intermediate (B1-B2)'),
            ('advanced', 'Advanced (C1-C2)')
        ],
        default='none'
    )
    experience_required_years = models.PositiveIntegerField(default=0)

    # Skills and Requirements
    required_skills = models.ManyToManyField(Skill, through='JobSkillRequirement', related_name='required_for_jobs')

    # Transportation and Accommodation
    transport_provided = models.BooleanField(default=False)
    transport_reimbursed = models.BooleanField(default=False)
    accommodation_provided = models.BooleanField(default=False)
    accommodation_cost = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    # Special Considerations
    couple_friendly = models.BooleanField(default=False, help_text="Suitable for couples working together")
    max_couple_positions = models.PositiveIntegerField(default=1, help_text="Maximum couple positions available")
    physical_demands = models.TextField(blank=True, help_text="Physical requirements of the job")
    safety_requirements = models.TextField(blank=True, help_text="Safety equipment or training required")

    # Application Settings
    max_applications = models.PositiveIntegerField(default=100)
    applications_received = models.PositiveIntegerField(default=0)
    application_deadline = models.DateTimeField(null=True, blank=True)

    # Status and Workflow
    status = models.CharField(max_length=20, choices=JOB_STATUS_CHOICES, default='draft')
    is_active = models.BooleanField(default=True)

    # Admin Approval
    submitted_for_approval_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_jobs')
    rejection_reason = models.TextField(blank=True)

    # Publication Management
    published_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    auto_renewal = models.BooleanField(default=False)

    # SEO and Visibility
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    featured = models.BooleanField(default=False)

    # Analytics
    view_count = models.PositiveIntegerField(default=0)
    application_count = models.PositiveIntegerField(default=0)

    # Soft Delete
    deleted_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    active_objects = ActiveJobManager()

    class Meta:
        db_table = 'jobs_job'
        indexes = [
            models.Index(fields=['status', 'is_active']),
            models.Index(fields=['published_at', 'expires_at']),
            models.Index(fields=['employer', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['work_location_coordinates']),  # Spatial index
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.employer.company_name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.generate_slug()

        # Set expiration date if not set
        if self.status == 'published' and not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=30)

        super().save(*args, **kwargs)

    def submit_for_approval(self):
        """Submit job for admin approval"""
        if self.status == 'draft':
            self.status = 'pending_approval'
            self.submitted_for_approval_at = timezone.now()
            self.save()
            return True
        return False

    def approve(self, admin_user):
        """Approve job and publish"""
        if self.status == 'pending_approval':
            self.status = 'published'
            self.approved_at = timezone.now()
            self.approved_by = admin_user
            self.published_at = timezone.now()
            self.save()
            return True
        return False

    def reject(self, reason, admin_user):
        """Reject job with reason"""
        if self.status == 'pending_approval':
            self.status = 'draft'
            self.rejection_reason = reason
            self.save()
            return True
        return False

class JobSkillRequirement(models.Model):
    REQUIREMENT_LEVELS = [
        ('required', 'Required'),
        ('preferred', 'Preferred'),
        ('nice_to_have', 'Nice to Have')
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    requirement_level = models.CharField(max_length=20, choices=REQUIREMENT_LEVELS, default='required')
    minimum_experience_months = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['job', 'skill']

class JobVersion(models.Model):
    """Track job edit history"""
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    changes_summary = models.TextField(blank=True)
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['job', 'version_number']
        ordering = ['-version_number']
```

#### 3.2.2 Job Posting API Endpoints

**Duration**: 1 day

**Priority**: Critical

**Tasks:**

- [ ] Implement CRUD operations for job postings with validation
- [ ] Create geospatial job search with PostGIS queries
- [ ] Build job approval workflow API for admins
- [ ] Add job statistics and analytics endpoints
- [ ] Implement job expiration and renewal system

**Acceptance Criteria:**

- CRUD operations respect employer permissions and verification levels
- Geospatial search returns jobs within specified radius
- Admin API allows efficient job approval workflow
- Analytics provide meaningful job performance metrics
- Expiration system maintains data integrity

**Job API Implementation (`jobs/api/views.py`):**

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.gis.measure import Distance
from django.contrib.gis.geos import Point
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import JobSerializer, JobDetailSerializer
from ..models import Job
from ..filters import JobFilter

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = JobFilter

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated and hasattr(user, 'employer_profile'):
            # Employers see their own jobs
            return Job.objects.filter(employer=user.employer_profile).exclude(deleted_at__isnull=False)
        else:
            # Public access - only published jobs
            return Job.active_objects.published()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return JobDetailSerializer
        return JobSerializer

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'employer_profile'):
            raise PermissionDenied("Only employers can create jobs")

        employer = self.request.user.employer_profile

        # Check employer permissions
        if not employer.can_post_jobs:
            raise PermissionDenied("Your account is not verified to post jobs")

        if employer.active_jobs_count >= employer.max_active_jobs:
            raise PermissionDenied(f"Maximum active jobs limit reached ({employer.max_active_jobs})")

        # Geocode work location
        address = f"{serializer.validated_data['work_location_address']}, {serializer.validated_data['work_location_city']}"
        location = GeocodingService.geocode_address(address)

        job = serializer.save(
            employer=employer,
            work_location_coordinates=Point(location['lng'], location['lat']) if location else None
        )

        # Update employer job count
        employer.active_jobs_count += 1
        employer.save()

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced job search with geospatial filtering"""
        queryset = Job.active_objects.published()

        # Location-based search
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 25)  # Default 25km

        if lat and lng:
            location = Point(float(lng), float(lat), srid=4326)
            queryset = queryset.filter(
                work_location_coordinates__distance_lte=(location, Distance(km=int(radius)))
            ).annotate(
                distance=models.Distance('work_location_coordinates', location)
            ).order_by('distance')

        # Skill-based filtering
        required_skills = request.query_params.getlist('skills')
        if required_skills:
            queryset = queryset.filter(
                required_skills__in=required_skills
            ).distinct()

        # Apply other filters
        queryset = self.filter_queryset(queryset)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit_for_approval(self, request, pk=None):
        """Submit job for admin approval"""
        job = self.get_object()

        if job.employer.user != request.user:
            raise PermissionDenied()

        if job.submit_for_approval():
            # Notify admin team
            NotificationService.notify_admin_job_approval_needed(job)
            return Response({'message': 'Job submitted for approval'})

        return Response(
            {'error': 'Job cannot be submitted for approval in current status'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get job performance analytics"""
        job = self.get_object()

        if job.employer.user != request.user:
            raise PermissionDenied()

        analytics_data = {
            'views': job.view_count,
            'applications': job.application_count,
            'applications_by_day': self.get_applications_by_day(job),
            'top_candidate_locations': self.get_top_candidate_locations(job),
            'skill_match_distribution': self.get_skill_match_distribution(job)
        }

        return Response(analytics_data)

class JobAdminViewSet(viewsets.ModelViewSet):
    """Admin-only viewset for job management"""
    queryset = Job.objects.all()
    serializer_class = JobDetailSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get jobs pending approval"""
        jobs = Job.objects.filter(status='pending_approval').order_by('submitted_for_approval_at')
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve job posting"""
        job = self.get_object()

        if job.approve(request.user):
            # Notify employer
            NotificationService.notify_employer_job_approved(job)
            return Response({'message': 'Job approved and published'})

        return Response({'error': 'Job cannot be approved'}, status=400)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject job posting"""
        job = self.get_object()
        reason = request.data.get('reason', '')

        if job.reject(reason, request.user):
            # Notify employer
            NotificationService.notify_employer_job_rejected(job, reason)
            return Response({'message': 'Job rejected'})

        return Response({'error': 'Job cannot be rejected'}, status=400)
```

#### 3.2.3 Job Management UI

**Duration**: 1 day

**Priority**: High

**Tasks:**

- [ ] Build comprehensive job posting form with validation
- [ ] Create job search interface with geospatial map integration
- [ ] Implement job approval dashboard for admins
- [ ] Add job analytics and performance tracking interface
- [ ] Build job version control and edit history viewer

**Acceptance Criteria:**

- Job posting form guides users through complete job creation
- Search interface provides intuitive filtering and map view
- Admin dashboard enables efficient job approval workflow
- Analytics provide actionable insights for employers
- Version control shows clear edit history

## Risk Mitigation Strategies

### Technical Risks

1. **PostGIS Integration Complexity**
   - **Risk**: Geospatial queries may be complex and slow
   - **Mitigation**: Use proper indexing, optimize queries, add caching
   - **Fallback**: Start with simple distance calculations

2. **Document Upload Security**
   - **Risk**: Malicious file uploads could compromise system
   - **Mitigation**: Strict file validation, virus scanning, sandboxed storage
   - **Testing**: Security scanning of upload functionality

3. **Admin Workflow Bottlenecks**
   - **Risk**: Manual approval processes could create delays
   - **Mitigation**: Efficient admin interface, automated notifications
   - **Scaling**: Plan for automated approval rules

### Business Logic Risks

1. **Verification Tier Complexity**
   - **Risk**: Complex permission matrix could create confusion
   - **Mitigation**: Clear documentation, comprehensive testing
   - **UI**: Clear permission explanations for users

2. **Job Approval Workflow**
   - **Risk**: Unclear approval criteria could cause inconsistencies
   - **Mitigation**: Detailed approval guidelines, admin training
   - **Quality**: Regular review of approval decisions

## Testing Strategy

### Model Testing

- [ ] Test all model validations and constraints
- [ ] Verify relationship integrity
- [ ] Test custom model methods and managers
- [ ] Validate geospatial functionality

### API Testing

- [ ] Test all CRUD operations with various user types
- [ ] Verify permission enforcement
- [ ] Test geospatial search functionality
- [ ] Validate admin approval workflows

### Integration Testing

- [ ] Test complete job posting and approval flow
- [ ] Verify document upload and storage
- [ ] Test notification system integration
- [ ] Validate geocoding service integration

## Performance Considerations

### Database Optimization

- Proper indexing on frequently queried fields
- Spatial indexing for PostGIS queries
- Connection pooling for high-concurrency scenarios
- Query optimization for complex job searches

### File Upload Optimization

- Direct S3 uploads to reduce server load
- Image compression and optimization
- Progressive file upload with resume capability
- CDN integration for fast file delivery

## Security Considerations

### Data Protection

- [ ] Employer verification documents properly secured
- [ ] Job data access controlled by permissions
- [ ] Audit logging for sensitive operations
- [ ] Regular security scans of uploaded files

### Business Logic Security

- [ ] Verification tier permissions properly enforced
- [ ] Job approval workflow prevents bypass attempts
- [ ] Rate limiting on job posting operations
- [ ] Input validation on all user inputs

## Documentation Requirements

### API Documentation

- [ ] Complete OpenAPI documentation for all endpoints
- [ ] Example requests/responses for each operation
- [ ] Error response documentation
- [ ] Authentication and permission requirements

### Business Process Documentation

- [ ] Employer verification process flow
- [ ] Job approval workflow documentation
- [ ] Admin procedures and guidelines
- [ ] User guides for employers

## Deliverables Checklist

### Backend Deliverables

- [ ] Complete employer verification system
- [ ] Comprehensive job management system
- [ ] PostGIS integration for geospatial features
- [ ] Admin approval workflows
- [ ] Document upload and management

### API Deliverables

- [ ] All CRUD operations for employers and jobs
- [ ] Geospatial search and filtering
- [ ] Admin management endpoints
- [ ] Analytics and reporting endpoints
- [ ] File upload and management APIs

### Database Deliverables

- [ ] Optimized database schema with proper indexing
- [ ] Data migration scripts
- [ ] Seed data for development and testing
- [ ] Backup and recovery procedures

## Next Phase Preparation

### Phase 4 Prerequisites

- [ ] Application models and workflow designed
- [ ] Matching algorithm strategy defined
- [ ] Notification system architecture planned
- [ ] Integration points with messaging system identified

This detailed plan ensures Phase 3 delivers robust business models and APIs that form the core functionality of the Safe Job platform, setting the foundation for advanced features in subsequent phases.
