# GitHub Configuration

This directory contains all GitHub-specific configurations for the repository.

## 📁 Directory Structure

```
.github/
├── workflows/              # GitHub Actions workflows
│   ├── ci.yml             # Continuous Integration
│   ├── deploy.yml         # Production deployment
│   ├── preview.yml        # PR preview deployments
│   ├── dependency-review.yml  # Dependency security
│   └── codeql.yml         # Code security scanning
│
├── ISSUE_TEMPLATE/        # Issue templates
│   ├── bug_report.yml     # Bug report form
│   ├── feature_request.yml # Feature request form
│   └── config.yml         # Template configuration
│
├── pull_request_template.md   # PR template
├── CONTRIBUTING.md            # Contributing guidelines
└── README.md                  # This file
```

## 🔄 Workflows

### CI (`ci.yml`)
- **Triggers:** Push/PR to main or develop
- **Actions:**
  - Lint code
  - Type check
  - Run tests
  - Build project
  - Upload coverage
  - Run Lighthouse

### Deploy (`deploy.yml`)
- **Triggers:** Push to main
- **Actions:**
  - Run tests
  - Build project
  - Deploy to Vercel production

### Preview (`preview.yml`)
- **Triggers:** PR to main or develop
- **Actions:**
  - Run tests
  - Build project
  - Deploy preview to Vercel
  - Comment preview URL on PR

### CodeQL (`codeql.yml`)
- **Triggers:** Push/PR, weekly schedule
- **Actions:**
  - Scan code for vulnerabilities
  - Report security issues

### Dependency Review (`dependency-review.yml`)
- **Triggers:** PR
- **Actions:**
  - Check for vulnerable dependencies
  - Block high-severity issues

## 🔐 Required Secrets

Set these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel authentication token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `CODECOV_TOKEN` | Codecov token (optional) |

See `GITHUB_SETUP.md` for detailed instructions.

## 📝 Templates

### Issue Templates
- **Bug Report:** Structured form for reporting bugs
- **Feature Request:** Form for suggesting new features
- **Config:** Disable blank issues, add discussion links

### PR Template
- Standardized format for pull requests
- Includes checklist and description sections

## 🛠️ Setup

For complete setup instructions, see:
- **Quick Setup:** `../GITHUB_SETUP.md`
- **Full Guide:** `../DEPLOYMENT.md`

## 📚 Learn More

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [Issue Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
