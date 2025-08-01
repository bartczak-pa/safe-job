# Phase 6: Document Management & File Upload - Detailed Implementation Plan

**Duration**: Week 6 (7 days)

**Dependencies**: Phase 5 completion

**Risk Level**: Medium (S3 integration, file security)

**Team**: 1 full-stack developer + Claude Code

## Overview

Phase 6 implements a comprehensive document management system with secure file uploads, AWS S3 integration, document preview capabilities, and robust security measures. This system handles verification documents, CVs, certificates, and message attachments while ensuring data protection and compliance with privacy regulations.

## Success Criteria

- [ ] Secure file upload system with AWS S3 integration operational
- [ ] Document categorization and metadata management functional
- [ ] File preview system with PDF.js integration working
- [ ] Comprehensive file security validation implemented
- [ ] Document sharing and permission controls active
- [ ] File compression and optimization system operational

## Detailed Task Breakdown

### 6.1 Document Upload System

#### 6.1.1 File Upload Infrastructure

**Duration**: 2 days

**Priority**: Critical

**Risk Level**: Medium

**Tasks:**

- [ ] Configure AWS S3 integration with secure upload policies
- [ ] Implement comprehensive file validation and security scanning
- [ ] Create document categorization system (CV, certificates, ID)
- [ ] Build file preview system with PDF.js integration
- [ ] Add file compression and optimization

**Implementation Details:**

**AWS S3 Configuration (`config/settings/base.py`):**

```python
# AWS S3 Configuration
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'eu-west-1')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'

# S3 Settings
AWS_DEFAULT_ACL = 'private'
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}
AWS_S3_FILE_OVERWRITE = False
AWS_QUERYSTRING_AUTH = True
AWS_QUERYSTRING_EXPIRE = 3600  # 1 hour

# Storage backends
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
FILE_UPLOAD_PERMISSIONS = 0o644

# Allowed file types
ALLOWED_DOCUMENT_TYPES = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
```

**Document Models (`documents/models.py`):**

