# Phase 9: AWS Deployment & Production Setup - Detailed Implementation Plan

**Duration**: Week 9 (7 days)

**Dependencies**: All previous phases (1-8)

**Risk Level**: High

**Team**: 1 full-stack developer + Claude Code

## Overview

Phase 9 establishes a robust, scalable production infrastructure on AWS using modern containerization and Infrastructure as Code principles. This phase creates a highly available, secure, and monitoring-rich deployment that can handle production traffic while maintaining operational excellence and cost optimization.

## Success Criteria

- [ ] Production-ready AWS infrastructure with high availability
- [ ] Automated CI/CD pipeline with zero-downtime deployments
- [ ] Comprehensive monitoring, logging, and alerting system
- [ ] Security best practices with encryption and access controls
- [ ] Cost-optimized infrastructure with auto-scaling capabilities
- [ ] Disaster recovery and backup strategies implemented

## Detailed Task Breakdown

### 9.1 Infrastructure as Code Setup

#### 9.1.1 Terraform Infrastructure Definition

**Duration**: 10 hours

**Priority**: Critical

**Tasks:**

- [ ] Design production network architecture with VPC, subnets, and security groups
- [ ] Set up ECS Fargate cluster with auto-scaling configuration
- [ ] Configure Application Load Balancer with SSL termination
- [ ] Create RDS PostgreSQL with Multi-AZ deployment
- [ ] Set up ElastiCache Redis cluster for session management
- [ ] Configure S3 buckets for static assets and file storage

**Acceptance Criteria:**

- Infrastructure deployed consistently across environments
- Network security follows least-privilege principles
- Database configured with automated backups and encryption
- Load balancer distributes traffic with health checks
- All resources tagged for cost allocation and management
- Infrastructure can be deployed/destroyed reliably

**Implementation Details:**

