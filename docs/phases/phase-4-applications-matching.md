# Phase 4: Application & Matching System - Detailed Implementation Plan

**Duration**: Week 4 (7 days)

**Dependencies**: Phase 3 completion

**Risk Level**: Medium (matching algorithm complexity)

**Team**: 1 full-stack developer + Claude Code

## Overview

Phase 4 implements the job application system and basic matching algorithm that connects candidates with suitable job opportunities. This includes the complete application workflow, couple application functionality, skills-based matching, and the foundation for the platform's recommendation engine. This phase is critical as it enables the core user interaction between candidates and employers.

## Success Criteria

- [ ] Complete job application workflow operational
- [ ] Couple application system functional for partner jobs
- [ ] Basic skills-based matching algorithm implemented
- [ ] Application status tracking with notifications
- [ ] Employer application management interface complete
- [ ] Location-based job recommendations working

## Detailed Task Breakdown

### 4.1 Application Workflow

#### 4.1.1 Application Models and Workflow

**Duration**: 1.5 days

**Priority**: Critical

**Risk Level**: Medium

**Tasks:**

- [ ] Create comprehensive JobApplication model with status tracking
- [ ] Implement application workflow (Applied → Reviewed → Accepted/Rejected)
- [ ] Build couple application system for partner job applications
- [ ] Add application matching score calculation
- [ ] Create application notification and status update system

**Acceptance Criteria:**

- Application model captures all necessary candidate and job data
- Status workflow progresses logically with proper validation
- Couple applications link partners and handle joint decisions
- Matching scores provide meaningful relevance ranking
- Notifications keep all parties informed of status changes

**Implementation Details:**

