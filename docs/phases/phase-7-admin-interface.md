# Phase 7: Admin Interface & Content Moderation - Detailed Implementation Plan

**Duration**: Week 7 (7 days)

**Dependencies**: Phase 6 (Document Management), Phase 3 (Core Business Models)

**Risk Level**: Medium

**Team**: 1 full-stack developer + Claude Code

## Overview

Phase 7 focuses on creating a comprehensive admin interface with advanced content moderation capabilities, automated workflow management, and sophisticated reporting tools. This phase ensures platform administrators can efficiently manage users, content, and business operations while maintaining high security and compliance standards.

## Success Criteria

- [ ] Comprehensive Django admin interface with custom views and workflows
- [ ] Automated content moderation system with AI-powered detection
- [ ] Advanced reporting dashboard with real-time analytics
- [ ] Bulk operations and data management tools
- [ ] Audit trail and compliance reporting system
- [ ] Mobile-responsive admin interface

## Detailed Task Breakdown

### 7.1 Django Admin Customization

#### 7.1.1 Custom Admin Interface Design

**Duration**: 6 hours

**Priority**: Critical

**Tasks:**

- [ ] Implement custom admin theme with Safe Job branding
- [ ] Create dashboard with key metrics and quick actions
- [ ] Add custom navigation with role-based access
- [ ] Implement responsive design for mobile admin access
- [ ] Create custom admin templates with enhanced UX

**Acceptance Criteria:**

- Admin interface matches Safe Job brand guidelines
- Dashboard provides actionable insights at a glance
- Navigation adapts to user roles and permissions
- Mobile-responsive design works on tablets and phones
- Loading times under 2 seconds for all admin pages

**Implementation Details:**

```python
# backend/src/safe_job/admin_interface/admin.py
from django.contrib import admin
from django.contrib.admin import AdminSite
from django.urls import path, reverse
from django.shortcuts import render, redirect
from django.db.models import Count, Q
from django.utils.html import format_html
from django.http import JsonResponse
from datetime import datetime, timedelta

class SafeJobAdminSite(AdminSite):
    """Custom admin site with enhanced functionality"""

    site_header = 'Safe Job Administration'
    site_title = 'Safe Job Admin'
    index_title = 'Platform Management Dashboard'

    def get_urls(self):
        """Add custom admin URLs"""
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_view(self.dashboard_view), name='dashboard'),
            path('analytics/', self.admin_view(self.analytics_view), name='analytics'),
            path('moderation/', self.admin_view(self.moderation_view), name='moderation'),
            path('reports/', self.admin_view(self.reports_view), name='reports'),
            path('api/stats/', self.admin_view(self.stats_api), name='stats_api'),
        ]
        return custom_urls + urls

    def dashboard_view(self, request):
        """Enhanced dashboard with key metrics"""
        from safe_job.users.models import User
        from safe_job.candidates.models import Candidate
        from safe_job.employers.models import Employer
        from safe_job.jobs.models import Job
        from safe_job.applications.models import Application
        from safe_job.documents.models import Document

        # Time ranges for metrics
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        # User metrics
        total_users = User.objects.count()
        new_users_week = User.objects.filter(date_joined__gte=week_ago).count()
        active_candidates = Candidate.objects.filter(is_active=True).count()
        verified_employers = Employer.objects.filter(verification_status='verified').count()

        # Job and application metrics
        active_jobs = Job.objects.filter(status='published').count()
        pending_jobs = Job.objects.filter(status='pending_approval').count()
        applications_today = Application.objects.filter(created_at__date=today).count()
        applications_week = Application.objects.filter(created_at__gte=week_ago).count()

        # Document verification queue
        pending_documents = Document.objects.filter(status='uploaded').count()
        rejected_documents = Document.objects.filter(
            status='rejected',
            updated_at__gte=week_ago
        ).count()

        # Content moderation alerts
        flagged_content = self._get_flagged_content_count()

        # Recent activities
        recent_activities = self._get_recent_activities()

        context = {
            'title': 'Dashboard',
            'metrics': {
                'users': {
                    'total': total_users,
                    'new_week': new_users_week,
                    'active_candidates': active_candidates,
                    'verified_employers': verified_employers,
                },
                'jobs': {
                    'active': active_jobs,
                    'pending': pending_jobs,
                    'applications_today': applications_today,
                    'applications_week': applications_week,
                },
                'documents': {
                    'pending': pending_documents,
                    'rejected_week': rejected_documents,
                },
                'moderation': {
                    'flagged_content': flagged_content,
                }
            },
            'recent_activities': recent_activities,
            'quick_actions': self._get_quick_actions(request),
        }

        return render(request, 'admin/dashboard.html', context)

    def _get_flagged_content_count(self):
        """Get count of content requiring moderation"""
        from safe_job.moderation.models import ModerationFlag
        return ModerationFlag.objects.filter(
            status='pending',
            is_active=True
        ).count()

    def _get_recent_activities(self):
        """Get recent platform activities"""
        from safe_job.core.models import AuditLog
        return AuditLog.objects.select_related('user').order_by('-created_at')[:10]

    def _get_quick_actions(self, request):
        """Generate contextual quick actions for admin user"""
        actions = []

        if request.user.has_perm('documents.change_document'):
            actions.append({
                'title': 'Review Documents',
                'url': reverse('admin:documents_document_changelist'),
                'icon': 'document-check',
                'count': Document.objects.filter(status='uploaded').count()
            })

        if request.user.has_perm('jobs.change_job'):
            actions.append({
                'title': 'Approve Jobs',
                'url': reverse('admin:jobs_job_changelist'),
                'icon': 'briefcase',
                'count': Job.objects.filter(status='pending_approval').count()
            })

        if request.user.has_perm('employers.change_employer'):
            actions.append({
                'title': 'Review Employers',
                'url': reverse('admin:employers_employer_changelist'),
                'icon': 'building-office',
                'count': Employer.objects.filter(verification_status='pending').count()
            })

        return actions

# Register custom admin site
admin_site = SafeJobAdminSite(name='safe_job_admin')
```

