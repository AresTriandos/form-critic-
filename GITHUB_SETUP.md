# GitHub Setup for FormCritic

This guide helps you set up the FormCritic repository on GitHub.

## Prerequisites

- GitHub account
- Git installed locally
- Repository already created at: `https://github.com/AresTriandos/form-critic-app`

## Initial Setup

### 1. Configure Git User

```bash
git config --global user.email "annapolischiro@hotmail.com"
git config --global user.name "Ares Triandos"
```

### 2. Initialize Repository

```bash
cd /data/.openclaw/workspace/form-critic-app

# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/AresTriandos/form-critic-app.git

# Check connection
git remote -v
```

### 3. Create .gitignore

The project already has a `.gitignore`, but make sure it includes:

```
node_modules/
.env
.env.local
.expo/
.cache/
dist/
function.zip
/tmp
*.log
.DS_Store
.android/
.ios/
```

### 4. Initial Commit

```bash
git add .
git commit -m "Initial commit: FormCritic MVP - workout form analysis app"
git branch -M main
git push -u origin main
```

## Branch Strategy

### Main Branches

- **main**: Production-ready code, always deployable
- **develop**: Integration branch for features

### Feature Branches

Create feature branches off `develop`:

```bash
git checkout -b feature/camera-improvements
# Make changes
git add .
git commit -m "feat: improve camera recording stability"
git push origin feature/camera-improvements
# Create pull request on GitHub
```

### Naming Convention

- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/topic` - Documentation
- `refactor/area` - Code refactoring
- `chore/task` - Build, dependencies, etc.

## Deployment Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes, commit
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub
# 1. Go to https://github.com/AresTriandos/form-critic-app
# 2. Click "New Pull Request"
# 3. Compare: develop <- feature/new-feature
# 4. Create PR, request review
```

### 2. Code Review & Merge

- Request review from team members
- Address feedback with new commits
- Merge when approved

### 3. Release to TestFlight/Production

Once merged to `develop` or `main`:

```bash
# Update version in package.json
npm version patch  # or minor/major

# Build for iOS (requires EAS)
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios

# Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## GitHub Actions (CI/CD)

### Create `.github/workflows/lint.yml`

```yaml
name: Lint

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
```

### Create `.github/workflows/build.yml`

```yaml
name: Build

on:
  push:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/
```

## Common Commands

```bash
# Check status
git status

# View changes
git diff

# View commit history
git log --oneline -10

# View current branch
git branch

# Create and switch to new branch
git checkout -b feature/name

# Switch branches
git checkout main

# Push all branches
git push --all

# Pull latest changes
git pull origin main

# Rebase (keep history clean)
git rebase origin/main

# Squash commits
git rebase -i HEAD~3
```

## Collaboration

### Issue Tracking

1. Go to Issues tab on GitHub
2. Create issue with template:
   - Title: Clear, concise description
   - Description: Detailed explanation
   - Labels: bug, feature, enhancement, etc.
   - Assignee: Who's working on it

### Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Closes #123

## Testing
How to test the changes

## Checklist
- [ ] Code reviewed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Tested on device
```

## Protection Rules

### Setup Branch Protection

1. Go to Settings > Branches
2. Add rule for `main`:
   - Require pull request reviews: 1
   - Require status checks to pass
   - Include administrators

3. Add rule for `develop`:
   - Require pull request reviews: 1

## Releases

### Create Release

```bash
# Create tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Or create release on GitHub:
# 1. Go to Releases
# 2. Click "Draft a new release"
# 3. Select tag v1.0.0
# 4. Add release notes
# 5. Publish
```

### Release Notes Template

```markdown
## Version 1.0.0

### ✨ New Features
- Feature 1
- Feature 2

### 🐛 Bug Fixes
- Fix 1
- Fix 2

### 📚 Documentation
- Updated setup guide

### 🔧 Dependencies
- Updated package name to latest

### Breaking Changes
- None

### Contributors
- @AresTriandos
```

## Secrets Management

### GitHub Secrets

1. Go to Settings > Secrets and variables > Actions
2. Add repository secrets:
   - `ANTHROPIC_API_KEY`: Your Claude API key
   - `AWS_LAMBDA_ENDPOINT`: Your Lambda function URL

### Use in Actions

```yaml
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Troubleshooting

### Push Rejected

```bash
# Pull latest changes first
git pull origin main

# Then push
git push origin main
```

### Merge Conflicts

```bash
# Check conflicts
git status

# Edit files to resolve

# Mark as resolved
git add .

# Complete merge
git commit -m "Resolve merge conflicts"
```

### Undo Last Commit

```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

## Resources

- [GitHub Docs](https://docs.github.com)
- [Git Basics](https://git-scm.com/book)
- [GitHub Actions](https://docs.github.com/en/actions)
- [EAS Deployment](https://docs.expo.dev/eas)