```python
from django.contrib.gis.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator
from django.utils import timezone
import uuid
import os

User = get_user_model()

def document_upload_path(instance, filename):
    """Generate upload path for documents"""
    # Create path: documents/user_id/category/year/month/filename
    return f"documents/{instance.owner.id}/{instance.category}/{timezone.now().year}/{timezone.now().month}/{filename}"

class DocumentCategory(models.Model):
    """Categories for document organization"""
    CATEGORY_TYPES = [
        ('verification', 'Verification Documents'),
        ('cv', 'CVs and Resumes'),
        ('certificate', 'Certificates and Qualifications'),
        ('id', 'Identity Documents'),
        ('contract', 'Contracts and Agreements'),
        ('other', 'Other Documents')
    ]

    name = models.CharField(max_length=100, unique=True)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES)
    description = models.TextField(blank=True)
    allowed_file_types = models.JSONField(default=list)  # ['pdf', 'jpg', 'png']
    max_file_size = models.PositiveIntegerField(default=10485760)  # 10MB in bytes
    requires_verification = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Document Categories"
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

class Document(models.Model):
    """Main document model"""
    DOCUMENT_STATUS_CHOICES = [
        ('pending', 'Pending Upload'),
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired')
    ]

    PRIVACY_LEVELS = [
        ('private', 'Private - Only owner can view'),
        ('employer_visible', 'Visible to employers when applying'),
        ('public', 'Public - Visible to all verified users'),
        ('admin_only', 'Admin only')
    ]

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    category = models.ForeignKey(DocumentCategory, on_delete=models.CASCADE)

    # File Information
    file = models.FileField(
        upload_to=document_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif'])]
    )
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=100)
    file_hash = models.CharField(max_length=64, unique=True, help_text="SHA256 hash for duplicate detection")

    # Document Metadata
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    document_date = models.DateField(null=True, blank=True, help_text="Date the document was created/issued")
    expiry_date = models.DateField(null=True, blank=True, help_text="Document expiry date if applicable")

    # Status and Privacy
    status = models.CharField(max_length=20, choices=DOCUMENT_STATUS_CHOICES, default='uploaded')
    privacy_level = models.CharField(max_length=20, choices=PRIVACY_LEVELS, default='private')

    # Verification Information
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='verified_documents'
    )
    verification_notes = models.TextField(blank=True)

    # Security and Processing
    virus_scan_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending Scan'),
            ('clean', 'Clean'),
            ('infected', 'Infected'),
            ('error', 'Scan Error')
        ],
        default='pending'
    )
    virus_scan_date = models.DateTimeField(null=True, blank=True)

    # OCR and Text Extraction
    extracted_text = models.TextField(blank=True, help_text="OCR extracted text for search")
    text_extraction_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('not_applicable', 'Not Applicable')
        ],
        default='pending'
    )

    # Access Control
    shared_with = models.ManyToManyField(User, through='DocumentShare', blank=True)
    download_count = models.PositiveIntegerField(default=0)
    last_accessed_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'documents_document'
        indexes = [
            models.Index(fields=['owner', 'category']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['privacy_level']),
            models.Index(fields=['file_hash']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.owner.get_full_name()}"

    def save(self, *args, **kwargs):
        if self.file:
            # Set file metadata
            self.file_size = self.file.size
            self.content_type = self.file.file.content_type if hasattr(self.file.file, 'content_type') else 'application/octet-stream'
            self.original_filename = self.file.name

            # Generate file hash for duplicate detection
            if not self.file_hash:
                self.file_hash = self.calculate_file_hash()

        super().save(*args, **kwargs)

    def calculate_file_hash(self):
        """Calculate SHA256 hash of file content"""
        import hashlib

        if self.file:
            hash_sha256 = hashlib.sha256()
            for chunk in self.file.chunks():
                hash_sha256.update(chunk)
            return hash_sha256.hexdigest()
        return None

    def get_download_url(self, expires_in=3600):
        """Generate secure download URL"""
        if self.file:
            return self.file.url  # S3 will handle signed URLs based on settings
        return None

    def can_be_viewed_by(self, user):
        """Check if user can view this document"""
        if self.owner == user:
            return True

        if user.is_staff and self.privacy_level == 'admin_only':
            return True

        if self.privacy_level == 'public':
            return True

        if self.privacy_level == 'employer_visible' and hasattr(user, 'employer_profile'):
            # Check if user is employer who received application from document owner
            from applications.models import JobApplication
            return JobApplication.objects.filter(
                candidate__user=self.owner,
                job__employer__user=user
            ).exists()

        # Check explicit sharing
        return self.documentshare_set.filter(shared_with=user, is_active=True).exists()

class DocumentShare(models.Model):
    """Explicit document sharing between users"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    shared_with = models.ForeignKey(User, on_delete=models.CASCADE)
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents_shared')

    permissions = models.JSONField(default=dict)  # {'view': True, 'download': True, 'comment': False}
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['document', 'shared_with']

class DocumentVersion(models.Model):
    """Track document versions"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    file = models.FileField(upload_to=document_upload_path)
    file_size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=100)
    upload_reason = models.CharField(max_length=200, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['document', 'version_number']
        ordering = ['-version_number']

class DocumentComment(models.Model):
    """Comments on documents (for verification process)"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=1000)
    is_internal = models.BooleanField(default=False, help_text="Internal admin comment not visible to document owner")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
```

**File Upload Service (`documents/services.py`):**

