# Deployment Guide

This guide covers deployment strategies and procedures for the Safe Job Platform.

## Deployment Environments

### Development

- **Purpose**: Local development and testing
- **URL**: http://localhost:8000
- **Database**: Local PostgreSQL with test data
- **Monitoring**: Basic logging

### Staging

- **Purpose**: Pre-production testing and QA
- **URL**: https://staging.safejob.nl
- **Database**: Staging PostgreSQL with sanitized production data
- **Monitoring**: Application monitoring and logging

### Production

- **Purpose**: Live application serving real users
- **URL**: https://safejob.nl
- **Database**: Production PostgreSQL with backups
- **Monitoring**: Full monitoring, alerting, and logging

## AWS Infrastructure

The Safe Job Platform is deployed on AWS using the following services:

### Core Services

- **EC2**: Application servers (Auto Scaling Group)
- **RDS**: PostgreSQL database with Multi-AZ deployment
- **ElastiCache**: Redis for caching and sessions
- **ELB**: Application Load Balancer
- **CloudFront**: CDN for static assets
- **S3**: Static files and media storage
- **Route 53**: DNS management

### Security Services

- **VPC**: Isolated network environment
- **Security Groups**: Firewall rules
- **IAM**: Access management
- **ACM**: SSL/TLS certificates
- **WAF**: Web Application Firewall
- **KMS**: Encryption key management

### Monitoring Services

- **CloudWatch**: Metrics and logging
- **X-Ray**: Distributed tracing
- **SNS**: Notifications and alerts
- **CloudTrail**: API audit logging

## Infrastructure as Code

Infrastructure is managed using Terraform:

```hcl
# infrastructure/main.tf
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "safejob-terraform-state"
    key    = "production/terraform.tfstate"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "safe-job-platform"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
```

### Network Configuration

```hcl
# infrastructure/networking.tf
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "safejob-vpc-${var.environment}"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "safejob-private-subnet-${count.index + 1}"
    Type = "private"
  }
}

resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 10}.0/24"
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "safejob-public-subnet-${count.index + 1}"
    Type = "public"
  }
}
```

## Container Deployment

### Docker Images

Production images are built using multi-stage Dockerfiles:

```dockerfile
# Production Dockerfile
FROM python:3.13-slim as builder

WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --only=main --no-dev

FROM python:3.13-slim as runtime

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY apps/ ./apps/
COPY config/ ./config/
COPY manage.py ./

# Set permissions
RUN chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health/ || exit 1

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "config.wsgi:application"]
```

### ECS Task Definition

```yaml
# deploy/ecs-task-definition.json
{
  "family": "safejob-backend",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/safejob-task-role",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/safejob-execution-role",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions":
    [
      {
        "name": "backend",
        "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/safejob-backend:${IMAGE_TAG}",
        "portMappings": [{ "containerPort": 8000, "protocol": "tcp" }],
        "environment":
          [
            {
              "name": "DJANGO_SETTINGS_MODULE",
              "value": "config.settings.production",
            },
            {
              "name": "DATABASE_URL",
              "value": "postgresql://user:pass@host:5432/db",
            },
          ],
        "secrets":
          [
            {
              "name": "SECRET_KEY",
              "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:safejob/django-secret",
            },
          ],
        "logConfiguration":
          {
            "logDriver": "awslogs",
            "options":
              {
                "awslogs-group": "/ecs/safejob-backend",
                "awslogs-region": "eu-west-1",
                "awslogs-stream-prefix": "ecs",
              },
          },
        "healthCheck":
          {
            "command":
              ["CMD-SHELL", "curl -f http://localhost:8000/health/ || exit 1"],
            "interval": 30,
            "timeout": 5,
            "retries": 3,
            "startPeriod": 60,
          },
      },
    ],
}
```

## Deployment Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-1

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ secrets.ECR_REGISTRY }}
          ECR_REPOSITORY: safejob-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster safejob-production \
            --service safejob-backend \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster safejob-production \
            --services safejob-backend