#### 7.1.2 Enhanced Model Admin Classes

**Duration**: 8 hours

**Priority**: Critical

**Tasks:**

- [ ] Create comprehensive admin classes for all models
- [ ] Implement advanced filtering and search capabilities
- [ ] Add bulk actions for common operations
- [ ] Create inline editing for related models
- [ ] Add custom admin actions with confirmations

**Acceptance Criteria:**

- All models have optimized admin interfaces
- Advanced filtering reduces search time by 80%
- Bulk operations handle 1000+ records efficiently
- Inline editing works seamlessly for complex relationships
- Custom actions include proper validation and error handling

**Implementation Details:**

```python
# backend/src/safe_job/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Q
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced user admin with role-based management"""

    list_display = [
        'email', 'get_full_name', 'user_type', 'is_active',
        'date_joined', 'last_login', 'verification_status', 'actions'
    ]
    list_filter = [
        'user_type', 'is_active', 'is_staff', 'date_joined',
        'email_verified', 'phone_verified', 'two_factor_enabled'
    ]
    search_fields = ['email', 'first_name', 'last_name', 'phone_number']
    readonly_fields = [
        'date_joined', 'last_login', 'failed_login_attempts',
        'password_changed_at', 'created_at', 'updated_at'
    ]

    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'phone_number', 'preferred_language')
        }),
        ('Account Settings', {
            'fields': ('user_type', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Verification Status', {
            'fields': ('email_verified', 'phone_verified', 'two_factor_enabled'),
            'classes': ('collapse',)
        }),
        ('Security', {
            'fields': ('failed_login_attempts', 'account_locked_until', 'password_changed_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('date_joined', 'last_login', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = [
        'activate_users', 'deactivate_users', 'verify_email',
        'reset_password', 'unlock_accounts', 'send_welcome_email'
    ]

    def verification_status(self, obj):
        """Display comprehensive verification status"""
        statuses = []
        if obj.email_verified:
            statuses.append('<span class="badge badge-success">Email ✓</span>')
        else:
            statuses.append('<span class="badge badge-warning">Email ✗</span>')

        if obj.phone_verified:
            statuses.append('<span class="badge badge-success">Phone ✓</span>')
        else:
            statuses.append('<span class="badge badge-secondary">Phone ✗</span>')

        if obj.two_factor_enabled:
            statuses.append('<span class="badge badge-info">2FA ✓</span>')

        return format_html(' '.join(statuses))
    verification_status.short_description = 'Verification'

    def actions(self, obj):
        """Custom action buttons"""
        actions = []

        if not obj.is_active:
            activate_url = reverse('admin:users_user_activate', args=[obj.pk])
            actions.append(f'<a href="{activate_url}" class="button">Activate</a>')

        if obj.user_type == 'candidate':
            candidate_url = reverse('admin:candidates_candidate_change', args=[obj.candidate.pk])
            actions.append(f'<a href="{candidate_url}" class="button">View Profile</a>')
        elif obj.user_type == 'employer':
            employer_url = reverse('admin:employers_employer_change', args=[obj.employer.pk])
            actions.append(f'<a href="{employer_url}" class="button">View Company</a>')

        return format_html(' | '.join(actions))
    actions.short_description = 'Actions'

    def activate_users(self, request, queryset):
        """Bulk activate user accounts"""
        count = queryset.filter(is_active=False).update(is_active=True)
        self.message_user(request, f'{count} users activated successfully.')
    activate_users.short_description = "Activate selected users"

    def deactivate_users(self, request, queryset):
        """Bulk deactivate user accounts"""
        count = queryset.filter(is_active=True).update(is_active=False)
        self.message_user(request, f'{count} users deactivated.')
    deactivate_users.short_description = "Deactivate selected users"

    def send_welcome_email(self, request, queryset):
        """Send welcome email to selected users"""
        from safe_job.core.tasks import send_bulk_email

        user_ids = list(queryset.values_list('id', flat=True))
        send_bulk_email.delay(
            user_ids=user_ids,
            template='welcome_email',
            subject='Welcome to Safe Job'
        )

        self.message_user(
            request,
            f'Welcome emails queued for {len(user_ids)} users.'
        )
    send_welcome_email.short_description = "Send welcome email"

    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related(
            'candidate', 'employer'
        ).annotate(
            applications_count=Count('candidate__applications', distinct=True),
            jobs_count=Count('employer__jobs', distinct=True)
        )
```