```hcl
# infrastructure/terraform/main.tf
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "safe-job-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "safe-job-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "safe-job"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# infrastructure/terraform/network.tf
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc-${var.environment}"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw-${var.environment}"
  }
}

# Public subnets for ALB
resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-${count.index + 1}-${var.environment}"
    Type = "public"
  }
}

# Private subnets for ECS tasks and RDS
resource "aws_subnet" "private" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.project_name}-private-subnet-${count.index + 1}-${var.environment}"
    Type = "private"
  }
}

# NAT Gateways for private subnet internet access
resource "aws_eip" "nat" {
  count = length(var.availability_zones)

  domain = "vpc"

  tags = {
    Name = "${var.project_name}-nat-eip-${count.index + 1}-${var.environment}"
  }
}

resource "aws_nat_gateway" "main" {
  count = length(var.availability_zones)

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "${var.project_name}-nat-gateway-${count.index + 1}-${var.environment}"
  }

  depends_on = [aws_internet_gateway.main]
}

# Route tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt-${var.environment}"
  }
}

resource "aws_route_table" "private" {
  count = length(var.availability_zones)

  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name = "${var.project_name}-private-rt-${count.index + 1}-${var.environment}"
  }
}

# Route table associations
resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# infrastructure/terraform/ecs.tf
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster-${var.environment}"

  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"
      log_configuration {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.ecs.name
      }
    }
  }

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.project_name}-cluster-${var.environment}"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# ECS Task Definition for Backend
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "backend"
      image = "${aws_ecr_repository.backend.repository_url}:latest"

      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "ENVIRONMENT"
          value = var.environment
        },
        {
          name  = "DEBUG"
          value = "False"
        },
        # DATABASE_URL moved to secrets section for security
        {
          name  = "REDIS_URL"
          value = "redis://${aws_elasticache_replication_group.main.primary_endpoint}:6379"
        },
        {
          name  = "AWS_STORAGE_BUCKET_NAME"
          value = aws_s3_bucket.media.bucket
        },
        {
          name  = "AWS_DEFAULT_REGION"
          value = var.aws_region
        }
      ]

      secrets = [
        {
          name      = "SECRET_KEY"
          valueFrom = aws_ssm_parameter.secret_key.arn
        },
        {
          name      = "DATABASE_PASSWORD"
          valueFrom = aws_ssm_parameter.db_password.arn
        },
        {
          name      = "DATABASE_URL"
          valueFrom = aws_ssm_parameter.database_url.arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command = [
          "CMD-SHELL",
          "curl -f http://localhost:8000/health/ || exit 1"
        ]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "${var.project_name}-backend-task-${var.environment}"
  }
}

# ECS Service for Backend
resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-backend-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8000
  }

  service_registries {
    registry_arn = aws_service_discovery_service.backend.arn
  }

  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100

    deployment_circuit_breaker {
      enable   = true
      rollback = true
    }
  }

  # Auto-scaling configuration
  lifecycle {
    ignore_changes = [desired_count]
  }

  depends_on = [
    aws_lb_listener.backend,
    aws_iam_role_policy_attachment.ecs_task_execution_role
  ]

  tags = {
    Name = "${var.project_name}-backend-service-${var.environment}"
  }
}

# Auto Scaling
resource "aws_appautoscaling_target" "backend" {
  max_capacity       = var.backend_max_capacity
  min_capacity       = var.backend_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "backend_up" {
  name               = "${var.project_name}-backend-scale-up-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# infrastructure/terraform/rds.tf
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-db-subnet-group-${var.environment}"
  }
}

resource "aws_db_parameter_group" "main" {
  family = "postgres15"
  name   = "${var.project_name}-db-params-${var.environment}"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  tags = {
    Name = "${var.project_name}-db-params-${var.environment}"
  }
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db-${var.environment}"

  # Engine
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class

  # Storage
  allocated_storage       = var.db_allocated_storage
  max_allocated_storage   = var.db_max_allocated_storage
  storage_type           = "gp3"
  storage_encrypted      = true
  kms_key_id            = aws_kms_key.rds.arn

  # Database
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # High Availability
  multi_az               = var.environment == "production" ? true : false
  availability_zone      = var.environment == "production" ? null : var.availability_zones[0]

  # Backup
  backup_retention_period = var.environment == "production" ? 30 : 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Sun:04:00-Sun:05:00"

  # Monitoring
  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_monitoring.arn

  # Parameters
  parameter_group_name = aws_db_parameter_group.main.name

  # Deletion protection
  deletion_protection = var.environment == "production" ? true : false
  skip_final_snapshot = var.environment == "production" ? false : true
  final_snapshot_identifier = var.environment == "production" ? "${var.project_name}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  tags = {
    Name = "${var.project_name}-db-${var.environment}"
  }
}

# Read replica for production
resource "aws_db_instance" "read_replica" {
  count = var.environment == "production" ? 1 : 0

  identifier             = "${var.project_name}-db-read-replica-${var.environment}"
  replicate_source_db    = aws_db_instance.main.identifier
  instance_class         = var.db_replica_instance_class
  publicly_accessible    = false
  auto_minor_version_upgrade = false

  # Performance Insights
  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_monitoring.arn

  tags = {
    Name = "${var.project_name}-db-read-replica-${var.environment}"
    Role = "read-replica"
  }
}
```

#### 9.1.2 Security and Access Control

**Duration**: 6 hours

**Priority**: Critical

**Tasks:**

- [ ] Configure IAM roles and policies with least privilege
- [ ] Set up AWS Systems Manager Parameter Store for secrets
- [ ] Implement VPC security groups with minimal access
- [ ] Configure AWS KMS for encryption at rest
- [ ] Set up AWS WAF for application firewall protection

**Acceptance Criteria:**

- All services follow least-privilege access principles
- Secrets stored securely and rotated automatically
- Network traffic restricted to necessary ports and sources
- Data encrypted at rest and in transit
- Web application firewall blocks common attacks

**Implementation Details:**