```

### Blue-Green Deployment

```bash
#!/bin/bash
# scripts/blue-green-deploy.sh

set -e

CLUSTER="safejob-production"
SERVICE="safejob-backend"
NEW_IMAGE="$1"

echo "Starting blue-green deployment..."

# Get current task definition
CURRENT_TASK_DEF=$(aws ecs describe-services \
  --cluster $CLUSTER \
  --services $SERVICE \
  --query 'services[0].taskDefinition' \
  --output text)

# Create new task definition with new image
NEW_TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition $CURRENT_TASK_DEF \
  --query 'taskDefinition' \
  --output json | \
  jq --arg IMAGE "$NEW_IMAGE" \
     '.containerDefinitions[0].image = $IMAGE' | \
  jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .placementConstraints, .compatibilities, .registeredAt, .registeredBy)')

# Register new task definition
NEW_TASK_DEF_ARN=$(echo $NEW_TASK_DEF | \
  aws ecs register-task-definition \
    --cli-input-json file:///dev/stdin \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)

echo "Created new task definition: $NEW_TASK_DEF_ARN"

# Update service with new task definition
aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --task-definition $NEW_TASK_DEF_ARN

echo "Updated service with new task definition"

# Wait for deployment to complete
echo "Waiting for deployment to complete..."
aws ecs wait services-stable \
  --cluster $CLUSTER \
  --services $SERVICE

echo "Deployment completed successfully!"
```

## Database Management

### Migrations

```bash
# Run migrations in production
kubectl exec -it deployment/safejob-backend -- python manage.py migrate

# Or via ECS
aws ecs run-task \
  --cluster safejob-production \
  --task-definition safejob-migrate \
  --overrides '{
    "containerOverrides": [{
      "name": "backend",
      "command": ["python", "manage.py", "migrate"]
    }]
  }'
```

### Backups

```bash
#!/bin/bash
# scripts/backup-database.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="safejob_backup_$TIMESTAMP"

# Create RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier safejob-production \
  --db-snapshot-identifier $BACKUP_NAME

echo "Database backup created: $BACKUP_NAME"

# Export to S3 (for full backup)
aws rds start-export-task \
  --export-task-identifier $BACKUP_NAME \
  --source-arn arn:aws:rds:region:account:snapshot:$BACKUP_NAME \
  --s3-bucket-name safejob-database-exports \
  --iam-role-arn arn:aws:iam::account:role/rds-export-role \
  --kms-key-id arn:aws:kms:region:account:key/key-id
```

## Monitoring and Logging

### CloudWatch Configuration

```yaml
# cloudwatch-config.yml
logs:
  logs_collected:
    files:
      collect_list:
        - file_path: /var/log/django/django.log
          log_group_name: /aws/ec2/safejob/django
          log_stream_name: "{instance_id}"
          timestamp_format: "%Y-%m-%d %H:%M:%S"
        - file_path: /var/log/nginx/access.log
          log_group_name: /aws/ec2/safejob/nginx
          log_stream_name: "{instance_id}"

metrics:
  namespace: SafeJob/Application
  metrics_collected:
    cpu:
      measurement:
        [
          "cpu_usage_idle",
          "cpu_usage_iowait",
          "cpu_usage_system",
          "cpu_usage_user",
        ]
      metrics_collection_interval: 60
    disk:
      measurement: ["used_percent"]
      metrics_collection_interval: 60
      resources: ["*"]
    mem:
      measurement: ["mem_used_percent"]
      metrics_collection_interval: 60
```

### Health Checks

```python
# apps/core/health.py
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import redis
import logging

logger = logging.getLogger(__name__)