### 7.2 Content Moderation System

#### 7.2.1 Automated Content Detection

**Duration**: 10 hours

**Priority**: High

**Tasks:**

- [ ] Implement AI-powered content scanning for inappropriate material
- [ ] Create keyword-based filtering system
- [ ] Add image content analysis for uploaded photos
- [ ] Implement spam detection algorithms
- [ ] Create automated escalation workflows

**Acceptance Criteria:**

- Automated detection catches 95% of inappropriate content
- False positive rate below 5% for legitimate content
- Processing time under 2 seconds for text analysis
- Image analysis completed within 10 seconds
- Escalation workflows notify moderators within 1 minute

**Implementation Details:**

```python
# backend/src/safe_job/moderation/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from safe_job.core.models import BaseModel

User = get_user_model()

class ModerationRule(BaseModel):
    """Define automated moderation rules"""

    class ActionType(models.TextChoices):
        FLAG = 'flag', 'Flag for Review'
        HIDE = 'hide', 'Hide Content'
        DELETE = 'delete', 'Delete Content'
        SUSPEND = 'suspend', 'Suspend User'

    class ContentType(models.TextChoices):
        JOB_POSTING = 'job_posting', 'Job Posting'
        PROFILE = 'profile', 'User Profile'
        MESSAGE = 'message', 'Message'
        DOCUMENT = 'document', 'Document'
        COMMENT = 'comment', 'Comment'

    name = models.CharField(max_length=100)
    description = models.TextField()
    content_type = models.CharField(max_length=20, choices=ContentType.choices)
    is_active = models.BooleanField(default=True)

    # Rule configuration
    keywords = models.JSONField(default=list, help_text="Flagged keywords")
    patterns = models.JSONField(default=list, help_text="Regex patterns")
    ai_model = models.CharField(max_length=50, blank=True)
    confidence_threshold = models.FloatField(default=0.8)

    # Actions
    action_type = models.CharField(max_length=10, choices=ActionType.choices)
    auto_action = models.BooleanField(default=False)
    notify_user = models.BooleanField(default=True)
    escalate_to_human = models.BooleanField(default=True)

    class Meta:
        db_table = 'moderation_rule'

class ModerationFlag(BaseModel):
    """Track content flagged for moderation"""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        ESCALATED = 'escalated', 'Escalated'

    class Severity(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'

    # Generic relation to flagged content
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    # Flag details
    rule = models.ForeignKey(ModerationRule, on_delete=models.SET_NULL, null=True)
    reason = models.TextField()
    severity = models.CharField(max_length=10, choices=Severity.choices)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)

    # AI analysis results
    ai_confidence = models.FloatField(null=True, blank=True)
    ai_analysis = models.JSONField(null=True, blank=True)

    # Manual review
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)

    # Reporting
    reported_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='reported_flags'
    )
    is_user_report = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'moderation_flag'
        indexes = [
            models.Index(fields=['status', 'severity', 'created_at']),
            models.Index(fields=['content_type', 'object_id']),
        ]

# backend/src/safe_job/moderation/services.py
import re
import openai
from django.conf import settings
from django.utils import timezone
from .models import ModerationRule, ModerationFlag
from safe_job.core.tasks import send_notification

class ContentModerationService:
    """Service for automated content moderation"""

    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    def moderate_content(self, content_object, content_text, content_type):
        """Run comprehensive content moderation"""
        results = []

        # Run keyword filtering
        keyword_result = self._check_keywords(content_text, content_type)
        if keyword_result:
            results.append(keyword_result)

        # Run pattern matching
        pattern_result = self._check_patterns(content_text, content_type)
        if pattern_result:
            results.append(pattern_result)

        # Run AI moderation
        ai_result = self._ai_moderate_content(content_text, content_type)
        if ai_result:
            results.append(ai_result)

        # Process results and take actions
        for result in results:
            self._process_moderation_result(content_object, result)

        return results

    def _check_keywords(self, content_text, content_type):
        """Check content against keyword rules"""
        rules = ModerationRule.objects.filter(
            content_type=content_type,
            is_active=True,
            keywords__isnull=False
        )

        content_lower = content_text.lower()

        for rule in rules:
            for keyword in rule.keywords:
                if keyword.lower() in content_lower:
                    return {
                        'rule': rule,
                        'reason': f'Contains flagged keyword: {keyword}',
                        'confidence': 1.0,
                        'method': 'keyword'
                    }

        return None

    def _check_patterns(self, content_text, content_type):
        """Check content against regex patterns"""
        rules = ModerationRule.objects.filter(
            content_type=content_type,
            is_active=True,
            patterns__isnull=False
        )

        for rule in rules:
            for pattern in rule.patterns:
                if re.search(pattern, content_text, re.IGNORECASE):
                    return {
                        'rule': rule,
                        'reason': f'Matches pattern: {pattern}',
                        'confidence': 0.9,
                        'method': 'pattern'
                    }

        return None

    def _ai_moderate_content(self, content_text, content_type):
        """Use OpenAI moderation API for content analysis"""
        try:
            response = self.openai_client.moderations.create(input=content_text)
            result = response.results[0]

            if result.flagged:
                categories = [cat for cat, flagged in result.categories if flagged]
                return {
                    'rule': None,
                    'reason': f'AI flagged categories: {", ".join(categories)}',
                    'confidence': max(result.category_scores.values()),
                    'method': 'ai',
                    'ai_analysis': {
                        'categories': dict(result.categories),
                        'scores': dict(result.category_scores)
                    }
                }

        except Exception as e:
            # Log error but don't fail moderation
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"AI moderation failed: {e}")

        return None

    def _process_moderation_result(self, content_object, result):
        """Process moderation result and take appropriate action"""
        rule = result.get('rule')

        # Determine severity based on confidence and rule
        if result['confidence'] >= 0.9:
            severity = ModerationFlag.Severity.HIGH
        elif result['confidence'] >= 0.7:
            severity = ModerationFlag.Severity.MEDIUM
        else:
            severity = ModerationFlag.Severity.LOW

        # Create moderation flag
        flag = ModerationFlag.objects.create(
            content_object=content_object,
            rule=rule,
            reason=result['reason'],
            severity=severity,
            ai_confidence=result['confidence'],
            ai_analysis=result.get('ai_analysis')
        )

        # Take automated action if configured
        if rule and rule.auto_action:
            self._take_automated_action(content_object, rule, flag)

        # Notify moderators if escalation required
        if not rule or rule.escalate_to_human:
            self._notify_moderators(flag)

    def _take_automated_action(self, content_object, rule, flag):
        """Execute automated moderation actions"""
        if rule.action_type == ModerationRule.ActionType.HIDE:
            # Hide content (set is_active=False if available)
            if hasattr(content_object, 'is_active'):
                content_object.is_active = False
                content_object.save()

        elif rule.action_type == ModerationRule.ActionType.DELETE:
            # Soft delete content
            if hasattr(content_object, 'deleted_at'):
                content_object.deleted_at = timezone.now()
                content_object.save()

        elif rule.action_type == ModerationRule.ActionType.SUSPEND:
            # Suspend user account
            if hasattr(content_object, 'owner') or hasattr(content_object, 'user'):
                user = getattr(content_object, 'owner', None) or getattr(content_object, 'user', None)
                if user:
                    user.is_active = False
                    user.save()

                    # Send suspension notification
                    send_notification.delay(
                        user_id=user.id,
                        title="Account Suspended",
                        message="Your account has been suspended due to policy violations.",
                        type="account_suspension"
                    )

    def _notify_moderators(self, flag):
        """Notify human moderators of flagged content"""
        from django.contrib.auth import get_user_model
        User = get_user_model()

        moderators = User.objects.filter(
            is_staff=True,
            groups__name='Moderators'
        )

        for moderator in moderators:
            send_notification.delay(
                user_id=moderator.id,
                title="Content Flagged for Review",
                message=f"New {flag.severity} severity flag: {flag.reason}",
                type="moderation_alert",
                data={
                    'flag_id': flag.id,
                    'content_type': flag.content_type.model,
                    'severity': flag.severity
                }
            )
```

