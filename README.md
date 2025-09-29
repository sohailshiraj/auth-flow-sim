# Auth Flow Sim

A TypeScript project with automated linting and formatting setup.

## Setup

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** for running linters on staged files
- **GitHub Actions** for CI/CD

## Development

### Available Scripts

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is formatted correctly
- `npm run type-check` - Run TypeScript type checking
- `npm run ci:check` - Run all checks (lint, format, type-check)

### Pre-commit Hooks

This project uses Husky to automatically run linting and formatting on every commit:

- ESLint will automatically fix fixable issues
- Prettier will format your code
- Only staged files are processed (thanks to lint-staged)

### CI/CD

GitHub Actions workflow (`.github/workflows/lint-and-format.yml`) runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

The workflow ensures:
- Code passes ESLint checks
- Code is properly formatted with Prettier
- TypeScript compiles without errors

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start developing:
   ```bash
   # Your code will be automatically linted and formatted on commit
   git add .
   git commit -m "Your changes"
   ```

3. Run checks manually:
   ```bash
   npm run ci:check
   ```
