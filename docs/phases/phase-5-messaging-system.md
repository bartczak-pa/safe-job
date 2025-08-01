# Phase 5: Real-time Messaging System - Detailed Implementation Plan

**Duration**: Week 5 (7 days)

**Dependencies**: Phase 4 completion

**Risk Level**: High (Django Channels complexity, WebSocket management)

**Team**: 1 full-stack developer + Claude Code

## Overview

Phase 5 implements the secure real-time messaging system that enables communication between candidates and employers. This includes Django Channels integration, WebSocket management, message encryption, conversation tracking, and comprehensive moderation features. This phase is high-risk due to the complexity of real-time systems but is critical for user engagement and platform safety.

## Success Criteria

- [ ] Django Channels WebSocket infrastructure operational
- [ ] Secure real-time messaging between candidates and employers
- [ ] Message encryption and data protection implemented
- [ ] Conversation management and message history functional
- [ ] Message moderation and safety features active
- [ ] Real-time notifications and presence indicators working

## Detailed Task Breakdown

### 5.1 Django Channels Setup

#### 5.1.1 Real-time Infrastructure Setup

**Duration**: 2 days

**Priority**: Critical

**Risk Level**: High

**Tasks:**

- [ ] Configure Django Channels with Redis channel layer
- [ ] Set up WebSocket routing and authentication
- [ ] Create message queue system for reliable delivery
- [ ] Implement connection management and user presence tracking
- [ ] Build WebSocket authentication and authorization system

**Acceptance Criteria:**

- WebSocket connections establish reliably across different browsers
- Redis channel layer handles message routing efficiently
- Authentication prevents unauthorized access to conversations
- Connection failures have proper reconnection logic
- User presence status updates in real-time

**Implementation Details:**

**Django Channels Configuration (`config/settings/base.py`):**

```python
# Add to INSTALLED_APPS
INSTALLED_APPS += [
    'channels',
    'channels_redis',
]

# Channels configuration
ASGI_APPLICATION = 'config.routing.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('redis', 6379)],
            'capacity': 1500,  # Maximum messages to queue
            'expiry': 60,  # Message expiry in seconds
        },
    },
}

# WebSocket settings
WEBSOCKET_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://yourdomain.com',
]
```

**ASGI Routing Configuration (`config/routing.py`):**

```python
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from messaging.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
```

**WebSocket Consumer (`messaging/consumers.py`):**