**Application Models (`applications/models.py`):**
```python
from django.contrib.gis.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

class JobApplication(models.Model):
    APPLICATION_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('interview_completed', 'Interview Completed'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
        ('expired', 'Expired')
    ]

    APPLICATION_SOURCES = [
        ('direct', 'Direct Application'),
        ('recommendation', 'Platform Recommendation'),
        ('search', 'Job Search'),
        ('employer_invite', 'Employer Invitation')
    ]

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey('jobs.Job', on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey('candidates.CandidateProfile', on_delete=models.CASCADE, related_name='applications')

    # Application Details
    status = models.CharField(max_length=30, choices=APPLICATION_STATUS_CHOICES, default='draft')
    source = models.CharField(max_length=20, choices=APPLICATION_SOURCES, default='direct')
    cover_letter = models.TextField(max_length=2000, blank=True)
    availability_start_date = models.DateField()
    expected_hourly_rate = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    # Skills Matching
    skills_match_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Automated skills matching score (0-100)"
    )
    location_distance_km = models.FloatField(
        null=True, blank=True,
        help_text="Distance from candidate to job location in kilometers"
    )
    overall_match_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Overall matching score combining all factors"
    )

    # Couple Application Reference
    couple_application = models.ForeignKey(
        'CoupleApplication',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='individual_applications'
    )

    # Application Tracking
    viewed_by_employer = models.BooleanField(default=False)
    employer_rating = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Employer rating of application (1-5 stars)"
    )
    employer_notes = models.TextField(blank=True, help_text="Private employer notes")

    # Interview Information
    interview_scheduled_at = models.DateTimeField(null=True, blank=True)
    interview_location = models.CharField(max_length=300, blank=True)
    interview_type = models.CharField(
        max_length=20,
        choices=[
            ('in_person', 'In Person'),
            ('phone', 'Phone Call'),
            ('video', 'Video Call'),
            ('group', 'Group Interview')
        ],
        blank=True
    )
    interview_notes = models.TextField(blank=True)

    # Decision Information
    rejection_reason = models.CharField(
        max_length=50,
        choices=[
            ('skills_mismatch', 'Skills Mismatch'),
            ('experience_insufficient', 'Insufficient Experience'),
            ('location_too_far', 'Location Too Far'),
            ('salary_expectations', 'Salary Expectations'),
            ('availability_conflict', 'Availability Conflict'),
            ('better_candidate', 'Better Candidate Selected'),
            ('position_filled', 'Position Already Filled'),
            ('other', 'Other Reason')
        ],
        blank=True
    )
    rejection_feedback = models.TextField(blank=True, help_text="Feedback for candidate")

    # Timestamps
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    decision_made_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Soft Delete
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'applications_job_application'
        unique_together = ['job', 'candidate']  # Prevent duplicate applications
        indexes = [
            models.Index(fields=['job', 'status']),
            models.Index(fields=['candidate', 'status']),
            models.Index(fields=['status', 'submitted_at']),
            models.Index(fields=['overall_match_score']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.candidate.user.get_full_name()} → {self.job.title}"

    def calculate_match_score(self):
        """Calculate overall matching score based on multiple factors"""
        scores = {
            'skills': self.calculate_skills_match(),
            'location': self.calculate_location_match(),
            'experience': self.calculate_experience_match(),
            'availability': self.calculate_availability_match(),
            'salary': self.calculate_salary_match()
        }

        # Weighted average
        weights = {
            'skills': 0.4,
            'location': 0.2,
            'experience': 0.2,
            'availability': 0.1,
            'salary': 0.1
        }

        overall_score = sum(scores[key] * weights[key] for key in scores)
        self.overall_match_score = min(100.0, max(0.0, overall_score))
        self.skills_match_score = scores['skills']

        return self.overall_match_score

    def submit(self):
        """Submit application and trigger matching calculation"""
        if self.status == 'draft':
            self.status = 'submitted'
            self.submitted_at = timezone.now()
            self.calculate_match_score()
            self.save()

            # Increment job application count
            self.job.application_count += 1
            self.job.save()

            # Notify employer
            from ..services import NotificationService
            NotificationService.notify_employer_new_application(self)

            return True
        return False

    def accept(self, employer_notes=''):
        """Accept application"""
        if self.status in ['submitted', 'under_review', 'interview_completed']:
            self.status = 'accepted'
            self.decision_made_at = timezone.now()
            self.employer_notes = employer_notes
            self.save()

            # Notify candidate
            NotificationService.notify_candidate_application_accepted(self)
            return True
        return False

    def reject(self, reason, feedback=''):
        """Reject application with reason and feedback"""
        if self.status in ['submitted', 'under_review', 'interview_completed']:
            self.status = 'rejected'
            self.rejection_reason = reason
            self.rejection_feedback = feedback
            self.decision_made_at = timezone.now()
            self.save()

            # Notify candidate
            NotificationService.notify_candidate_application_rejected(self)
            return True
        return False

class CoupleApplication(models.Model):
    """Handles job applications for couples working together"""
    COUPLE_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('both_accepted', 'Both Partners Accepted'),
        ('partially_accepted', 'One Partner Accepted'),
        ('both_rejected', 'Both Partners Rejected'),
        ('withdrawn', 'Withdrawn')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey('jobs.Job', on_delete=models.CASCADE, related_name='couple_applications')

    # Partner Information
    primary_candidate = models.ForeignKey(
        'candidates.CandidateProfile',
        on_delete=models.CASCADE,
        related_name='primary_couple_applications'
    )
    secondary_candidate = models.ForeignKey(
        'candidates.CandidateProfile',
        on_delete=models.CASCADE,
        related_name='secondary_couple_applications'
    )

    # Application Details
    status = models.CharField(max_length=30, choices=COUPLE_STATUS_CHOICES, default='draft')
    joint_cover_letter = models.TextField(max_length=3000, blank=True)
    accommodation_needed = models.BooleanField(default=False)
    transport_needed = models.BooleanField(default=False)

    # Combined Matching Score
    combined_match_score = models.FloatField(default=0.0)

    # Decision Tracking
    primary_decision = models.CharField(max_length=20, blank=True)  # accepted/rejected
    secondary_decision = models.CharField(max_length=20, blank=True)  # accepted/rejected
    employer_notes = models.TextField(blank=True)

    # Timestamps
    submitted_at = models.DateTimeField(null=True, blank=True)
    decision_made_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'applications_couple_application'
        unique_together = ['job', 'primary_candidate', 'secondary_candidate']

    def __str__(self):
        return f"Couple Application: {self.primary_candidate} & {self.secondary_candidate} → {self.job.title}"

    def calculate_combined_score(self):
        """Calculate combined matching score for both partners"""
        if not hasattr(self, '_individual_apps'):
            return 0.0

        primary_app = self.individual_applications.filter(candidate=self.primary_candidate).first()
        secondary_app = self.individual_applications.filter(candidate=self.secondary_candidate).first()

        if primary_app and secondary_app:
            # Average of both scores with slight bonus for being a couple (employer preference)
            combined = (primary_app.overall_match_score + secondary_app.overall_match_score) / 2
            couple_bonus = 5.0 if self.job.couple_friendly else 0.0
            self.combined_match_score = min(100.0, combined + couple_bonus)

        return self.combined_match_score

class ApplicationStatusHistory(models.Model):
    """Track status changes for applications"""
    application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name='status_history')
    previous_status = models.CharField(max_length=30)
    new_status = models.CharField(max_length=30)
    changed_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
```