```hcl
# infrastructure/terraform/security.tf
# KMS Key for encryption
resource "aws_kms_key" "main" {
  description             = "${var.project_name} ${var.environment} encryption key"
  deletion_window_in_days = var.environment == "production" ? 30 : 7

  tags = {
    Name = "${var.project_name}-kms-key-${var.environment}"
  }
}

resource "aws_kms_alias" "main" {
  name          = "alias/${var.project_name}-${var.environment}"
  target_key_id = aws_kms_key.main.key_id
}

# Separate KMS key for RDS
resource "aws_kms_key" "rds" {
  description             = "${var.project_name} ${var.environment} RDS encryption key"
  deletion_window_in_days = var.environment == "production" ? 30 : 7

  tags = {
    Name = "${var.project_name}-rds-kms-key-${var.environment}"
  }
}

# Security Groups
resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-alb-${var.environment}"
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

  tags = {
    Name = "${var.project_name}-alb-sg-${var.environment}"
  }
}

resource "aws_security_group" "ecs_tasks" {
  name_prefix = "${var.project_name}-ecs-tasks-${var.environment}"
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

  tags = {
    Name = "${var.project_name}-ecs-tasks-sg-${var.environment}"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-${var.environment}"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  tags = {
    Name = "${var.project_name}-rds-sg-${var.environment}"
  }
}

resource "aws_security_group" "redis" {
  name_prefix = "${var.project_name}-redis-${var.environment}"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  tags = {
    Name = "${var.project_name}-redis-sg-${var.environment}"
  }
}

# IAM Roles
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.project_name}-ecs-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ecs-execution-role-${var.environment}"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_execution_role_policy" {
  name = "${var.project_name}-ecs-execution-role-policy-${var.environment}"
  role = aws_iam_role.ecs_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter",
          "ssm:GetParametersByPath"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/${var.project_name}/${var.environment}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = [
          aws_kms_key.main.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role" "ecs_task_role" {
  name = "${var.project_name}-ecs-task-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ecs-task-role-${var.environment}"
  }
}

resource "aws_iam_role_policy" "ecs_task_role_policy" {
  name = "${var.project_name}-ecs-task-role-policy-${var.environment}"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.media.arn,
          "${aws_s3_bucket.media.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# Systems Manager Parameters for secrets
resource "aws_ssm_parameter" "secret_key" {
  name  = "/${var.project_name}/${var.environment}/SECRET_KEY"
  type  = "SecureString"
  value = var.django_secret_key
  key_id = aws_kms_key.main.key_id

  tags = {
    Name = "${var.project_name}-secret-key-${var.environment}"
  }
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.project_name}/${var.environment}/DATABASE_PASSWORD"
  type  = "SecureString"
  value = var.db_password
  key_id = aws_kms_key.main.key_id

  tags = {
    Name = "${var.project_name}-db-password-${var.environment}"
  }
}

resource "aws_ssm_parameter" "database_url" {
  name   = "/${var.project_name}/${var.environment}/DATABASE_URL"
  type   = "SecureString"
  value  = "postgresql://${aws_db_instance.main.username}:${var.db_password}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
  key_id = aws_kms_key.main.key_id

  tags = {
    Name = "${var.project_name}-database-url-${var.environment}"
  }
}

# WAF
resource "aws_wafv2_web_acl" "main" {
  name  = "${var.project_name}-waf-${var.environment}"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  # Rate limiting rule
  rule {
    name     = "RateLimitRule"
    priority = 1

    override_action {
      none {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule"
      sampled_requests_enabled   = true
    }

    action {
      block {}
    }
  }

  # AWS Managed Rules
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  tags = {
    Name = "${var.project_name}-waf-${var.environment}"
  }
}

# Associate WAF with ALB
resource "aws_wafv2_web_acl_association" "main" {
  resource_arn = aws_lb.main.arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}
```

### 9.2 CI/CD Pipeline Implementation

#### 9.2.1 GitHub Actions Deployment Pipeline

**Duration**: 8 hours

**Priority**: Critical

**Tasks:**

- [ ] Set up automated testing pipeline with parallel jobs
- [ ] Configure Docker image building and ECR push
- [ ] Implement blue-green deployment strategy
- [ ] Add database migration automation
- [ ] Set up environment promotion workflow

**Acceptance Criteria:**

- Tests run automatically on every pull request
- Failed tests block deployment to production
- Docker images built and pushed to ECR automatically
- Zero-downtime deployments using blue-green strategy
- Database migrations run safely before deployment