```python
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone
from .models import Conversation, Message
from .services import MessageEncryptionService, ModerationService

class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.conversation_id = None
        self.conversation_group_name = None
        self.user = None

    async def connect(self):
        """Handle WebSocket connection"""
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.conversation_group_name = f'chat_{self.conversation_id}'
        self.user = self.scope['user']

        # Check authentication
        if isinstance(self.user, AnonymousUser):
            await self.close(code=4401)  # Unauthorized
            return

        # Verify user has access to this conversation
        has_access = await self.check_conversation_access()
        if not has_access:
            await self.close(code=4403)  # Forbidden
            return

        # Join conversation group
        await self.channel_layer.group_add(
            self.conversation_group_name,
            self.channel_name
        )

        await self.accept()

        # Update user presence
        await self.update_user_presence(online=True)

        # Send conversation history
        await self.send_message_history()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if self.conversation_group_name:
            await self.channel_layer.group_discard(
                self.conversation_group_name,
                self.channel_name
            )

        # Update user presence
        if self.user and not isinstance(self.user, AnonymousUser):
            await self.update_user_presence(online=False)

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing_indicator':
                await self.handle_typing_indicator(data)
            elif message_type == 'mark_read':
                await self.handle_mark_read(data)
            else:
                await self.send_error('Unknown message type')

        except json.JSONDecodeError:
            await self.send_error('Invalid JSON')
        except Exception as e:
            await self.send_error(f'Error processing message: {str(e)}')

    async def handle_chat_message(self, data):
        """Handle incoming chat message"""
        content = data.get('content', '').strip()

        if not content:
            await self.send_error('Message content cannot be empty')
            return

        if len(content) > 2000:  # Message length limit
            await self.send_error('Message too long')
            return

        # Content moderation
        moderation_result = await self.moderate_message(content)
        if not moderation_result['allowed']:
            await self.send_error(f'Message blocked: {moderation_result["reason"]}')
            return

        # Encrypt message before persisting
        encrypted_content = await self.encrypt_message_content(content)

        # Save encrypted content to database
        message = await self.save_message(
            encrypted_content,
            moderation_result.get('filtered_content')
        )

        # Broadcast message to conversation group
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'chat_message_broadcast',
                'message': {
                    'id': str(message.id),
                    'content': content,
                    'sender_id': str(self.user.id),
                    'sender_name': self.user.get_full_name(),
                    'timestamp': message.created_at.isoformat(),
                    'message_type': 'text'
                }
            }
        )

    async def handle_typing_indicator(self, data):
        """Handle typing indicator"""
        is_typing = data.get('is_typing', False)

        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'typing_indicator_broadcast',
                'user_id': str(self.user.id),
                'user_name': self.user.get_full_name(),
                'is_typing': is_typing
            }
        )

    async def handle_mark_read(self, data):
        """Handle marking messages as read"""
        message_id = data.get('message_id')

        if not message_id:
            await self.send_error('Message ID required')
            return

        try:
            # Mark message as read
            await self.mark_message_read(message_id)

            # Broadcast read receipt to other participants
            await self.channel_layer.group_send(
                self.conversation_group_name,
                {
                    'type': 'read_receipt_broadcast',
                    'message_id': message_id,
                    'read_by_user_id': str(self.user.id),
                    'read_by_name': self.user.get_full_name(),
                    'read_at': timezone.now().isoformat()
                }
            )

        except Exception as e:
            await self.send_error(f'Error marking message as read: {str(e)}')

    async def read_receipt_broadcast(self, event):
        """Send read receipt to WebSocket"""
        # Don't send read receipt to the user who marked it as read
        if event['read_by_user_id'] != str(self.user.id):
            await self.send(text_data=json.dumps({
                'type': 'read_receipt',
                'data': {
                    'message_id': event['message_id'],
                    'read_by_user_id': event['read_by_user_id'],
                    'read_by_name': event['read_by_name'],
                    'read_at': event['read_at']
                }
            }))

    @database_sync_to_async
    def mark_message_read(self, message_id):
        """Mark a specific message as read by current user"""
        from .models import Message, MessageReadReceipt

        try:
            message = Message.objects.get(
                id=message_id,
                conversation_id=self.conversation_id
            )

            # Create or update read receipt
            MessageReadReceipt.objects.get_or_create(
                message=message,
                user=self.user,
                defaults={'read_at': timezone.now()}
            )

        except Message.DoesNotExist:
            raise Exception('Message not found')

    async def chat_message_broadcast(self, event):
        """Send message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'data': event['message']
        }))

    async def typing_indicator_broadcast(self, event):
        """Send typing indicator to WebSocket"""
        # Don't send typing indicator to the user who's typing
        if event['user_id'] != str(self.user.id):
            await self.send(text_data=json.dumps({
                'type': 'typing_indicator',
                'data': {
                    'user_id': event['user_id'],
                    'user_name': event['user_name'],
                    'is_typing': event['is_typing']
                }
            }))

    async def send_error(self, message):
        """Send error message to client"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))

    @database_sync_to_async
    def check_conversation_access(self):
        """Check if user has access to conversation"""
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            return (
                conversation.candidate.user == self.user or
                conversation.employer.user == self.user
            )
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content, filtered_content=None):
        """Save message to database"""
        conversation = Conversation.objects.get(id=self.conversation_id)

        message = Message.objects.create(
            conversation=conversation,
            sender=self.user,
            content=filtered_content or content,
            original_content=content if filtered_content else None,
            message_type='text'
        )

        # Update conversation last activity
        conversation.last_activity_at = timezone.now()
        conversation.save()

        return message

    @database_sync_to_async
    def moderate_message(self, content):
        """Check message against moderation rules"""
        return ModerationService.moderate_message_content(content)

    async def encrypt_message_content(self, content):
        """Encrypt message content"""
        return MessageEncryptionService.encrypt_message(content)
```

