# Contributing to Stock Earnings Tracker

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/stock-earnings.git
   cd stock-earnings
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Make your changes and test them**
6. **Submit a pull request**

## 📋 Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- A code editor (VS Code recommended)

### Local Development

1. **Set up environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local if you want to test with real API
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Run linter:**
   ```bash
   npm run lint
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 🎯 Types of Contributions

### 🐛 Bug Fixes

1. Check if the bug is already reported in [Issues](https://github.com/USERNAME/stock-earnings/issues)
2. If not, create a new issue with the bug report template
3. Fix the bug in a new branch
4. Add tests to prevent regression
5. Submit a PR referencing the issue

### ✨ New Features

1. Check [Issues](https://github.com/USERNAME/stock-earnings/issues) and [Discussions](https://github.com/USERNAME/stock-earnings/discussions)
2. Open a feature request issue or discussion first
3. Wait for approval/feedback before starting work
4. Implement the feature with tests
5. Update documentation
6. Submit a PR

### 📝 Documentation

1. Identify areas that need better documentation
2. Make improvements to README, guides, or code comments
3. Submit a PR with your changes

### 🎨 UI/UX Improvements

1. Open an issue with mockups or descriptions
2. Get feedback from maintainers
3. Implement the changes
4. Include screenshots in your PR

## 🔍 Code Style

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Document complex functions

### React

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Follow React best practices

### Testing

- Write tests for new features
- Maintain test coverage above 80%
- Test edge cases and error handling
- Use descriptive test names

### Formatting

- Code is auto-formatted with Prettier (built into ESLint)
- Run `npm run lint` before committing
- Use meaningful variable and function names
- Add comments for complex logic

## 📝 Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Examples:

```bash
feat(earnings): add filter by earnings status
fix(chart): resolve price chart rendering issue
docs(readme): update installation instructions
test(services): add tests for stockService
```

## 🔄 Pull Request Process

1. **Update your branch:**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run all checks:**
   ```bash
   npm run lint    # Linting
   npm test        # Tests
   npm run build   # Build
   ```

3. **Push your changes:**
   ```bash
   git push origin your-branch
   ```

4. **Create Pull Request:**
   - Use the PR template
   - Link related issues
   - Add screenshots for UI changes
   - Request review from maintainers

5. **Address feedback:**
   - Make requested changes
   - Push updates to your branch
   - Re-request review

6. **Merge:**
   - Maintainers will merge your PR
   - Delete your branch after merge

## ✅ PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows the project style
- [ ] All tests pass
- [ ] New code has tests
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] PR description is complete
- [ ] No console errors or warnings
- [ ] Build succeeds

## 🧪 Testing Guidelines

### Unit Tests

- Test individual functions and components
- Mock external dependencies
- Cover edge cases

### Integration Tests

- Test component interactions
- Test API service calls
- Verify data flow

### Test Structure

```typescript
describe('Component/Function name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = ...;

    // Act
    const result = ...;

    // Assert
    expect(result).toBe(...);
  });
});
```

## 🐛 Debugging Tips

1. **Check browser console** for errors
2. **Use React DevTools** to inspect components
3. **Enable verbose logging** in services
4. **Test with mock data first** before real API
5. **Check network tab** for API issues

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [Financial Modeling Prep API](https://financialmodelingprep.com/developer/docs/)

## 🤝 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Any conduct that's unprofessional

## ❓ Questions?

- Open a [Discussion](https://github.com/USERNAME/stock-earnings/discussions)
- Check existing [Issues](https://github.com/USERNAME/stock-earnings/issues)
- Read the [Documentation](https://github.com/USERNAME/stock-earnings/blob/main/README.md)

## 🎉 Thank You!

Every contribution, no matter how small, makes a difference. We appreciate your time and effort!