**Implementation Details:**

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  AWS_REGION: eu-west-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.eu-west-1.amazonaws.com
  ECR_REPOSITORY_BACKEND: safe-job-backend
  ECR_REPOSITORY_FRONTEND: safe-job-frontend

jobs:
  # Test jobs
  test-backend:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgis/postgis:15-3.3
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: safe_job_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"
          cache: "pip"

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements/test.txt

      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/safe_job_test
          REDIS_URL: redis://localhost:6379/0
          SECRET_KEY: test-secret-key-for-ci
          DEBUG: True
        run: |
          cd backend
          python manage.py migrate
          python manage.py collectstatic --noinput
          pytest --cov=src --cov-report=xml --cov-report=term-missing

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: backend/coverage.xml
          flags: backend

  test-frontend:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Run linting
        run: |
          cd frontend
          npm run lint

      - name: Run tests
        run: |
          cd frontend
          npm run test:ci

      - name: Build production bundle
        run: |
          cd frontend
          npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: frontend-build
          path: frontend/dist/

  # Security scanning
  security-scan:
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: "fs"
          scan-ref: "."
          format: "sarif"
          output: "trivy-results.sarif"

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: "trivy-results.sarif"

  # Build and push Docker images
  build-and-push:
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend, security-scan]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/dev'

    outputs:
      backend-image: ${{ steps.backend-image.outputs.image }}
      frontend-image: ${{ steps.frontend-image.outputs.image }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push backend image
        id: backend-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Download frontend build
        uses: actions/download-artifact@v3
        with:
          name: frontend-build
          path: frontend/dist/

      - name: Build and push frontend image
        id: frontend-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd frontend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG" >> $GITHUB_OUTPUT

  # Deploy to staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build-and-push]
    if: github.ref == 'refs/heads/dev'
    environment: staging

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster safe-job-cluster-staging \
            --service safe-job-backend-staging \
            --force-new-deployment \
            --task-definition safe-job-backend-staging

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster safe-job-cluster-staging \
            --services safe-job-backend-staging

      - name: Run database migrations
        run: |
          aws ecs run-task \
            --cluster safe-job-cluster-staging \
            --task-definition safe-job-migrate-staging \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}"

  # Deploy to production
  deploy-production:
    runs-on: ubuntu-latest
    needs: [build-and-push]
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Create new task definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: infrastructure/ecs/task-definition-production.json
          container-name: backend
          image: ${{ needs.build-and-push.outputs.backend-image }}

      - name: Deploy to ECS with blue-green
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: safe-job-backend-production
          cluster: safe-job-cluster-production
          wait-for-service-stability: true
          wait-for-minutes: 10

      - name: Run smoke tests
        run: |
          curl -f https://api.safe-job.nl/health/ || exit 1
          curl -f https://safe-job.nl/ || exit 1

      - name: Notify deployment success
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: success
          channel: "#deployments"
          message: "🚀 Production deployment successful!"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Notify deployment failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          channel: "#deployments"
          message: "🚨 Production deployment failed!"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 9.3 Monitoring and Observability

#### 9.3.1 CloudWatch and Application Monitoring

**Duration**: 6 hours

**Priority**: High

**Tasks:**

- [ ] Set up comprehensive CloudWatch dashboards
- [ ] Configure application performance monitoring (APM)
- [ ] Implement centralized logging with structured logs
- [ ] Create alerting rules for critical metrics
- [ ] Set up distributed tracing for performance debugging

**Acceptance Criteria:**

- All application metrics visible in real-time dashboards
- Automated alerts trigger for performance/error thresholds
- Logs searchable and correlated across services
- Performance bottlenecks identifiable through tracing
- SLA metrics tracked and reported automatically

**Implementation Details:**