#### 7.2.2 Moderation Workflow Interface

**Duration**: 6 hours

**Priority**: High

**Tasks:**

- [ ] Create moderation queue interface
- [ ] Implement bulk moderation actions
- [ ] Add content preview and comparison tools
- [ ] Create moderation decision tracking
- [ ] Implement appeal process workflow

**Acceptance Criteria:**

- Moderators can process 50+ items per hour efficiently
- Bulk actions support consistent decision making
- Content preview shows full context for decisions
- All moderation decisions tracked with audit trail
- Appeal process provides fair review mechanism

**Implementation Details:**

```python
# backend/src/safe_job/moderation/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import path, reverse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.db.models import Count, Q
from .models import ModerationRule, ModerationFlag

@admin.register(ModerationFlag)
class ModerationFlagAdmin(admin.ModelAdmin):
    """Enhanced moderation queue interface"""

    list_display = [
        'content_preview', 'severity', 'status', 'reason_short',
        'ai_confidence', 'created_at', 'actions'
    ]
    list_filter = [
        'status', 'severity', 'content_type', 'is_user_report',
        'created_at', 'reviewed_at'
    ]
    search_fields = ['reason', 'review_notes']
    readonly_fields = [
        'content_type', 'object_id', 'ai_confidence', 'ai_analysis',
        'created_at', 'reviewed_at', 'reviewed_by'
    ]

    actions = [
        'approve_content', 'reject_content', 'escalate_flags',
        'bulk_approve', 'bulk_reject'
    ]

    def get_urls(self):
        """Add custom moderation URLs"""
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:flag_id>/review/',
                self.admin_site.admin_view(self.review_content),
                name='moderation_flag_review'
            ),
            path(
                'bulk-review/',
                self.admin_site.admin_view(self.bulk_review),
                name='moderation_flag_bulk_review'
            ),
        ]
        return custom_urls + urls

    def content_preview(self, obj):
        """Show preview of flagged content"""
        content = obj.content_object

        if hasattr(content, 'title'):
            preview = content.title[:50]
        elif hasattr(content, 'description'):
            preview = content.description[:50]
        elif hasattr(content, 'content'):
            preview = content.content[:50]
        else:
            preview = str(content)[:50]

        if len(preview) == 50:
            preview += "..."

        return format_html(
            '<div class="content-preview">'
            '<strong>{}</strong><br>'
            '<small>{}</small>'
            '</div>',
            obj.content_type.model.title(),
            preview
        )
    content_preview.short_description = 'Content'

    def reason_short(self, obj):
        """Show shortened reason"""
        return obj.reason[:100] + "..." if len(obj.reason) > 100 else obj.reason
    reason_short.short_description = 'Reason'

    def actions(self, obj):
        """Custom action buttons"""
        if obj.status == ModerationFlag.Status.PENDING:
            review_url = reverse('admin:moderation_flag_review', args=[obj.pk])
            return format_html(
                '<a href="{}" class="button">Review</a>',
                review_url
            )
        return format_html('<span class="text-muted">Reviewed</span>')
    actions.short_description = 'Actions'

    def review_content(self, request, flag_id):
        """Detailed content review interface"""
        flag = get_object_or_404(ModerationFlag, id=flag_id)

        if request.method == 'POST':
            action = request.POST.get('action')
            notes = request.POST.get('review_notes', '')

            if action == 'approve':
                flag.status = ModerationFlag.Status.APPROVED
                flag.reviewed_by = request.user
                flag.reviewed_at = timezone.now()
                flag.review_notes = notes
                flag.save()

                # Restore content if it was hidden
                self._restore_content(flag)

                messages.success(request, 'Content approved successfully.')

            elif action == 'reject':
                flag.status = ModerationFlag.Status.REJECTED
                flag.reviewed_by = request.user
                flag.reviewed_at = timezone.now()
                flag.review_notes = notes
                flag.save()

                # Take enforcement action
                self._enforce_rejection(flag)

                messages.success(request, 'Content rejected and action taken.')

            return redirect('admin:moderation_moderationflag_changelist')

        # Get related flags for context
        related_flags = ModerationFlag.objects.filter(
            content_type=flag.content_type,
            object_id=flag.object_id
        ).exclude(id=flag.id)

        context = {
            'flag': flag,
            'content': flag.content_object,
            'related_flags': related_flags,
            'ai_analysis': flag.ai_analysis,
            'title': f'Review: {flag.content_type.model.title()}'
        }

        return render(request, 'admin/moderation/review_content.html', context)

    def bulk_review(self, request):
        """Bulk review interface for efficient processing"""
        if request.method == 'POST':
            flag_ids = request.POST.getlist('flag_ids')
            action = request.POST.get('bulk_action')
            notes = request.POST.get('bulk_notes', '')

            flags = ModerationFlag.objects.filter(
                id__in=flag_ids,
                status=ModerationFlag.Status.PENDING
            )

            count = 0
            for flag in flags:
                if action == 'approve':
                    flag.status = ModerationFlag.Status.APPROVED
                    self._restore_content(flag)
                elif action == 'reject':
                    flag.status = ModerationFlag.Status.REJECTED
                    self._enforce_rejection(flag)

                flag.reviewed_by = request.user
                flag.reviewed_at = timezone.now()
                flag.review_notes = notes
                flag.save()
                count += 1

            messages.success(request, f'{count} flags processed successfully.')
            return redirect('admin:moderation_moderationflag_changelist')

        # Get pending flags for bulk review
        pending_flags = ModerationFlag.objects.filter(
            status=ModerationFlag.Status.PENDING
        ).order_by('-severity', 'created_at')[:20]

        context = {
            'pending_flags': pending_flags,
            'title': 'Bulk Review'
        }

        return render(request, 'admin/moderation/bulk_review.html', context)

    def _restore_content(self, flag):
        """Restore content that was automatically hidden"""
        content = flag.content_object
        if hasattr(content, 'is_active') and not content.is_active:
            content.is_active = True
            content.save()

    def _enforce_rejection(self, flag):
        """Enforce rejection by hiding/deleting content"""
        content = flag.content_object

        # Hide content
        if hasattr(content, 'is_active'):
            content.is_active = False
            content.save()

        # Notify content owner
        if hasattr(content, 'owner') or hasattr(content, 'user'):
            user = getattr(content, 'owner', None) or getattr(content, 'user', None)
            if user:
                from safe_job.core.tasks import send_notification
                send_notification.delay(
                    user_id=user.id,
                    title="Content Removed",
                    message=f"Your {flag.content_type.model} has been removed due to policy violations.",
                    type="content_removed"
                )
```