```python
import hashlib
import magic
from PIL import Image
from django.core.files.base import ContentFile
from django.conf import settings
import boto3
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

class FileValidationService:
    """Comprehensive file validation and security"""

    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_MIME_TYPES = {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
    }

    @classmethod
    def validate_file(cls, uploaded_file) -> dict:
        """Comprehensive file validation"""
        result = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'file_info': {}
        }

        # Check file size
        if uploaded_file.size > cls.MAX_FILE_SIZE:
            result['is_valid'] = False
            result['errors'].append(f'File size ({uploaded_file.size} bytes) exceeds maximum allowed size ({cls.MAX_FILE_SIZE} bytes)')

        # Check file content type using magic numbers
        try:
            file_mime = magic.from_buffer(uploaded_file.read(1024), mime=True)
            uploaded_file.seek(0)  # Reset file pointer

            if file_mime not in cls.ALLOWED_MIME_TYPES:
                result['is_valid'] = False
                result['errors'].append(f'File type {file_mime} is not allowed')

            result['file_info']['detected_mime_type'] = file_mime

        except Exception as e:
            result['warnings'].append(f'Could not detect file type: {str(e)}')

        # Check file extension
        file_extension = uploaded_file.name.lower().split('.')[-1] if '.' in uploaded_file.name else ''
        if file_extension:
            result['file_info']['extension'] = f'.{file_extension}'

        # Validate filename
        if not cls._is_safe_filename(uploaded_file.name):
            result['is_valid'] = False
            result['errors'].append('Filename contains unsafe characters')

        # Calculate file hash
        try:
            result['file_info']['file_hash'] = cls._calculate_file_hash(uploaded_file)
        except Exception as e:
            result['warnings'].append(f'Could not calculate file hash: {str(e)}')

        return result

    @classmethod
    def _is_safe_filename(cls, filename: str) -> bool:
        """Check if filename is safe"""
        import re
        # Allow alphanumeric, spaces, dots, hyphens, underscores
        safe_pattern = re.compile(r'^[a-zA-Z0-9\s\.\-_]+$')
        return bool(safe_pattern.match(filename)) and len(filename) <= 255

    @classmethod
    def _calculate_file_hash(cls, uploaded_file) -> str:
        """Calculate SHA256 hash of file"""
        hash_sha256 = hashlib.sha256()
        for chunk in uploaded_file.chunks():
            hash_sha256.update(chunk)
        uploaded_file.seek(0)  # Reset file pointer
        return hash_sha256.hexdigest()

class FileCompressionService:
    """Handle file compression and optimization"""

    @classmethod
    def compress_image(cls, image_file, max_size=(1920, 1080), quality=85):
        """Compress and optimize images"""
        try:
            with Image.open(image_file) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')

                # Resize if too large
                img.thumbnail(max_size, Image.Resampling.LANCZOS)

                # Save compressed version
                from io import BytesIO
                output = BytesIO()
                img.save(output, format='JPEG', quality=quality, optimize=True)
                output.seek(0)

                return ContentFile(output.read(), name=f"compressed_{image_file.name}")

        except Exception as e:
            logger.error(f"Error compressing image: {str(e)}")
            return image_file  # Return original if compression fails

    @classmethod
    def should_compress(cls, file_obj) -> bool:
        """Determine if file should be compressed"""
        mime_type = getattr(file_obj, 'content_type', '')
        return (
            mime_type.startswith('image/') and
            file_obj.size > 1024 * 1024  # Compress images larger than 1MB
        )

class VirusScanService:
    """Virus scanning for uploaded files"""

    @classmethod
    def scan_file(cls, file_path: str) -> dict:
        """Scan file for viruses (mock implementation - use ClamAV or similar in production)"""
        # In production, integrate with ClamAV or cloud-based virus scanning
        # For now, implement basic checks

        result = {
            'is_clean': True,
            'scan_result': 'clean',
            'details': 'File passed basic security checks'
        }

        try:
            # Basic file size check (extremely large files might be suspicious)
            import os
            file_size = os.path.getsize(file_path)
            if file_size > 50 * 1024 * 1024:  # 50MB
                result['is_clean'] = False
                result['scan_result'] = 'suspicious'
                result['details'] = 'File size exceeds security limits'

            # Check for executable file extensions in disguise
            with open(file_path, 'rb') as f:
                header = f.read(1024)
                if header.startswith(b'MZ') or header.startswith(b'\x7fELF'):
                    result['is_clean'] = False
                    result['scan_result'] = 'infected'
                    result['details'] = 'Executable file detected'

        except Exception as e:
            result['is_clean'] = False
            result['scan_result'] = 'error'
            result['details'] = f'Scan error: {str(e)}'

        return result

class DocumentProcessingService:
    """Handle document processing and OCR"""

    @classmethod
    def extract_text_from_pdf(cls, file_path: str) -> str:
        """Extract text from PDF using PyPDF2"""
        try:
            import PyPDF2
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return ""

    @classmethod
    def extract_text_from_image(cls, file_path: str) -> str:
        """Extract text from image using OCR (requires Tesseract)"""
        try:
            import pytesseract
            from PIL import Image

            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            return ""

    @classmethod
    def process_document(cls, document):
        """Process document for text extraction"""
        if not document.file:
            return

        file_path = document.file.path
        extracted_text = ""

        if document.content_type == 'application/pdf':
            extracted_text = cls.extract_text_from_pdf(file_path)
        elif document.content_type.startswith('image/'):
            extracted_text = cls.extract_text_from_image(file_path)

        if extracted_text:
            document.extracted_text = extracted_text
            document.text_extraction_status = 'completed'
        else:
            document.text_extraction_status = 'failed'

        document.save(update_fields=['extracted_text', 'text_extraction_status'])
```

#### 6.1.2 Document Management API

**Duration**: 1.5 days

**Priority**: Critical

**Tasks:**

- [ ] Build secure file upload endpoints with authentication
- [ ] Create document listing and metadata management
- [ ] Implement document sharing with permission controls
- [ ] Add document version control and history tracking
- [ ] Create document expiration and cleanup system