**Message Models (`messaging/models.py`):**

```python
from django.contrib.gis.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()

class Conversation(models.Model):
    CONVERSATION_STATUS_CHOICES = [
        ('active', 'Active'),
        ('archived', 'Archived'),
        ('blocked', 'Blocked'),
        ('reported', 'Reported')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Participants
    candidate = models.ForeignKey(
        'candidates.CandidateProfile',
        on_delete=models.CASCADE,
        related_name='conversations'
    )
    employer = models.ForeignKey(
        'employers.EmployerProfile',
        on_delete=models.CASCADE,
        related_name='conversations'
    )

    # Related job application (if any)
    job_application = models.ForeignKey(
        'applications.JobApplication',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='conversations'
    )

    # Conversation metadata
    status = models.CharField(max_length=20, choices=CONVERSATION_STATUS_CHOICES, default='active')
    subject = models.CharField(max_length=200, blank=True)

    # Activity tracking
    last_activity_at = models.DateTimeField(auto_now=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    message_count = models.PositiveIntegerField(default=0)

    # Read status tracking
    candidate_last_read_at = models.DateTimeField(null=True, blank=True)
    employer_last_read_at = models.DateTimeField(null=True, blank=True)

    # Moderation
    is_flagged = models.BooleanField(default=False)
    flagged_reason = models.TextField(blank=True)
    flagged_at = models.DateTimeField(null=True, blank=True)
    flagged_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'messaging_conversation'
        unique_together = ['candidate', 'employer', 'job_application']
        indexes = [
            models.Index(fields=['candidate', 'status']),
            models.Index(fields=['employer', 'status']),
            models.Index(fields=['last_activity_at']),
        ]
        ordering = ['-last_activity_at']

    def __str__(self):
        return f"Conversation: {self.candidate.user.get_full_name()} ↔ {self.employer.company_name}"

    def get_unread_count_for_user(self, user):
        """Get unread message count for specific user"""
        if hasattr(user, 'candidate_profile') and user.candidate_profile == self.candidate:
            last_read = self.candidate_last_read_at
        elif hasattr(user, 'employer_profile') and user.employer_profile == self.employer:
            last_read = self.employer_last_read_at
        else:
            return 0

        if not last_read:
            return self.message_count

        return self.messages.filter(created_at__gt=last_read).count()

    def mark_read_for_user(self, user):
        """Mark conversation as read for specific user"""
        now = timezone.now()

        if hasattr(user, 'candidate_profile') and user.candidate_profile == self.candidate:
            self.candidate_last_read_at = now
        elif hasattr(user, 'employer_profile') and user.employer_profile == self.employer:
            self.employer_last_read_at = now

        self.save(update_fields=['candidate_last_read_at', 'employer_last_read_at'])

class Message(models.Model):
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text Message'),
        ('file', 'File Attachment'),
        ('system', 'System Message'),
        ('interview_invite', 'Interview Invitation'),
        ('status_update', 'Status Update')
    ]

    MESSAGE_STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')

    # Message content
    content = models.TextField(max_length=2000)
    original_content = models.TextField(blank=True, help_text="Original content before moderation")
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='text')

    # File attachment (if applicable)
    attachment = models.FileField(upload_to='message_attachments/%Y/%m/', null=True, blank=True)
    attachment_name = models.CharField(max_length=255, blank=True)
    attachment_size = models.PositiveIntegerField(null=True, blank=True)

    # Message status
    status = models.CharField(max_length=20, choices=MESSAGE_STATUS_CHOICES, default='sent')

    # Encryption
    is_encrypted = models.BooleanField(default=False)
    encryption_key_id = models.CharField(max_length=100, blank=True)

    # Moderation
    is_flagged = models.BooleanField(default=False)
    moderation_score = models.FloatField(null=True, blank=True)
    was_filtered = models.BooleanField(default=False)

    # Read receipts
    read_at = models.DateTimeField(null=True, blank=True)
    read_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='read_messages'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Soft delete
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'messaging_message'
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
            models.Index(fields=['status']),
        ]
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender.get_full_name()} at {self.created_at}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            # Update conversation message count and last message time
            self.conversation.message_count += 1
            self.conversation.last_message_at = self.created_at
            self.conversation.save(update_fields=['message_count', 'last_message_at'])

class UserPresence(models.Model):
    """Track user online presence"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='presence')
    is_online = models.BooleanField(default=False)
    last_seen_at = models.DateTimeField(auto_now=True)
    active_conversations = models.JSONField(default=list, help_text="List of conversation IDs user is actively viewing")

    class Meta:
        db_table = 'messaging_user_presence'
```