### 7.3 Analytics & Reporting Dashboard

#### 7.3.1 Real-time Analytics Implementation

**Duration**: 8 hours

**Priority**: Medium

**Tasks:**

- [ ] Create real-time metrics dashboard with WebSocket updates
- [ ] Implement user behavior tracking and analytics
- [ ] Add business intelligence reports for platform growth
- [ ] Create automated report generation and scheduling
- [ ] Implement data export functionality

**Acceptance Criteria:**

- Dashboard updates in real-time with sub-second latency
- User behavior tracked with privacy compliance
- Business reports generated automatically daily/weekly/monthly
- Data export supports multiple formats (CSV, Excel, PDF)
- Analytics data accurate to 99.9% confidence level

**Implementation Details:**

```python
# backend/src/safe_job/analytics/models.py
from django.db import models
from django.contrib.auth import get_user_model
from safe_job.core.models import BaseModel
import json

User = get_user_model()

class AnalyticsEvent(BaseModel):
    """Track user interactions and system events"""

    class EventType(models.TextChoices):
        PAGE_VIEW = 'page_view', 'Page View'
        USER_ACTION = 'user_action', 'User Action'
        SYSTEM_EVENT = 'system_event', 'System Event'
        BUSINESS_EVENT = 'business_event', 'Business Event'

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=100, blank=True)
    event_type = models.CharField(max_length=20, choices=EventType.choices)
    event_name = models.CharField(max_length=100)
    event_data = models.JSONField(default=dict)

    # Request context
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    referer = models.URLField(blank=True)

    # Timestamps
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'analytics_event'
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['event_type', 'event_name', 'timestamp']),
            models.Index(fields=['timestamp']),
        ]

class DailyMetrics(BaseModel):
    """Aggregated daily platform metrics"""

    date = models.DateField(unique=True)

    # User metrics
    total_users = models.IntegerField(default=0)
    new_users = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    verified_employers = models.IntegerField(default=0)
    active_candidates = models.IntegerField(default=0)

    # Job metrics
    jobs_posted = models.IntegerField(default=0)
    jobs_approved = models.IntegerField(default=0)
    jobs_active = models.IntegerField(default=0)

    # Application metrics
    applications_submitted = models.IntegerField(default=0)
    applications_viewed = models.IntegerField(default=0)
    matches_made = models.IntegerField(default=0)

    # Document metrics
    documents_uploaded = models.IntegerField(default=0)
    documents_verified = models.IntegerField(default=0)

    # Moderation metrics
    content_flagged = models.IntegerField(default=0)
    content_approved = models.IntegerField(default=0)
    content_rejected = models.IntegerField(default=0)

    # Revenue metrics (if applicable)
    revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = 'analytics_daily_metrics'
        ordering = ['-date']

# backend/src/safe_job/analytics/services.py
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from .models import AnalyticsEvent, DailyMetrics

class AnalyticsService:
    """Service for analytics data processing and aggregation"""

    def track_event(self, event_type, event_name, user=None, session_id=None,
                   event_data=None, request=None):
        """Track a single analytics event"""
        event_data = event_data or {}

        # Extract request context
        ip_address = self._get_client_ip(request) if request else '127.0.0.1'
        user_agent = request.META.get('HTTP_USER_AGENT', '') if request else ''
        referer = request.META.get('HTTP_REFERER', '') if request else ''

        AnalyticsEvent.objects.create(
            user=user,
            session_id=session_id,
            event_type=event_type,
            event_name=event_name,
            event_data=event_data,
            ip_address=ip_address,
            user_agent=user_agent,
            referer=referer
        )

    def generate_daily_metrics(self, date=None):
        """Generate aggregated daily metrics"""
        if date is None:
            date = timezone.now().date() - timedelta(days=1)

        start_datetime = datetime.combine(date, datetime.min.time())
        end_datetime = datetime.combine(date, datetime.max.time())

        from safe_job.users.models import User
        from safe_job.candidates.models import Candidate
        from safe_job.employers.models import Employer
        from safe_job.jobs.models import Job
        from safe_job.applications.models import Application
        from safe_job.documents.models import Document
        from safe_job.moderation.models import ModerationFlag

        # User metrics
        total_users = User.objects.filter(date_joined__lte=end_datetime).count()
        new_users = User.objects.filter(
            date_joined__range=[start_datetime, end_datetime]
        ).count()

        # Active users (logged in or performed actions in last 24h)
        active_users = User.objects.filter(
            Q(last_login__range=[start_datetime, end_datetime]) |
            Q(analyticsevent__timestamp__range=[start_datetime, end_datetime])
        ).distinct().count()

        verified_employers = Employer.objects.filter(
            verification_status='verified',
            verified_at__lte=end_datetime
        ).count()

        active_candidates = Candidate.objects.filter(
            is_active=True,
            user__date_joined__lte=end_datetime
        ).count()

        # Job metrics
        jobs_posted = Job.objects.filter(
            created_at__range=[start_datetime, end_datetime]
        ).count()

        jobs_approved = Job.objects.filter(
            status='published',
            updated_at__range=[start_datetime, end_datetime]
        ).count()

        jobs_active = Job.objects.filter(
            status='published',
            created_at__lte=end_datetime,
            expires_at__gt=end_datetime
        ).count()

        # Application metrics
        applications_submitted = Application.objects.filter(
            created_at__range=[start_datetime, end_datetime]
        ).count()

        # Document metrics
        documents_uploaded = Document.objects.filter(
            created_at__range=[start_datetime, end_datetime]
        ).count()

        documents_verified = Document.objects.filter(
            status='verified',
            verified_at__range=[start_datetime, end_datetime]
        ).count()

        # Moderation metrics
        content_flagged = ModerationFlag.objects.filter(
            created_at__range=[start_datetime, end_datetime]
        ).count()

        content_approved = ModerationFlag.objects.filter(
            status='approved',
            reviewed_at__range=[start_datetime, end_datetime]
        ).count()

        content_rejected = ModerationFlag.objects.filter(
            status='rejected',
            reviewed_at__range=[start_datetime, end_datetime]
        ).count()

        # Create or update daily metrics
        metrics, created = DailyMetrics.objects.update_or_create(
            date=date,
            defaults={
                'total_users': total_users,
                'new_users': new_users,
                'active_users': active_users,
                'verified_employers': verified_employers,
                'active_candidates': active_candidates,
                'jobs_posted': jobs_posted,
                'jobs_approved': jobs_approved,
                'jobs_active': jobs_active,
                'applications_submitted': applications_submitted,
                'documents_uploaded': documents_uploaded,
                'documents_verified': documents_verified,
                'content_flagged': content_flagged,
                'content_approved': content_approved,
                'content_rejected': content_rejected,
            }
        )

        return metrics

    def get_dashboard_data(self, days=30):
        """Get comprehensive dashboard data"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)

        metrics = DailyMetrics.objects.filter(
            date__range=[start_date, end_date]
        ).order_by('date')

        # Calculate trends
        if len(metrics) >= 2:
            latest = metrics.last()
            previous = metrics[len(metrics)//2]  # Compare to middle point

            user_growth = self._calculate_growth(latest.total_users, previous.total_users)
            job_growth = self._calculate_growth(latest.jobs_active, previous.jobs_active)
            application_growth = self._calculate_growth(
                latest.applications_submitted,
                previous.applications_submitted
            )
        else:
            user_growth = job_growth = application_growth = 0

        return {
            'current_stats': metrics.last() if metrics else None,
            'historical_data': list(metrics.values()),
            'trends': {
                'user_growth': user_growth,
                'job_growth': job_growth,
                'application_growth': application_growth,
            },
            'top_events': self._get_top_events(days),
        }

    def _calculate_growth(self, current, previous):
        """Calculate percentage growth"""
        if previous == 0:
            return 100 if current > 0 else 0
        return round(((current - previous) / previous) * 100, 2)

    def _get_top_events(self, days):
        """Get most frequent events in time period"""
        start_date = timezone.now() - timedelta(days=days)

        return AnalyticsEvent.objects.filter(
            timestamp__gte=start_date
        ).values('event_name').annotate(
            count=Count('id')
        ).order_by('-count')[:10]

    def _get_client_ip(self, request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
```