def health_check(request):
    """Comprehensive health check endpoint."""
    health_status = {
        'status': 'healthy',
        'service': 'safe-job-backend',
        'version': '1.0.0',
        'checks': {}
    }

    # Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status['checks']['database'] = 'healthy'
    except Exception as e:
        health_status['checks']['database'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'

    # Cache check
    try:
        cache.set('health_check', 'ok', 30)
        cache_value = cache.get('health_check')
        if cache_value == 'ok':
            health_status['checks']['cache'] = 'healthy'
        else:
            health_status['checks']['cache'] = 'unhealthy: cache test failed'
            health_status['status'] = 'unhealthy'
    except Exception as e:
        health_status['checks']['cache'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'

    status_code = 200 if health_status['status'] == 'healthy' else 503
    return JsonResponse(health_status, status=status_code)
```

## Security Configuration

### SSL/TLS Setup

```yaml
# ALB with SSL termination
Resources:
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Type: application
      Scheme: internet-facing
      SecurityGroups:
        - !Ref ALBSecurityGroup
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  HTTPSListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      LoadBalancerArn: !Ref ApplicationLoadBalancer
      Protocol: HTTPS
      Port: 443
      Certificates:
        - CertificateArn: !Ref SSLCertificate
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref TargetGroup
```

### Security Groups

```hcl
# Security group for ALB
resource "aws_security_group" "alb" {
  name_prefix = "safejob-alb-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security group for ECS tasks
resource "aws_security_group" "ecs_tasks" {
  name_prefix = "safejob-ecs-tasks-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

## Environment Management

### Secrets Management

```bash
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name "safejob/production/django" \
  --description "Django secrets for production" \
  --secret-string '{
    "SECRET_KEY": "your-secret-key",
    "DATABASE_PASSWORD": "your-db-password",
    "REDIS_PASSWORD": "your-redis-password"
  }'
```

### Environment Variables

```bash
# Production environment variables
export DJANGO_SETTINGS_MODULE=config.settings.production
export DATABASE_URL=postgresql://user:pass@host:5432/safejob
export REDIS_URL=redis://user:pass@host:6379/0
export AWS_STORAGE_BUCKET_NAME=safejob-media-production
export ALLOWED_HOSTS=safejob.nl,www.safejob.nl
export DEBUG=False
```

## Rollback Procedures

### Application Rollback

```bash
#!/bin/bash
# scripts/rollback.sh

CLUSTER="safejob-production"
SERVICE="safejob-backend"
PREVIOUS_TASK_DEF="$1"

if [ -z "$PREVIOUS_TASK_DEF" ]; then
  echo "Usage: $0 <previous-task-definition-arn>"
  exit 1
fi

echo "Rolling back to task definition: $PREVIOUS_TASK_DEF"

# Update service with previous task definition
aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --task-definition $PREVIOUS_TASK_DEF

# Wait for rollback to complete
aws ecs wait services-stable \
  --cluster $CLUSTER \
  --services $SERVICE

echo "Rollback completed successfully!"
```

### Database Rollback

```bash
# Restore from RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier safejob-rollback \
  --db-snapshot-identifier safejob_backup_20240101_120000

# Point application to rollback instance (requires DNS/ALB update)
```

## Performance Optimization

### Auto Scaling

```hcl
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/safejob-production/safejob-backend"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  name               = "cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
```

## Disaster Recovery

### Multi-Region Setup

```hcl
# Primary region (eu-west-1)
provider "aws" {
  alias  = "primary"
  region = "eu-west-1"
}

# DR region (eu-central-1)
provider "aws" {
  alias  = "dr"
  region = "eu-central-1"
}

# Cross-region RDS backup
resource "aws_db_instance" "primary" {
  provider = aws.primary
  # ... primary database configuration

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  copy_tags_to_snapshot  = true
}

resource "aws_db_instance" "dr_replica" {
  provider = aws.dr
  # ... DR replica configuration

  replicate_source_db = aws_db_instance.primary.id
}
```

This deployment guide provides comprehensive instructions for deploying and managing the Safe Job Platform in production environments, ensuring scalability, security, and reliability.