#### 4.1.2 Application Management API

**Duration**: 1 day

**Priority**: Critical

**Tasks:**

- [ ] Build job application submission endpoints
- [ ] Create application status management for employers
- [ ] Implement application filtering and search
- [ ] Add application analytics and reporting
- [ ] Handle couple applications and complex matching scenarios

**Acceptance Criteria:**

- Candidates can submit applications with validation
- Employers can efficiently manage and filter applications
- Status updates trigger appropriate notifications
- Analytics provide meaningful insights
- Couple applications handle joint decision logic

**API Implementation (`applications/api/views.py`):**
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Avg
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import JobApplicationSerializer, CoupleApplicationSerializer
from ..models import JobApplication, CoupleApplication
from ..filters import ApplicationFilter

class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ApplicationFilter

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, 'candidate_profile'):
            # Candidates see their own applications
            return JobApplication.objects.filter(
                candidate=user.candidate_profile
            ).exclude(deleted_at__isnull=False)
        elif hasattr(user, 'employer_profile'):
            # Employers see applications to their jobs
            return JobApplication.objects.filter(
                job__employer=user.employer_profile
            ).exclude(deleted_at__isnull=False)
        else:
            return JobApplication.objects.none()

    def perform_create(self, serializer):
        """Create new job application"""
        if not hasattr(self.request.user, 'candidate_profile'):
            raise PermissionDenied("Only candidates can apply for jobs")

        candidate = self.request.user.candidate_profile
        job = serializer.validated_data['job']

        # Check if already applied
        if JobApplication.objects.filter(job=job, candidate=candidate).exists():
            raise ValidationError("You have already applied for this job")

        # Check job application limits
        if job.applications_received >= job.max_applications:
            raise ValidationError("This job has reached its application limit")

        # Check application deadline
        if job.application_deadline and timezone.now() > job.application_deadline:
            raise ValidationError("Application deadline has passed")

        application = serializer.save(candidate=candidate)
        application.calculate_match_score()
        application.save()

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit draft application"""
        application = self.get_object()

        if application.candidate.user != request.user:
            raise PermissionDenied()

        if application.submit():
            return Response({'message': 'Application submitted successfully'})

        return Response(
            {'error': 'Application cannot be submitted'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        """Withdraw application"""
        application = self.get_object()

        if application.candidate.user != request.user:
            raise PermissionDenied()

        if application.status in ['submitted', 'under_review']:
            application.status = 'withdrawn'
            application.save()

            # Notify employer
            NotificationService.notify_employer_application_withdrawn(application)
            return Response({'message': 'Application withdrawn'})

        return Response({'error': 'Cannot withdraw application'}, status=400)

    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        """Get job recommendations for candidate"""
        if not hasattr(request.user, 'candidate_profile'):
            raise PermissionDenied()

        candidate = request.user.candidate_profile

        # Get suitable jobs based on candidate profile
        from ..services import JobMatchingService
        recommended_jobs = JobMatchingService.get_recommendations_for_candidate(candidate)

        # Serialize job data with match scores
        recommendations = []
        for job, match_score in recommended_jobs:
            job_data = {
                'job': JobSerializer(job).data,
                'match_score': match_score,
                'already_applied': JobApplication.objects.filter(
                    job=job, candidate=candidate
                ).exists()
            }
            recommendations.append(job_data)

        return Response(recommendations)

class EmployerApplicationViewSet(viewsets.ModelViewSet):
    """Employer-specific application management"""
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not hasattr(self.request.user, 'employer_profile'):
            return JobApplication.objects.none()

        return JobApplication.objects.filter(
            job__employer=self.request.user.employer_profile
        ).exclude(deleted_at__isnull=False).order_by('-overall_match_score', '-submitted_at')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept candidate application"""
        application = self.get_object()
        employer_notes = request.data.get('employer_notes', '')

        if application.accept(employer_notes):
            return Response({'message': 'Application accepted'})

        return Response({'error': 'Cannot accept application'}, status=400)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject candidate application"""
        application = self.get_object()
        reason = request.data.get('reason', '')
        feedback = request.data.get('feedback', '')

        if application.reject(reason, feedback):
            return Response({'message': 'Application rejected'})

        return Response({'error': 'Cannot reject application'}, status=400)

    @action(detail=True, methods=['post'])
    def schedule_interview(self, request, pk=None):
        """Schedule interview for application"""
        application = self.get_object()

        interview_data = {
            'interview_scheduled_at': request.data.get('scheduled_at'),
            'interview_location': request.data.get('location', ''),
            'interview_type': request.data.get('type', 'in_person'),
            'interview_notes': request.data.get('notes', '')
        }

        for key, value in interview_data.items():
            setattr(application, key, value)

        application.status = 'interview_scheduled'
        application.save()

        # Notify candidate
        NotificationService.notify_candidate_interview_scheduled(application)

        return Response({'message': 'Interview scheduled'})

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get application analytics for employer"""
        employer = request.user.employer_profile

        analytics = {
            'total_applications': JobApplication.objects.filter(
                job__employer=employer
            ).count(),
            'applications_by_status': self.get_applications_by_status(employer),
            'average_match_score': JobApplication.objects.filter(
                job__employer=employer
            ).aggregate(avg_score=Avg('overall_match_score'))['avg_score'],
            'top_candidate_locations': self.get_top_candidate_locations(employer),
            'application_trends': self.get_application_trends(employer)
        }

        return Response(analytics)

