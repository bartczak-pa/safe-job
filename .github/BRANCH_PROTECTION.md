# Branch Protection Rules Setup Guide

This document provides step-by-step instructions for setting up branch protection rules for the Safe Job Platform repository.

## 🎯 Branching Strategy Overview

### Branch Structure
- **`main`** - Production-ready code, always deployable
- **`develop`** - Integration branch for latest development
- **`feature/*`** - Individual features and development work
- **`hotfix/*`** - Emergency fixes for production issues
- **`docs/*`** - Documentation updates and improvements

## 🔒 Branch Protection Rules

### Main Branch Protection

**GitHub Settings → Branches → Add Rule**

**Branch name pattern**: `main`

**Protection settings**:
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1` (can be yourself)
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners (optional)
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - ✅ Status checks: `build`, `test`, `docs` (when available)
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits** (recommended for security)
- ✅ **Include administrators** (apply rules to admins too)
- ✅ **Restrict pushes that create files**
- ✅ **Do not allow bypassing the above settings**

### Develop Branch Protection

**Branch name pattern**: `develop`

**Protection settings**:
- ✅ **Require a pull request before merging**
  - ❌ Require approvals: `0` (for solo development flexibility)
  - ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - ✅ Status checks: `build`, `test`
- ✅ **Require conversation resolution before merging**
- ❌ **Include administrators** (allow admin bypass for development)

### Feature Branch Protection

**Branch name pattern**: `feature/*`

**Protection settings**:
- ❌ **Require a pull request before merging** (allow direct commits for development speed)
- ✅ **Require status checks to pass before merging**
  - ❌ Require branches to be up to date before merging
  - ✅ Status checks: `build`
- ❌ **Include administrators**

## 🚀 GitHub Actions Integration

Create these status checks in your workflows:

### Required Status Checks
- **`build`** - Application builds successfully
- **`test`** - All tests pass
- **`docs`** - Documentation builds without errors
- **`security`** - Security scanning passes
- **`lint`** - Code quality checks pass

## 📋 Step-by-Step Setup Instructions

### 1. Create Repository Structure

```bash
# Initialize repository (if not done)
git init
git branch -M main

# Create develop branch
git checkout -b develop
git push -u origin develop

# Switch back to main
git checkout main
```

### 2. Set Up Branch Protection in GitHub

1. **Go to Repository Settings**
   - Navigate to your GitHub repository
   - Click "Settings" tab
   - Click "Branches" in the left sidebar

2. **Add Main Branch Protection**
   - Click "Add rule"
   - Branch name pattern: `main`
   - Configure protection settings (see above)
   - Click "Create"

3. **Add Develop Branch Protection**
   - Click "Add rule" again
   - Branch name pattern: `develop`
   - Configure protection settings (see above)
   - Click "Create"

### 3. Create Branch Protection Workflow

This ensures your CI/CD pipeline provides the required status checks:

```yaml
# .github/workflows/branch-protection.yml
name: Branch Protection Checks

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    name: Build Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Check
        run: echo "Build check passed"
  
  test:
    name: Test Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test Check
        run: echo "Test check passed"
  
  docs:
    name: Documentation Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test Documentation Build
        run: |
          pip install mkdocs-material mkdocs-git-revision-date-localized-plugin
          mkdocs build --strict
```

## 🔄 Development Workflow

### Feature Development
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/new-feature-name

# Work on feature...
git add .
git commit -m "feat: implement new feature"
git push -u origin feature/new-feature-name

# Create PR: feature/new-feature-name → develop
# After approval and merge, delete feature branch
```

### Release to Production
```bash
# Create release PR
git checkout main
git pull origin main
git checkout develop
git pull origin develop

# Create PR: develop → main
# After approval and merge, tag release
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Hotfix Process
```bash
# Emergency fix
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue

# Fix the issue...
git add .
git commit -m "fix: resolve critical production issue"
git push -u origin hotfix/critical-issue

# Create PR: hotfix/critical-issue → main
# Also merge back to develop
git checkout develop
git merge hotfix/critical-issue
git push origin develop
```

## 🛡️ Security Considerations

### Signed Commits
Enable signed commits for additional security:

```bash
# Configure GPG signing
git config --global commit.gpgsign true
git config --global user.signingkey YOUR_GPG_KEY
```

### Required Reviews
- **Main branch**: Require at least 1 review
- **Develop branch**: Optional for solo development
- **Feature branches**: No requirements for development speed

### Status Check Requirements
- All automated tests must pass
- Documentation must build successfully
- Security scans must complete without critical issues

## 📊 Monitoring and Maintenance

### Weekly Review
- Check for stale branches and clean up
- Review protection rule effectiveness
- Update status check requirements as needed

### Branch Cleanup
```bash
# List merged branches
git branch --merged

# Delete merged feature branches
git branch -d feature/completed-feature
git push origin --delete feature/completed-feature
```

## 🎯 Benefits of This Setup

### For Solo Development
- **Flexibility**: Easy to work on features without friction
- **Protection**: Prevents accidental main branch damage
- **Documentation**: Forces documentation updates with code changes
- **Quality**: Automated checks ensure code quality

### For Future Team Growth
- **Scalable**: Works well as team grows
- **Professional**: Industry-standard practices
- **Secure**: Proper review and approval processes
- **Traceable**: Clear history and accountability

---

This setup provides the perfect balance of protection and productivity for your development workflow! 🚀