#### 5.1.2 Messaging Models and API

**Duration**: 1.5 days

**Priority**: Critical

**Tasks:**

- [ ] Create comprehensive Message and Conversation models
- [ ] Implement message encryption for sensitive communications
- [ ] Build message history and search functionality
- [ ] Add message status tracking (sent, delivered, read)
- [ ] Create message moderation and safety features

**Acceptance Criteria:**

- Message models support various content types and metadata
- Encryption protects sensitive conversation data
- Message history loads efficiently with pagination
- Status tracking provides reliable delivery confirmation
- Moderation prevents harmful content automatically

**Message Services (`messaging/services.py`):**

```python
from cryptography.fernet import Fernet
from django.conf import settings
import re
import base64
from typing import Dict, List

class MessageEncryptionService:
    """Handle message encryption/decryption"""

    @classmethod
    def encrypt_message(cls, content: str) -> str:
        """Encrypt message content"""
        if not settings.MESSAGE_ENCRYPTION_KEY:
            # Development mode - no encryption
            return content

        key = settings.MESSAGE_ENCRYPTION_KEY.encode()
        f = Fernet(key)
        encrypted_content = f.encrypt(content.encode())
        return base64.urlsafe_b64encode(encrypted_content).decode()

    @classmethod
    def decrypt_message(cls, encrypted_content: str) -> str:
        """Decrypt message content"""
        if not settings.MESSAGE_ENCRYPTION_KEY:
            # Development mode - no encryption
            return encrypted_content

        try:
            key = settings.MESSAGE_ENCRYPTION_KEY.encode()
            f = Fernet(key)
            decoded_content = base64.urlsafe_b64decode(encrypted_content.encode())
            decrypted_content = f.decrypt(decoded_content)
            return decrypted_content.decode()
        except Exception:
            return "[Decryption failed]"

class ModerationService:
    """Content moderation for messages"""

    # Basic profanity filter - in production, use more sophisticated service
    BLOCKED_WORDS = [
        # Add inappropriate words here
        'spam', 'scam', 'fraud'
    ]

    SUSPICIOUS_PATTERNS = [
        r'\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b',  # Credit card numbers
        r'\b\d{3}-\d{2}-\d{4}\b',  # SSN patterns
        r'whatsapp.*\+?\d+',  # WhatsApp sharing
        r'telegram.*@\w+',  # Telegram sharing
    ]

    @classmethod
    def moderate_message_content(cls, content: str) -> Dict:
        """Check message content for policy violations"""
        content_lower = content.lower()

        # Check for blocked words
        for word in cls.BLOCKED_WORDS:
            if word in content_lower:
                return {
                    'allowed': False,
                    'reason': 'Contains inappropriate content',
                    'violation_type': 'profanity'
                }

        # Check for suspicious patterns
        for pattern in cls.SUSPICIOUS_PATTERNS:
            if re.search(pattern, content, re.IGNORECASE):
                return {
                    'allowed': False,
                    'reason': 'Contains potentially sensitive information',
                    'violation_type': 'personal_info'
                }

        # Check for excessive caps (potential spam)
        if len(content) > 20 and sum(1 for c in content if c.isupper()) / len(content) > 0.7:
            filtered_content = content.lower().capitalize()
            return {
                'allowed': True,
                'filtered_content': filtered_content,
                'reason': 'Excessive capitals filtered'
            }

        return {
            'allowed': True,
            'reason': None
        }

    @classmethod
    def flag_conversation(cls, conversation, reason: str, flagged_by):
        """Flag conversation for admin review"""
        conversation.is_flagged = True
        conversation.flagged_reason = reason
        conversation.flagged_at = timezone.now()
        conversation.flagged_by = flagged_by
        conversation.save()

        # Notify admin team
        NotificationService.notify_admin_conversation_flagged(conversation, reason)

class ConversationService:
    """Business logic for conversation management"""

    @classmethod
    def create_conversation(cls, candidate, employer, job_application=None, subject=''):
        """Create new conversation between candidate and employer"""

        # Check if conversation already exists
        existing = Conversation.objects.filter(
            candidate=candidate,
            employer=employer,
            job_application=job_application
        ).first()

        if existing:
            return existing

        # Create new conversation
        conversation = Conversation.objects.create(
            candidate=candidate,
            employer=employer,
            job_application=job_application,
            subject=subject or f"Regarding: {job_application.job.title if job_application else 'General Inquiry'}"
        )

        # Send system message
        if job_application:
            system_message = f"Conversation started regarding application for {job_application.job.title}"
        else:
            system_message = "Conversation started"

        Message.objects.create(
            conversation=conversation,
            sender=candidate.user,  # Use candidate as initial sender
            content=system_message,
            message_type='system'
        )

        return conversation

    @classmethod
    def get_conversations_for_user(cls, user, status='active'):
        """Get conversations for specific user"""
        conversations = Conversation.objects.filter(status=status)

        if hasattr(user, 'candidate_profile'):
            conversations = conversations.filter(candidate=user.candidate_profile)
        elif hasattr(user, 'employer_profile'):
            conversations = conversations.filter(employer=user.employer_profile)
        else:
            return Conversation.objects.none()

        return conversations.select_related(
            'candidate__user',
            'employer__user',
            'job_application__job'
        ).prefetch_related('messages')
```

