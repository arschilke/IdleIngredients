# Commit Conventions

This project uses conventional commits and automated tooling to maintain code quality.

## Conventional Commit Format

Commits must follow this format:
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `revert`: Reverting previous commits

### Examples
```
feat: add production planning system
fix(ui): resolve button alignment issue
docs: update README with new features
style: format code with prettier
refactor: simplify resource calculation logic
```

## Pre-commit Hooks

Before each commit, the following automatically runs:
1. **ESLint**: Checks code quality and fixes auto-fixable issues
2. **Prettier**: Formats code according to project standards

## Available Scripts

- `npm run format`: Format all files with Prettier
- `npm run lint`: Check code with ESLint
- `npm run lint:fix`: Fix auto-fixable ESLint issues
- `npm run check`: Check both formatting and linting
- `npm run fix`: Fix both formatting and linting issues

## Installation

The hooks are automatically installed when you run:
```bash
npm install
```

## Troubleshooting

If you encounter commit issues:
1. Run `npm run fix` to fix formatting/linting issues
2. Ensure your commit message follows the conventional format
3. Check that all staged files pass linting