### 7.4 Data Management & Export Tools

#### 7.4.1 Bulk Operations Interface

**Duration**: 4 hours

**Priority**: Medium

**Tasks:**

- [ ] Create bulk data import/export functionality
- [ ] Implement data validation and cleaning tools
- [ ] Add scheduled backup and archival system
- [ ] Create data anonymization tools for compliance
- [ ] Implement audit trail for all data operations

**Acceptance Criteria:**

- Bulk operations handle 10,000+ records efficiently
- Data validation catches 99% of format/consistency issues
- Automated backups run successfully daily
- Data anonymization removes all PII while preserving analytics value
- Complete audit trail for all data modifications

## Risk Assessment & Mitigation

### High Risk Areas

1. **Content Moderation Accuracy**
   - **Risk**: False positives blocking legitimate content
   - **Mitigation**: Multi-layered validation, human review queue, appeal process
   - **Monitoring**: Accuracy metrics, user feedback, regular rule tuning

2. **Admin Interface Security**
   - **Risk**: Unauthorized access to sensitive admin functions
   - **Mitigation**: Role-based permissions, 2FA enforcement, session monitoring
   - **Monitoring**: Login attempts, privilege escalation attempts, unusual activity

### Medium Risk Areas

1. **Performance with Large Datasets**
   - **Risk**: Admin interface becomes slow with growth
   - **Mitigation**: Database optimization, caching, pagination
   - **Monitoring**: Response times, query performance, resource usage

