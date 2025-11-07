#!/bin/bash

# GitHub Repository Setup Script
# This script helps automate the GitHub repository setup process

set -e  # Exit on error

echo "🚀 GitHub Repository Setup"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI found${NC}"
echo ""

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to GitHub${NC}"
    echo "Running: gh auth login"
    gh auth login
fi

echo -e "${GREEN}✅ Logged in to GitHub${NC}"
echo ""

# Ask for repository name
read -p "Enter repository name (default: stock-earnings): " REPO_NAME
REPO_NAME=${REPO_NAME:-stock-earnings}

# Ask for visibility
echo ""
echo "Repository visibility:"
echo "1) Public"
echo "2) Private"
read -p "Choose (1 or 2, default: 1): " VISIBILITY
VISIBILITY=${VISIBILITY:-1}

if [ "$VISIBILITY" == "1" ]; then
    VISIBILITY_FLAG="--public"
else
    VISIBILITY_FLAG="--private"
fi

# Create repository
echo ""
echo -e "${YELLOW}Creating GitHub repository...${NC}"

if gh repo create "$REPO_NAME" $VISIBILITY_FLAG --source=. --remote=origin --push; then
    echo -e "${GREEN}✅ Repository created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create repository${NC}"
    exit 1
fi

# Get username and repo URL
USERNAME=$(gh api user -q .login)
REPO_URL="https://github.com/$USERNAME/$REPO_NAME"

echo ""
echo -e "${GREEN}✅ Repository URL: $REPO_URL${NC}"

# Update README badges
echo ""
echo -e "${YELLOW}Updating README badges...${NC}"
sed -i.bak "s/USERNAME/$USERNAME/g" README.md && rm README.md.bak
sed -i.bak "s/USERNAME/$USERNAME/g" .github/ISSUE_TEMPLATE/config.yml && rm .github/ISSUE_TEMPLATE/config.yml.bak
sed -i.bak "s/USERNAME/$USERNAME/g" .github/CONTRIBUTING.md && rm .github/CONTRIBUTING.md.bak

git add README.md .github/ISSUE_TEMPLATE/config.yml .github/CONTRIBUTING.md
git commit -m "docs: update repository URLs with username"
git push

echo -e "${GREEN}✅ README badges updated${NC}"

# Enable features
echo ""
echo -e "${YELLOW}Enabling repository features...${NC}"

gh repo edit "$USERNAME/$REPO_NAME" \
    --enable-issues=true \
    --enable-projects=false \
    --enable-wiki=false

echo -e "${GREEN}✅ Repository features configured${NC}"

# Set repository topics
echo ""
echo -e "${YELLOW}Setting repository topics...${NC}"
gh repo edit "$USERNAME/$REPO_NAME" \
    --add-topic react \
    --add-topic typescript \
    --add-topic stocks \
    --add-topic earnings \
    --add-topic finance \
    --add-topic vercel \
    --add-topic vite

echo -e "${GREEN}✅ Topics added${NC}"

# Next steps
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Repository created successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Repository: $REPO_URL"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1️⃣  Add GitHub Secrets (required for CI/CD):"
echo "   Go to: $REPO_URL/settings/secrets/actions"
echo ""
echo "   Add these secrets:"
echo "   - VERCEL_TOKEN"
echo "   - VERCEL_ORG_ID"
echo "   - VERCEL_PROJECT_ID"
echo ""
echo "   Get values by running:"
echo "   $ vercel link"
echo "   $ cat .vercel/project.json"
echo "   $ vercel token (or create at https://vercel.com/account/tokens)"
echo ""
echo "2️⃣  Enable Discussions (optional):"
echo "   Go to: $REPO_URL/settings"
echo "   Check: Features → Discussions"
echo ""
echo "3️⃣  Set up branch protection:"
echo "   Go to: $REPO_URL/settings/branches"
echo "   Add rule for 'main' branch"
echo ""
echo "4️⃣  Enable security features:"
echo "   Go to: $REPO_URL/settings/security_analysis"
echo "   Enable: Dependabot, CodeQL, Secret scanning"
echo ""
echo "📚 For detailed instructions, see: GITHUB_SETUP.md"
echo ""
echo -e "${GREEN}✨ Happy coding!${NC}"
