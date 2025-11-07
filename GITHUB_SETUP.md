# GitHub Repository Setup Guide

Complete guide to setting up your GitHub repository with automated CI/CD workflows.

## 📋 Overview

This setup includes:
- ✅ Automated testing on every push/PR
- ✅ Automatic deployment to Vercel
- ✅ Preview deployments for PRs
- ✅ Security scanning (CodeQL)
- ✅ Dependency vulnerability checks
- ✅ Code quality checks (linting, type checking)

---

## 🚀 Part 1: Create GitHub Repository

### Option A: Via GitHub CLI

```bash
# Install GitHub CLI if needed
brew install gh  # macOS
# or: https://cli.github.com/

# Login
gh auth login

# Create repository
gh repo create stock-earnings --public --source=. --remote=origin --push

# Or create as private
gh repo create stock-earnings --private --source=. --remote=origin --push
```

### Option B: Via GitHub Web Interface

1. Go to https://github.com/new
2. Repository name: `stock-earnings`
3. Description: "Stock earnings tracker with real-time data"
4. Choose Public or Private
5. Don't initialize with README (we already have one)
6. Click "Create repository"

7. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/stock-earnings.git
git branch -M main
git push -u origin main
```

---

## 🔐 Part 2: Configure Secrets

You need to add secrets for GitHub Actions to work properly.

### 2.1 Get Vercel Tokens

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link project:**
   ```bash
   vercel link
   ```
   Select or create your project.

4. **Get credentials:**
   ```bash
   # Get Vercel Token (save this!)
   # Go to: https://vercel.com/account/tokens
   # Click "Create"
   # Name: "GitHub Actions"
   # Copy the token

   # Get Project ID and Org ID
   cat .vercel/project.json
   ```

   This will show:
   ```json
   {
     "projectId": "prj_xxxxxxxxxxxx",
     "orgId": "team_xxxxxxxxxxxx"
   }
   ```

### 2.2 Add Secrets to GitHub

Go to your repository on GitHub:

**Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret Name | Description | Where to Get |
|-------------|-------------|--------------|
| `VERCEL_TOKEN` | Vercel authentication token | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Your Vercel organization ID | `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | `.vercel/project.json` → `projectId` |
| `CODECOV_TOKEN` | Codecov token (optional) | https://codecov.io/ → Add repo |

**Note:** Don't add `FMP_API_KEY` here - it should be in Vercel environment variables only!

### 2.3 Add Environment Variables to Vercel

These go in Vercel dashboard (not GitHub):

1. Go to your project: https://vercel.com/dashboard
2. Settings → Environment Variables
3. Add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `FMP_API_KEY` | Your FMP API key | Production, Preview |
| `VITE_USE_MOCK_DATA` | `false` | Production |
| `VITE_USE_MOCK_DATA` | `true` | Preview (optional) |

---

## 🔄 Part 3: Workflows Explained

### CI Workflow (`.github/workflows/ci.yml`)

**Triggers:** Push or PR to `main` or `develop`

**What it does:**
1. ✅ Runs ESLint
2. ✅ Runs TypeScript type checking
3. ✅ Runs all tests
4. ✅ Builds the project
5. ✅ Uploads code coverage to Codecov
6. ✅ Runs Lighthouse performance tests

**When it runs:**
- Every push to main/develop
- Every pull request

### Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:** Push to `main` or manual trigger

**What it does:**
1. ✅ Runs all tests
2. ✅ Builds the project
3. ✅ Deploys to Vercel production

**When it runs:**
- Every push to main branch
- Manual trigger via GitHub Actions tab

### Preview Workflow (`.github/workflows/preview.yml`)

**Triggers:** Pull request to `main` or `develop`

**What it does:**
1. ✅ Runs all tests
2. ✅ Builds the project
3. ✅ Deploys preview to Vercel
4. ✅ Comments on PR with preview URL

**When it runs:**
- When PR is opened
- When PR is updated

### Security Workflows

**CodeQL (`.github/workflows/codeql.yml`):**
- Scans code for security vulnerabilities
- Runs on push, PR, and weekly schedule

**Dependency Review (`.github/workflows/dependency-review.yml`):**
- Checks for vulnerable dependencies in PRs
- Blocks high-severity vulnerabilities

---

## 🎯 Part 4: Test the Workflows

### 4.1 Test CI Workflow

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify CI workflow"
git push
```

Go to: **Actions** tab in GitHub

You should see:
- ✅ CI workflow running
- ✅ All checks passing
- ✅ Green checkmark when done

### 4.2 Test PR Workflow

```bash
# Create a test branch
git checkout -b test/pr-workflow

# Make a change
echo "console.log('test')" >> src/main.tsx

# Commit and push
git add .
git commit -m "test: verify PR workflow"
git push -u origin test/pr-workflow
```

On GitHub:
1. Click "Compare & pull request"
2. Create the PR

You should see:
- ✅ CI checks running
- ✅ Preview deployment workflow running
- ✅ Bot comment with preview URL
- ✅ All checks passing

### 4.3 Test Deploy Workflow

```bash
# Merge the PR or push directly to main
git checkout main
git merge test/pr-workflow
git push
```

You should see:
- ✅ Deploy workflow running
- ✅ App deployed to production
- ✅ Production URL updated

---

## 🛡️ Part 5: Branch Protection Rules

Protect your main branch:

**Settings → Branches → Add rule**

Settings to enable:

```yaml
Branch name pattern: main