class CoupleApplicationViewSet(viewsets.ModelViewSet):
    """Handle couple job applications"""
    serializer_class = CoupleApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, 'candidate_profile'):
            return CoupleApplication.objects.filter(
                Q(primary_candidate=user.candidate_profile) |
                Q(secondary_candidate=user.candidate_profile)
            )
        elif hasattr(user, 'employer_profile'):
            return CoupleApplication.objects.filter(job__employer=user.employer_profile)

        return CoupleApplication.objects.none()

    def perform_create(self, serializer):
        """Create couple application"""
        if not hasattr(self.request.user, 'candidate_profile'):
            raise PermissionDenied()

        job = serializer.validated_data['job']

        if not job.couple_friendly:
            raise ValidationError("This job is not suitable for couples")

        if job.max_couple_positions <= 0:
            raise ValidationError("No couple positions available for this job")

        couple_app = serializer.save(primary_candidate=self.request.user.candidate_profile)

        # Create individual applications for both partners
        for candidate in [couple_app.primary_candidate, couple_app.secondary_candidate]:
            individual_app = JobApplication.objects.create(
                job=job,
                candidate=candidate,
                couple_application=couple_app,
                status='submitted',
                submitted_at=timezone.now()
            )
            individual_app.calculate_match_score()
            individual_app.save()

        # Calculate combined score
        couple_app.calculate_combined_score()
        couple_app.save()
```

### 4.2 Basic Matching Algorithm

#### 4.2.1 Skills-based Matching System

**Duration**: 1.5 days

**Priority**: High

**Risk Level**: Medium

**Tasks:**

- [ ] Create Skills taxonomy and candidate skill profiling
- [ ] Implement basic job-candidate matching algorithm
- [ ] Build location-based matching with distance calculations
- [ ] Add preference-based filtering (work hours, contract type)
- [ ] Create matching score calculation and ranking system

**Acceptance Criteria:**

- Skills taxonomy covers all major job categories
- Matching algorithm provides relevant job suggestions
- Location matching uses accurate distance calculations
- Preference filtering respects candidate requirements
- Scoring system ranks matches meaningfully

**Matching Service Implementation (`applications/services.py`):**
```python
from django.contrib.gis.measure import Distance
from django.contrib.gis.geos import Point
from django.db.models import Q, F
import math
from typing import List, Tuple
from ..models import JobApplication
from jobs.models import Job
from candidates.models import CandidateProfile