### 5.2 Real-time Frontend Integration

#### 5.2.1 WebSocket Client Implementation

**Duration**: 1.5 days

**Priority**: Critical

**Tasks:**

- [ ] Build WebSocket connection management with reconnection logic
- [ ] Create real-time message sending and receiving
- [ ] Implement typing indicators and user presence
- [ ] Add message notification system with browser notifications
- [ ] Build chat interface with message history

**Acceptance Criteria:**

- WebSocket connections are stable with automatic reconnection
- Messages send and receive in real-time without delays
- Typing indicators provide smooth user experience
- Browser notifications work across different browsers
- Chat interface is intuitive and responsive

**WebSocket Client (`frontend/src/services/websocketService.ts`):**

```typescript
interface WebSocketMessage {
  type: "message" | "typing_indicator" | "presence_update" | "error";
  data: any;
}

interface MessageData {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  timestamp: string;
  message_type: "text" | "file" | "system";
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private conversationId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: any[] = [];
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  connect(conversationId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.conversationId = conversationId;
      const wsUrl = `${process.env.REACT_APP_WS_URL}/ws/chat/${conversationId}/?token=${token}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        this.handleDisconnection();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, "User initiated disconnect");
      this.ws = null;
    }
  }

  sendMessage(content: string): void {
    const message = {
      type: "chat_message",
      content: content.trim(),
    };

    this.sendWebSocketMessage(message);
  }

  sendTypingIndicator(isTyping: boolean): void {
    const message = {
      type: "typing_indicator",
      is_typing: isTyping,
    };

    this.sendWebSocketMessage(message);
  }

  markAsRead(): void {
    const message = {
      type: "mark_read",
    };

    this.sendWebSocketMessage(message);
  }

  private sendWebSocketMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case "message":
        this.emit("newMessage", message.data);
        this.showNotification(message.data);
        break;
      case "typing_indicator":
        this.emit("typingIndicator", message.data);
        break;
      case "presence_update":
        this.emit("presenceUpdate", message.data);
        break;
      case "error":
        this.emit("error", message.data);
        break;
    }
  }

  private handleDisconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(
        () => {
          this.reconnectAttempts++;
          if (this.conversationId) {
            const token = localStorage.getItem("auth_token");
            if (token) {
              this.connect(this.conversationId, token);
            }
          }
        },
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      );
    } else {
      this.emit("connectionLost", {});
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendWebSocketMessage(message);
    }
  }

  private showNotification(messageData: MessageData): void {
    if ("Notification" in window && Notification.permission === "granted") {
      if (document.hidden) {
        // Only show if tab is not active
        new Notification(`New message from ${messageData.sender_name}`, {
          body: messageData.content.substring(0, 100),
          icon: "/notification-icon.png",
          tag: `message-${messageData.id}`,
        });
      }
    }
  }

  private setupEventListeners(): void {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Handle page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        // Page became visible, mark messages as read
        this.markAsRead();
      }
    });
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => callback(data));
  }
}