```hcl
# infrastructure/terraform/monitoring.tf
# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}-backend-${var.environment}"
  retention_in_days = var.environment == "production" ? 30 : 7
  kms_key_id       = aws_kms_key.main.arn

  tags = {
    Name = "${var.project_name}-backend-logs-${var.environment}"
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/aws/ecs/${var.project_name}-${var.environment}"
  retention_in_days = var.environment == "production" ? 30 : 7
  kms_key_id       = aws_kms_key.main.arn

  tags = {
    Name = "${var.project_name}-ecs-logs-${var.environment}"
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main.arn_suffix],
            [".", "TargetResponseTime", ".", "."],
            [".", "HTTPCode_Target_2XX_Count", ".", "."],
            [".", "HTTPCode_Target_4XX_Count", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Application Load Balancer Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", aws_ecs_service.backend.name, "ClusterName", aws_ecs_cluster.main.name],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "ECS Service Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", aws_db_instance.main.id],
            [".", "DatabaseConnections", ".", "."],
            [".", "ReadLatency", ".", "."],
            [".", "WriteLatency", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "RDS Metrics"
          period  = 300
        }
      }
    ]
  })
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.project_name}-high-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ServiceName = aws_ecs_service.backend.name
    ClusterName = aws_ecs_cluster.main.name
  }

  tags = {
    Name = "${var.project_name}-high-cpu-alarm-${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "${var.project_name}-high-memory-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ServiceName = aws_ecs_service.backend.name
    ClusterName = aws_ecs_cluster.main.name
  }

  tags = {
    Name = "${var.project_name}-high-memory-alarm-${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "alb_response_time" {
  alarm_name          = "${var.project_name}-alb-response-time-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = "2"
  alarm_description   = "This metric monitors ALB response time"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  tags = {
    Name = "${var.project_name}-alb-response-time-alarm-${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${var.project_name}-rds-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  tags = {
    Name = "${var.project_name}-rds-cpu-alarm-${var.environment}"
  }
}

# SNS Topic for alerts
resource "aws_sns_topic" "alerts" {
  name         = "${var.project_name}-alerts-${var.environment}"
  display_name = "Safe Job ${title(var.environment)} Alerts"
  kms_master_key_id = aws_kms_key.main.key_id

  tags = {
    Name = "${var.project_name}-alerts-${var.environment}"
  }
}

resource "aws_sns_topic_subscription" "email_alerts" {
  count     = length(var.alert_emails)
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_emails[count.index]
}

# Custom application metrics
resource "aws_cloudwatch_log_metric_filter" "error_count" {
  name           = "${var.project_name}-error-count-${var.environment}"
  log_group_name = aws_cloudwatch_log_group.backend.name
  pattern        = "[timestamp, request_id, ERROR, ...]"

  metric_transformation {
    name      = "ErrorCount"
    namespace = "SafeJob/Application"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "error_rate" {
  alarm_name          = "${var.project_name}-error-rate-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ErrorCount"
  namespace           = "SafeJob/Application"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors application error rate"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  tags = {
    Name = "${var.project_name}-error-rate-alarm-${var.environment}"
  }
}
```

#### 9.3.2 Application Performance Monitoring Integration

**Duration**: 4 hours

**Priority**: Medium

**Tasks:**

- [ ] Integrate AWS X-Ray for distributed tracing
- [ ] Set up custom metrics collection
- [ ] Configure performance monitoring dashboards
- [ ] Implement health check endpoints
- [ ] Add uptime monitoring with external services

**Acceptance Criteria:**

- Request traces visible across all service boundaries
- Custom business metrics tracked and visualized
- Health checks provide detailed service status
- External monitoring validates service availability
- Performance regression detection automated

### 9.4 Backup and Disaster Recovery

#### 9.4.1 Automated Backup Strategy

**Duration**: 4 hours

**Priority**: High

**Tasks:**

- [ ] Configure automated RDS backups with point-in-time recovery
- [ ] Set up S3 cross-region replication for file storage
- [ ] Implement database backup validation and testing
- [ ] Create disaster recovery runbooks and procedures
- [ ] Set up infrastructure backup for quick recovery

**Acceptance Criteria:**

- Database backups created automatically with 30-day retention
- File storage replicated to secondary region
- Backup integrity verified through automated testing
- Recovery procedures documented and tested quarterly
- Infrastructure can be recreated from code in <4 hours