✓ Require a pull request before merging
  ✓ Require approvals: 1
  ✓ Dismiss stale pull request approvals when new commits are pushed

✓ Require status checks to pass before merging
  ✓ Require branches to be up to date before merging
  Status checks that are required:
    - test (from CI workflow)
    - lighthouse (from CI workflow)
    - analyze (from CodeQL workflow)

✓ Require conversation resolution before merging

✓ Do not allow bypassing the above settings
```

Click **Create** or **Save changes**.

---

## 📊 Part 6: Enable GitHub Features

### 6.1 Enable Discussions

**Settings → General → Features**
- ✓ Enable Discussions

### 6.2 Enable Security Features

**Settings → Security**
- ✓ Dependency graph
- ✓ Dependabot alerts
- ✓ Dependabot security updates
- ✓ Code scanning (CodeQL)
- ✓ Secret scanning

### 6.3 Add Repository Topics

**About** (top right of repo page)
- Add topics: `react`, `typescript`, `stocks`, `earnings`, `finance`, `vercel`, `vite`
- Add description
- Add website URL (your Vercel deployment)

---

## 🎨 Part 7: Customize Repository

### 7.1 Update README Badge

Add this to the top of `README.md`:

```markdown
![CI](https://github.com/YOUR_USERNAME/stock-earnings/workflows/CI/badge.svg)
![Deploy](https://github.com/YOUR_USERNAME/stock-earnings/workflows/Deploy%20to%20Vercel/badge.svg)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/stock-earnings/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/stock-earnings)
```

Replace `YOUR_USERNAME` with your GitHub username.

### 7.2 Update Issue Template Config

Edit `.github/ISSUE_TEMPLATE/config.yml`:

Replace `USERNAME` with your GitHub username:
```yaml
url: https://github.com/YOUR_USERNAME/stock-earnings/discussions
```

### 7.3 Update Contributing Guide

Edit `.github/CONTRIBUTING.md`:

Replace `USERNAME` with your GitHub username in all URLs.

---

## 🔔 Part 8: Notifications

Configure when you want to be notified:

**Settings → Notifications → Custom routing**

For this repository:
- Pull request reviews: Email
- Pull request pushes: Email
- CI activity: Off (unless you want to be notified)

---

## 📝 Part 9: Workflow Files Reference

### Created Files

```
.github/
├── workflows/
│   ├── ci.yml                    # Main CI pipeline
│   ├── deploy.yml                # Production deployment
│   ├── preview.yml               # PR preview deployments
│   ├── dependency-review.yml     # Dependency security
│   └── codeql.yml                # Code security scanning
├── ISSUE_TEMPLATE/
│   ├── bug_report.yml            # Bug report form
│   ├── feature_request.yml       # Feature request form
│   └── config.yml                # Issue template config
├── pull_request_template.md      # PR template
└── CONTRIBUTING.md               # Contributing guidelines
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Repository created and code pushed
- [ ] All secrets added to GitHub
- [ ] Environment variables added to Vercel
- [ ] CI workflow runs on push
- [ ] PR workflow creates preview deployments
- [ ] Deploy workflow deploys to production
- [ ] CodeQL security scanning enabled
- [ ] Branch protection rules configured
- [ ] Discussions enabled
- [ ] Issue templates work
- [ ] PR template appears
- [ ] README badges updated

---

## 🎯 Workflow Triggers Summary

| Workflow | Trigger | When |
|----------|---------|------|
| CI | Push/PR to main/develop | Every commit |
| Deploy | Push to main | Production deployment |
| Preview | PR to main/develop | Preview deployment |
| CodeQL | Push/PR/Schedule | Security scan |
| Dependency Review | PR | Dependency check |

---

## 🆘 Troubleshooting

### Workflow Fails with "Resource not accessible by integration"

**Solution:** Check that secrets are correctly set:
```bash
# In GitHub repo settings
Settings → Secrets and variables → Actions
```

### Vercel Deployment Fails

**Cause:** Missing `VERCEL_TOKEN`, `VERCEL_ORG_ID`, or `VERCEL_PROJECT_ID`

**Solution:**
1. Verify secrets in GitHub
2. Check `.vercel/project.json` exists
3. Re-run `vercel link` if needed

### CodeQL Fails

**Cause:** First time running, needs initialization

**Solution:** Wait for it to complete once, then it will work on future runs.

### Preview URL Not Posted to PR

**Cause:** Missing `GITHUB_TOKEN` permission

**Solution:** `GITHUB_TOKEN` is automatically provided, but check workflow syntax.

---

## 🎉 Success!

Your repository is now fully configured with:

- ✅ Automated CI/CD
- ✅ Security scanning
- ✅ Preview deployments
- ✅ Code quality checks
- ✅ Issue/PR templates
- ✅ Branch protection

Every push and PR will now be automatically tested and deployed! 🚀

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