class JobMatchingService:
    """Service for matching candidates with suitable jobs"""

    @classmethod
    def get_recommendations_for_candidate(
        cls,
        candidate: CandidateProfile,
        limit: int = 20
    ) -> List[Tuple[Job, float]]:
        """Get job recommendations for a candidate with match scores"""

        # Get available jobs (published, not expired, not already applied)
        available_jobs = cls._get_available_jobs_for_candidate(candidate)

        # Calculate match scores for each job
        job_matches = []
        for job in available_jobs:
            match_score = cls.calculate_match_score(candidate, job)
            if match_score > 20.0:  # Only include reasonable matches
                job_matches.append((job, match_score))

        # Sort by match score and return top matches
        job_matches.sort(key=lambda x: x[1], reverse=True)
        return job_matches[:limit]

    @classmethod
    def get_candidates_for_job(
        cls,
        job: Job,
        limit: int = 50
    ) -> List[Tuple[CandidateProfile, float]]:
        """Get candidate recommendations for a job with match scores"""

        # Get suitable candidates
        suitable_candidates = cls._get_suitable_candidates_for_job(job)

        # Calculate match scores
        candidate_matches = []
        for candidate in suitable_candidates:
            match_score = cls.calculate_match_score(candidate, job)
            if match_score > 30.0:  # Higher threshold for candidate suggestions
                candidate_matches.append((candidate, match_score))

        # Sort by match score
        candidate_matches.sort(key=lambda x: x[1], reverse=True)
        return candidate_matches[:limit]

    @classmethod
    def calculate_match_score(cls, candidate: CandidateProfile, job: Job) -> float:
        """Calculate comprehensive match score between candidate and job"""

        scores = {
            'skills': cls._calculate_skills_match(candidate, job),
            'location': cls._calculate_location_match(candidate, job),
            'experience': cls._calculate_experience_match(candidate, job),
            'language': cls._calculate_language_match(candidate, job),
            'availability': cls._calculate_availability_match(candidate, job),
            'preferences': cls._calculate_preferences_match(candidate, job)
        }

        # Weighted scoring system
        weights = {
            'skills': 0.35,      # Most important
            'location': 0.20,    # Very important for temporary work
            'experience': 0.15,  # Important but not always required
            'language': 0.15,    # Important in Netherlands
            'availability': 0.10, # Important for scheduling
            'preferences': 0.05   # Nice to have
        }

        # Calculate weighted average
        total_score = sum(scores[key] * weights[key] for key in scores)

        # Apply bonuses/penalties
        total_score += cls._apply_bonus_factors(candidate, job, scores)

        return min(100.0, max(0.0, total_score))

    @classmethod
    def _calculate_skills_match(cls, candidate: CandidateProfile, job: Job) -> float:
        """Calculate skills matching score"""
        if not job.required_skills.exists():
            return 80.0  # Neutral score if no specific skills required

        candidate_skills = set(candidate.skills.values_list('id', flat=True))

        # Get job skill requirements with their importance levels
        job_requirements = job.jobskillrequirement_set.all()

        total_weight = 0
        matched_weight = 0

        for requirement in job_requirements:
            # Weight based on requirement level
            weight = {
                'required': 3.0,
                'preferred': 2.0,
                'nice_to_have': 1.0
            }.get(requirement.requirement_level, 2.0)

            total_weight += weight

            if requirement.skill.id in candidate_skills:
                matched_weight += weight

        if total_weight == 0:
            return 80.0

        return (matched_weight / total_weight) * 100

    @classmethod
    def _calculate_location_match(cls, candidate: CandidateProfile, job: Job) -> float:
        """Calculate location-based matching score"""
        if not candidate.location or not job.work_location_coordinates:
            return 50.0  # Neutral score if location data missing

        # Calculate distance
        distance = candidate.location.distance(job.work_location_coordinates)
        distance_km = distance.km

        # Score based on distance (closer is better)
        if distance_km <= 5:
            return 100.0
        elif distance_km <= 15:
            return 90.0
        elif distance_km <= 30:
            return 75.0
        elif distance_km <= 50:
            return 60.0
        elif distance_km <= 100:
            return 40.0
        else:
            return 20.0 if candidate.willing_to_relocate else 10.0

    @classmethod
    def _calculate_experience_match(cls, candidate: CandidateProfile, job: Job) -> float:
        """Calculate experience matching score"""
        candidate_years = candidate.experience_years or 0
        required_years = job.experience_required_years or 0

        if required_years == 0:
            return 100.0  # No experience required

        if candidate_years >= required_years:
            # Bonus for having more experience than required (up to 2x)
            bonus_factor = min(2.0, candidate_years / required_years)
            return min(100.0, 80.0 + (bonus_factor - 1.0) * 20.0)
        else:
            # Penalty for having less experience
            experience_ratio = candidate_years / required_years
            return max(20.0, experience_ratio * 80.0)

    @classmethod
    def _calculate_language_match(cls, candidate: CandidateProfile, job: Job) -> float:
        """Calculate language requirements matching"""
        candidate_languages = {
            lang['language']: lang['level']
            for lang in candidate.languages
        }

        # Dutch language scoring
        dutch_score = cls._score_language_requirement(
            candidate_languages.get('nl', 'none'),
            job.dutch_language_required
        )

        # English language scoring
        english_score = cls._score_language_requirement(
            candidate_languages.get('en', 'none'),
            job.english_language_required
        )

        # Weighted average (Dutch more important in Netherlands)
        return (dutch_score * 0.7) + (english_score * 0.3)

    @classmethod
    def _score_language_requirement(cls, candidate_level: str, required_level: str) -> float:
        """Score individual language requirement"""
        level_scores = {
            'none': 0,
            'basic': 25,
            'intermediate': 50,
            'advanced': 75,
            'native': 100
        }

        candidate_score = level_scores.get(candidate_level, 0)
        required_score = level_scores.get(required_level, 0)

        if required_score == 0:  # Not required
            return 100.0

        if candidate_score >= required_score:
            return 100.0
        else:
            return max(20.0, (candidate_score / required_score) * 80.0)

    @classmethod
    def _calculate_availability_match(cls, candidate: CandidateProfile, job: Job) -> float:
        """Calculate availability matching score"""
        # This is a simplified version - would need more complex logic
        # based on candidate's availability preferences and job schedule

        candidate_availability = candidate.availability or {}

        # Check if candidate is available for job type
        preferred_types = candidate.preferred_work_types or []
        if job.job_type in preferred_types:
            return 100.0
        elif not preferred_types:  # No preference specified
            return 80.0
        else:
            return 40.0  # Job type not in preferences

    @classmethod
    def _calculate_preferences_match(cls, candidate: CandidateProfile, job: Job) -> float:
        """Calculate job preferences matching"""
        score = 50.0  # Base score

        # Transport preferences
        if not candidate.transport_available and not job.transport_provided:
            score -= 20.0
        elif job.transport_provided:
            score += 10.0

        # Accommodation preferences
        if job.accommodation_provided:
            score += 15.0

        # Remote work preferences
        if job.remote_work_possible:
            score += 10.0

        return min(100.0, max(0.0, score))

    @classmethod
    def _apply_bonus_factors(cls, candidate: CandidateProfile, job: Job, scores: dict) -> float:
        """Apply bonus factors for special circumstances"""
        bonus = 0.0

        # Couple-friendly job bonus for candidates with partners
        if job.couple_friendly and hasattr(candidate, 'partner_profile'):
            bonus += 5.0

        # High match in multiple categories bonus
        high_scores = sum(1 for score in scores.values() if score > 80.0)
        if high_scores >= 3:
            bonus += 5.0

        # Perfect skills match bonus
        if scores.get('skills', 0) >= 95.0:
            bonus += 3.0

        return bonus

    @classmethod
    def _get_available_jobs_for_candidate(cls, candidate: CandidateProfile) -> List[Job]:
        """Get jobs available for candidate to apply to"""
        applied_job_ids = JobApplication.objects.filter(
            candidate=candidate
        ).values_list('job_id', flat=True)

        return Job.objects.filter(
            status='published',
            is_active=True,
            expires_at__gt=timezone.now()
        ).exclude(
            id__in=applied_job_ids
        ).select_related('employer').prefetch_related('required_skills')

    @classmethod
    def _get_suitable_candidates_for_job(cls, job: Job) -> List[CandidateProfile]:
        """Get candidates suitable for a job"""
        applied_candidate_ids = JobApplication.objects.filter(
            job=job
        ).values_list('candidate_id', flat=True)

        candidates = CandidateProfile.objects.filter(
            user__is_active=True,
            onboarding_completed=True
        ).exclude(
            id__in=applied_candidate_ids
        ).select_related('user').prefetch_related('skills')

        # Basic filtering based on job requirements
        if job.minimum_age:
            # Would need to add age calculation logic
            pass

        return list(candidates)