**Document API (`documents/api/views.py`):**

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from django.core.exceptions import PermissionDenied
from .serializers import DocumentSerializer, DocumentCategorySerializer
from ..models import Document, DocumentCategory
from ..services import FileValidationService, FileCompressionService, VirusScanService

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Document.objects.filter(
            owner=self.request.user,
            deleted_at__isnull=True
        ).select_related('category', 'verified_by')

    def perform_create(self, serializer):
        """Handle document upload with validation"""
        uploaded_file = self.request.FILES.get('file')
        if not uploaded_file:
            raise ValidationError("No file provided")

        # Validate file
        validation_result = FileValidationService.validate_file(uploaded_file)
        if not validation_result['is_valid']:
            raise ValidationError({
                'file': validation_result['errors']
            })

        # Compress if applicable
        if FileCompressionService.should_compress(uploaded_file):
            uploaded_file = FileCompressionService.compress_image(uploaded_file)

        # Save document
        document = serializer.save(
            owner=self.request.user,
            file=uploaded_file,
            file_hash=validation_result['file_info'].get('file_hash')
        )

        # Start background processing (virus scan, OCR)
        self.start_background_processing(document)

    def start_background_processing(self, document):
        """Start background processing tasks"""
        # In production, use Celery for background tasks
        try:
            # Virus scan
            scan_result = VirusScanService.scan_file(document.file.path)
            document.virus_scan_status = scan_result['scan_result']
            document.virus_scan_date = timezone.now()

            if not scan_result['is_clean']:
                document.status = 'rejected'
                # Delete file if infected
                document.file.delete()

            document.save()

            # OCR processing (if file is clean)
            if scan_result['is_clean']:
                DocumentProcessingService.process_document(document)

        except Exception as e:
            logger.error(f"Error in background processing: {str(e)}")

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Secure document download"""
        document = self.get_object()

        # Check permissions
        if not document.can_be_viewed_by(request.user):
            raise PermissionDenied("You don't have permission to download this document")

        # Update access tracking
        document.download_count += 1
        document.last_accessed_at = timezone.now()
        document.save(update_fields=['download_count', 'last_accessed_at'])

        # Generate secure download URL
        download_url = document.get_download_url()

        if download_url:
            # For S3, redirect to signed URL
            from django.shortcuts import redirect
            return redirect(download_url)
        else:
            return Response({'error': 'File not found'}, status=404)

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Get document preview URL"""
        document = self.get_object()

        if not document.can_be_viewed_by(request.user):
            raise PermissionDenied()

        # Generate preview URL (smaller file for web viewing)
        preview_url = document.get_download_url(expires_in=1800)  # 30 minutes

        return Response({
            'preview_url': preview_url,
            'content_type': document.content_type,
            'file_size': document.file_size,
            'can_preview': document.content_type in ['application/pdf', 'image/jpeg', 'image/png']
        })

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Share document with another user"""
        document = self.get_object()

        if document.owner != request.user:
            raise PermissionDenied()

        from ..models import DocumentShare
        from django.contrib.auth import get_user_model

        User = get_user_model()

        try:
            shared_with_email = request.data.get('email')
            shared_with_user = User.objects.get(email=shared_with_email)

            permissions = request.data.get('permissions', {'view': True, 'download': False})
            expires_days = request.data.get('expires_days', 30)

            expires_at = timezone.now() + timedelta(days=expires_days) if expires_days else None

            share, created = DocumentShare.objects.get_or_create(
                document=document,
                shared_with=shared_with_user,
                defaults={
                    'shared_by': request.user,
                    'permissions': permissions,
                    'expires_at': expires_at
                }
            )

            if not created:
                # Update existing share
                share.permissions = permissions
                share.expires_at = expires_at
                share.is_active = True
                share.save()

            return Response({'message': 'Document shared successfully'})

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=400)

    @action(detail=False, methods=['get'])
    def shared_with_me(self, request):
        """Get documents shared with current user"""
        from ..models import DocumentShare

        shared_documents = Document.objects.filter(
            documentshare__shared_with=request.user,
            documentshare__is_active=True,
            documentshare__expires_at__gt=timezone.now()
        ).select_related('owner', 'category')

        serializer = self.get_serializer(shared_documents, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search documents by content"""
        query = request.GET.get('q', '').strip()
        if not query or len(query) < 3:
            return Response({'error': 'Query must be at least 3 characters'}, status=400)

        documents = self.get_queryset().filter(
            models.Q(title__icontains=query) |
            models.Q(description__icontains=query) |
            models.Q(extracted_text__icontains=query)
        )

        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

class DocumentCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DocumentCategory.objects.filter(is_active=True)
    serializer_class = DocumentCategorySerializer
    permission_classes = [IsAuthenticated]
```

### 6.2 Document Management UI

#### 6.2.1 File Upload Components

**Duration**: 1.5 days

**Priority**: High

**Tasks:**

- [ ] Build drag-and-drop file upload interface
- [ ] Create file preview modal with PDF viewer
- [ ] Implement upload progress tracking and error handling
- [ ] Add file organization and categorization UI
- [ ] Build document sharing and permission management interface

**File Upload Component (`frontend/src/components/documents/FileUpload.tsx`):**

```typescript
import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { documentAPI } from '../../services/documentAPI'

interface FileUploadProps {
  categoryId: string
  onUploadComplete: (document: any) => void
  maxSize?: number
  allowedTypes?: string[]
}

export const FileUpload: React.FC<FileUploadProps> = ({
  categoryId,
  onUploadComplete,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`)
      return
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (fileExtension && !allowedTypes.includes(fileExtension)) {
      setError(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', categoryId)
      formData.append('title', file.name)

      const response = await documentAPI.uploadDocument(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100
          setUploadProgress(Math.round(progress))
        }
      })

      onUploadComplete(response.data)

    } catch (error: any) {
      setError(error.response?.data?.message || 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [categoryId, maxSize, allowedTypes, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="space-y-4">
            <div className="text-blue-600">
              <svg className="w-12 h-12 mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-600">Uploading... {uploadProgress}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-400">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
              </svg>
            </div>

            {isDragActive ? (
              <p className="text-blue-600">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-gray-600">
                  Drag and drop a file here, or <span className="text-blue-600 font-medium">click to browse</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: {allowedTypes.join(', ').toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

## Risk Mitigation Strategies

### Security Risks

1. **File Upload Vulnerabilities**
   - **Risk**: Malicious files could compromise system security
   - **Mitigation**: Comprehensive validation, virus scanning, sandboxed storage
   - **Testing**: Security penetration testing on upload endpoints

2. **Data Privacy Concerns**
   - **Risk**: Unauthorized access to sensitive documents
   - **Mitigation**: Strict access controls, encryption, audit logging
   - **Compliance**: GDPR compliance for personal document handling

### Technical Risks

1. **S3 Integration Complexity**
   - **Risk**: AWS configuration errors could cause upload failures
   - **Mitigation**: Comprehensive testing, error handling, fallback storage
   - **Monitoring**: S3 access logging and monitoring

2. **File Processing Performance**
   - **Risk**: Large files could slow down system
   - **Mitigation**: Background processing, file size limits, compression
   - **Scaling**: Asynchronous processing with Celery

## Testing Strategy

### Security Testing

- [ ] Test file upload validation with various malicious files
- [ ] Test access control enforcement
- [ ] Test virus scanning functionality
- [ ] Validate encryption and data protection

### Functional Testing

- [ ] Test complete upload and download workflow
- [ ] Test file sharing and permission management
- [ ] Test document categorization and search
- [ ] Test preview functionality for different file types

### Performance Testing

- [ ] Test upload performance with large files
- [ ] Test concurrent upload scenarios
- [ ] Test S3 integration under load
- [ ] Test file processing performance

## Documentation Requirements

### API Documentation

- [ ] Document upload endpoints with examples
- [ ] File validation rules documentation
- [ ] Security and permission documentation
- [ ] S3 integration configuration guide

### User Documentation

- [ ] File upload user guide
- [ ] Document sharing instructions
- [ ] Privacy and security information
- [ ] Troubleshooting guide

## Deliverables Checklist

### Backend Deliverables

- [ ] Complete document management system
- [ ] AWS S3 integration
- [ ] File validation and security
- [ ] Document processing and OCR
- [ ] Sharing and permission system

### Frontend Deliverables

- [ ] File upload interface
- [ ] Document preview system
- [ ] File management dashboard
- [ ] Sharing and permission controls
- [ ] Search and organization features

### Security Deliverables

- [ ] File validation system
- [ ] Virus scanning integration
- [ ] Access control enforcement
- [ ] Security audit documentation

## Next Phase Preparation

### Phase 7 Prerequisites

- [ ] Admin interface requirements for document review
- [ ] Content moderation workflow defined
- [ ] Django admin customization needs documented
- [ ] User management interface requirements specified

This comprehensive plan ensures Phase 6 delivers a secure, scalable document management system that handles all file-related needs while maintaining security and compliance standards.