## Risk Assessment & Mitigation

### High Risk Areas

1. **Database Migration in Production**
   - **Risk**: Data loss or corruption during schema changes
   - **Mitigation**: Blue-green deployment with rollback capability, migration testing in staging
   - **Monitoring**: Database performance metrics, connection count, query time

2. **Network Configuration Errors**
   - **Risk**: Service unavailability due to misconfigured security groups or routing
   - **Mitigation**: Infrastructure as Code with peer review, comprehensive testing
   - **Monitoring**: Network connectivity tests, service health checks

3. **Cost Overruns**
   - **Risk**: Unexpected AWS costs from misconfigured resources
   - **Mitigation**: Cost budgets with alerts, right-sizing instances, regular cost reviews
   - **Monitoring**: Daily cost tracking, resource utilization metrics

### Medium Risk Areas

1. **Container Image Vulnerabilities**
   - **Risk**: Security vulnerabilities in Docker images
   - **Mitigation**: Regular security scanning, minimal base images, dependency updates
   - **Monitoring**: Vulnerability scan results, security patch status

2. **Auto-scaling Misconfiguration**
   - **Risk**: Poor performance during traffic spikes or cost issues from over-scaling
   - **Mitigation**: Load testing, gradual scaling policies, cost monitoring
   - **Monitoring**: CPU/memory utilization, request latency, scaling events

## Testing Requirements

### Infrastructure Tests

- [ ] Terraform plan validation and security scanning
- [ ] Network connectivity and security group testing
- [ ] Load balancer health check validation
- [ ] Database connection and performance testing

### Deployment Tests

- [ ] Blue-green deployment process validation
- [ ] Database migration rollback testing
- [ ] Service discovery and registration testing
- [ ] SSL certificate and domain configuration testing

### Disaster Recovery Tests

- [ ] Database restore from backup testing
- [ ] Cross-region failover procedures
- [ ] Infrastructure recreation from code
- [ ] Application data recovery validation

### Performance Tests

- [ ] Load testing under expected traffic patterns
- [ ] Auto-scaling behavior validation
- [ ] Database performance under load
- [ ] CDN and static asset delivery testing

## Documentation Requirements

- [ ] Infrastructure architecture diagrams
- [ ] Deployment procedures and runbooks
- [ ] Monitoring and alerting configuration guide
- [ ] Disaster recovery procedures
- [ ] Cost optimization and management guide

## Deliverables Checklist

### Infrastructure Deliverables

- [ ] Production VPC with multi-AZ setup
- [ ] ECS Fargate cluster with auto-scaling
- [ ] RDS PostgreSQL with Multi-AZ and read replicas
- [ ] ElastiCache Redis cluster
- [ ] Application Load Balancer with SSL
- [ ] S3 buckets with proper policies and encryption

### Security Deliverables

- [ ] IAM roles and policies with least privilege
- [ ] VPC security groups with minimal access
- [ ] KMS encryption for data at rest
- [ ] AWS WAF for application protection
- [ ] SSL certificates and HTTPS enforcement

### Monitoring Deliverables

- [ ] CloudWatch dashboards and alarms
- [ ] Centralized logging configuration
- [ ] SNS notification setup
- [ ] Performance monitoring integration
- [ ] Uptime monitoring configuration

### CI/CD Deliverables

- [ ] GitHub Actions workflow for automated deployment
- [ ] Docker image building and ECR integration
- [ ] Blue-green deployment configuration
- [ ] Database migration automation
- [ ] Security scanning integration

## Success Metrics

- **Availability**: 99.9% uptime SLA with automated monitoring
- **Performance**: <2 second average response time under normal load
- **Security**: Zero security incidents, all vulnerabilities patched within 48 hours
- **Deployment**: <15 minute deployment time with zero-downtime releases
- **Cost Efficiency**: Infrastructure costs within 10% of budget projections
- **Recovery**: <4 hour recovery time objective (RTO) for disaster scenarios

This comprehensive AWS deployment phase establishes enterprise-grade infrastructure that can scale with Safe Job's growth while maintaining security, performance, and operational excellence standards.