```

#### 4.2.2 Matching API and Recommendations

**Duration**: 1 day

**Priority**: High

**Tasks:**

- [ ] Build job recommendation endpoints for candidates
- [ ] Create candidate suggestion API for employers
- [ ] Implement matching score calculation endpoints
- [ ] Add matching analytics and improvement tracking
- [ ] Create batch processing for recommendation updates

**Acceptance Criteria:**

- Recommendations provide relevant, high-quality matches
- API performance supports real-time recommendation requests
- Analytics track recommendation effectiveness
- Batch processing keeps recommendations current
- Matching improves over time with user feedback

#### 4.2.3 Application Management UI

**Duration**: 1 day

**Priority**: High

**Tasks:**

- [ ] Create job application form with skill matching display
- [ ] Build application tracking dashboard for candidates
- [ ] Implement application review interface for employers
- [ ] Add application analytics and reporting UI
- [ ] Create couple application workflow interface

**Acceptance Criteria:**

- Application form shows match score and guides candidates
- Dashboard provides clear status tracking and updates
- Employer interface enables efficient application processing
- Analytics provide actionable insights
- Couple workflow handles joint applications smoothly

## Risk Mitigation Strategies

### Algorithm Complexity Risks

1. **Matching Algorithm Performance**
   - **Risk**: Complex calculations could slow down recommendations
   - **Mitigation**: Cache scores, use database indexing, batch processing
   - **Fallback**: Simplified scoring algorithm with fewer factors

2. **Data Quality Issues**
   - **Risk**: Incomplete candidate/job data affects matching accuracy
   - **Mitigation**: Data validation, completion incentives, default scoring
   - **Monitoring**: Track data completeness metrics

### Business Logic Risks

1. **Couple Application Complexity**
   - **Risk**: Joint applications create complex decision workflows
   - **Mitigation**: Clear business rules, comprehensive testing
   - **Fallback**: Individual applications with couple preference flag

2. **Matching Bias**
   - **Risk**: Algorithm could inadvertently discriminate
   - **Mitigation**: Regular bias testing, diverse data validation
   - **Compliance**: Ensure GDPR and equality compliance

## Testing Strategy

### Algorithm Testing

- [ ] Test matching scores with various candidate/job combinations
- [ ] Validate location-based distance calculations
- [ ] Test skills matching accuracy
- [ ] Verify language requirement scoring
- [ ] Test edge cases and data quality issues

### Workflow Testing

- [ ] Test complete application submission and approval flow
- [ ] Validate couple application workflows
- [ ] Test status change notifications
- [ ] Verify permission enforcement
- [ ] Test application withdrawal and rejection flows

### Performance Testing

- [ ] Load test recommendation endpoints
- [ ] Test matching algorithm performance with large datasets
- [ ] Validate database query optimization
- [ ] Test concurrent application submissions

## Documentation Requirements

### Algorithm Documentation

- [ ] Matching algorithm explanation and scoring weights
- [ ] Skills taxonomy documentation
- [ ] Location matching methodology
- [ ] Performance tuning guidelines

### API Documentation

- [ ] Application endpoints with examples
- [ ] Recommendation API documentation
- [ ] Couple application workflow guide
- [ ] Error handling and validation rules

## Deliverables Checklist

### Backend Deliverables

- [ ] Complete application models and workflow
- [ ] Matching algorithm implementation
- [ ] Couple application system
- [ ] Application management APIs
- [ ] Recommendation engine

### Frontend Deliverables

- [ ] Job application forms and interfaces
- [ ] Application tracking dashboards
- [ ] Employer application management interface
- [ ] Recommendation display components
- [ ] Analytics and reporting interfaces

### Algorithm Deliverables

- [ ] Skills-based matching system
- [ ] Location-based recommendations
- [ ] Preference filtering logic
- [ ] Performance optimization
- [ ] Bias testing and validation

## Next Phase Preparation

### Phase 5 Prerequisites

- [ ] Messaging system requirements defined
- [ ] Real-time notification needs identified
- [ ] Django Channels architecture planned
- [ ] WebSocket security considerations documented

This comprehensive plan ensures Phase 4 delivers a sophisticated application and matching system that connects candidates with suitable opportunities while providing employers with qualified candidates.