export const websocketService = new WebSocketService();
```

#### 5.2.2 Messaging UI Components

**Duration**: 1.5 days

**Priority**: High

**Tasks:**

- [ ] Create conversation list with unread message indicators
- [ ] Build message input with file attachment support
- [ ] Implement message bubbles with status indicators
- [ ] Add emoji reactions and message threading
- [ ] Create conversation search and filtering

**Acceptance Criteria:**

- Conversation list shows real-time updates and unread counts
- Message input supports text and file attachments
- Message bubbles display clearly with proper formatting
- User interactions feel smooth and responsive
- Search functionality helps users find conversations

**Chat Interface Components (`frontend/src/components/messaging/`):**

**ChatRoom Component:**

```typescript
import React, { useState, useEffect, useRef } from 'react'
import { websocketService } from '../../services/websocketService'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { useAuthStore } from '../../store/authStore'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  timestamp: string
  message_type: 'text' | 'file' | 'system'
}

interface ChatRoomProps {
  conversationId: string
  onClose: () => void
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ conversationId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, token } = useAuthStore()

  useEffect(() => {
    connectToWebSocket()

    return () => {
      websocketService.disconnect()
    }
  }, [conversationId])

  const connectToWebSocket = async () => {
    try {
      await websocketService.connect(conversationId, token!)
      setIsConnected(true)
      setError(null)

      // Set up event listeners
      websocketService.on('newMessage', handleNewMessage)
      websocketService.on('typingIndicator', handleTypingIndicator)
      websocketService.on('error', handleError)
      websocketService.on('connectionLost', handleConnectionLost)

    } catch (error) {
      setError('Failed to connect to chat')
      setIsConnected(false)
    }
  }

  const handleNewMessage = (messageData: Message) => {
    setMessages(prev => [...prev, messageData])
    scrollToBottom()
  }

  const handleTypingIndicator = (data: { user_id: string, user_name: string, is_typing: boolean }) => {
    setTypingUsers(prev => {
      if (data.is_typing) {
        return prev.includes(data.user_name) ? prev : [...prev, data.user_name]
      } else {
        return prev.filter(name => name !== data.user_name)
      }
    })
  }

  const handleError = (error: any) => {
    setError(error.message || 'An error occurred')
  }

  const handleConnectionLost = () => {
    setIsConnected(false)
    setError('Connection lost. Please refresh the page.')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = (content: string) => {
    websocketService.sendMessage(content)
  }

  const sendTypingIndicator = (isTyping: boolean) => {
    websocketService.sendTypingIndicator(isTyping)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={connectToWebSocket}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold">Chat</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === user?.id}
          />
        ))}

        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <MessageInput
          onSendMessage={sendMessage}
          onTypingChange={sendTypingIndicator}
          disabled={!isConnected}
        />
      </div>
    </div>
  )
}
```

## Risk Mitigation Strategies

### Technical Risks

1. **WebSocket Connection Stability**
   - **Risk**: Unreliable connections causing message loss
   - **Mitigation**: Automatic reconnection, message queuing, fallback to HTTP polling
   - **Testing**: Extensive connection failure testing

2. **Real-time Performance**
   - **Risk**: High message volume could overwhelm system
   - **Mitigation**: Message rate limiting, connection pooling, Redis optimization
   - **Monitoring**: Real-time performance metrics

3. **Message Encryption Complexity**
   - **Risk**: Encryption could impact performance or cause errors
   - **Mitigation**: Efficient encryption algorithms, error handling, optional encryption
   - **Fallback**: Store messages without encryption in development

### Security Risks

1. **WebSocket Authentication**
   - **Risk**: Unauthorized access to conversations
   - **Mitigation**: Token-based authentication, conversation access validation
   - **Testing**: Security penetration testing

2. **Message Content Security**
   - **Risk**: Malicious content or personal information sharing
   - **Mitigation**: Content moderation, pattern detection, user reporting
   - **Compliance**: GDPR data protection compliance

## Testing Strategy

### WebSocket Testing

- [ ] Test connection establishment and authentication
- [ ] Test message sending and receiving reliability
- [ ] Test reconnection logic with various failure scenarios
- [ ] Test concurrent user sessions
- [ ] Test performance under high message volume

### Message System Testing

- [ ] Test message encryption and decryption
- [ ] Test content moderation rules
- [ ] Test conversation access permissions
- [ ] Test message history and pagination
- [ ] Test file attachment handling

### Frontend Testing

- [ ] Test UI responsiveness across different screen sizes
- [ ] Test real-time updates and state synchronization
- [ ] Test error handling and user feedback
- [ ] Test browser notification functionality
- [ ] Test typing indicators and presence features

## Performance Considerations

### Backend Optimization

- Redis connection pooling and cluster configuration
- Database indexing for message queries
- Efficient WebSocket connection management
- Message queuing for high-volume scenarios

### Frontend Optimization

- Virtual scrolling for long message histories
- Message batching for better performance
- Efficient state updates and re-renders
- Memory management for WebSocket connections

## Documentation Requirements

### Technical Documentation

- [ ] WebSocket API documentation
- [ ] Message encryption implementation guide
- [ ] Real-time architecture overview
- [ ] Performance tuning guidelines

### User Documentation

- [ ] Chat interface user guide
- [ ] Notification settings documentation
- [ ] Privacy and security information
- [ ] Troubleshooting guide

## Deliverables Checklist

### Backend Deliverables

- [ ] Django Channels WebSocket infrastructure
- [ ] Message and conversation models
- [ ] Real-time message handling
- [ ] Content moderation system
- [ ] Message encryption implementation

### Frontend Deliverables

- [ ] WebSocket client service
- [ ] Chat interface components
- [ ] Real-time state management
- [ ] Notification system
- [ ] Message history and search

### Security Deliverables

- [ ] Authentication and authorization system
- [ ] Content moderation rules
- [ ] Encryption implementation
- [ ] Security audit documentation

## Next Phase Preparation

### Phase 6 Prerequisites

- [ ] Document upload requirements for messaging
- [ ] S3 integration architecture defined
- [ ] File security and validation strategies planned
- [ ] Admin moderation interface requirements documented

This comprehensive plan ensures Phase 5 delivers a secure, reliable real-time messaging system that enhances user engagement while maintaining platform safety and compliance standards.