2. **AI Moderation Costs**
   - **Risk**: High API costs from OpenAI usage
   - **Mitigation**: Caching results, rate limiting, hybrid approach
   - **Monitoring**: API usage, cost per moderation, accuracy metrics

## Testing Requirements

### Unit Tests

- [ ] Admin interface functionality
- [ ] Content moderation algorithms
- [ ] Analytics data aggregation
- [ ] Bulk operations and data export

### Integration Tests

- [ ] Complete moderation workflow
- [ ] Admin dashboard real-time updates
- [ ] Report generation and scheduling
- [ ] Data import/export processes

### Security Tests

- [ ] Admin authentication and authorization
- [ ] Content moderation bypass attempts
- [ ] Data export access controls
- [ ] Audit trail integrity

### Performance Tests

- [ ] Admin interface under load
- [ ] Bulk operations with large datasets
- [ ] Real-time analytics updates
- [ ] Report generation performance

## Documentation Requirements

- [ ] Admin user guide with screenshots
- [ ] Content moderation procedures
- [ ] Analytics dashboard documentation
- [ ] Data export/import procedures
- [ ] Troubleshooting guide for common issues

## Deliverables Checklist

### Code Deliverables

- [ ] Custom Django admin interface
- [ ] Content moderation system
- [ ] Analytics and reporting dashboard
- [ ] Bulk operations and data management tools
- [ ] Admin API endpoints

### Configuration Deliverables

- [ ] Admin user roles and permissions
- [ ] Content moderation rules configuration
- [ ] Analytics tracking setup
- [ ] Automated report scheduling
- [ ] Backup and archival procedures

### Documentation Deliverables

- [ ] Admin interface documentation
- [ ] Moderation procedures guide
- [ ] Analytics interpretation guide
- [ ] Data management procedures

## Success Metrics

- **Admin Efficiency**: Process 90% of moderation queue within 24 hours
- **Moderation Accuracy**: <5% false positive rate, >95% true positive rate
- **Dashboard Performance**: <2 second load times for all admin pages
- **Data Operations**: Process 10,000+ records in bulk operations under 5 minutes
- **User Satisfaction**: >4.5/5 rating from admin users for interface usability

This comprehensive admin interface provides powerful tools for platform management while maintaining security, efficiency, and scalability for the Safe Job platform.
