# Testing Guide for Husky + lint-staged + GitHub Actions

This guide explains how to test the automated linting and formatting setup.

## 🧪 Test Scenarios

### 1. Local Pre-commit Hook Testing

#### Test 1: Auto-fixable Issues
Create a file with formatting and linting issues that can be auto-fixed:

```bash
# Create a file with bad formatting
cat > src/test-auto-fix.ts << 'EOF'
interface BadFormatting{
id:number;
name:string;
}

class BadClass{
private data:BadFormatting[]=[];
async getData():Promise<BadFormatting[]>{
return this.data.filter(item=>item.id>0);
}
}
EOF

# Stage and commit - should auto-fix and succeed
git add src/test-auto-fix.ts
git commit -m "Test auto-fix functionality"
```

**Expected Result**: ✅ Commit succeeds, file is automatically formatted

#### Test 2: Unfixable Issues
Create a file with issues that cannot be auto-fixed:

```bash
# Create a file with unfixable issues
cat > src/test-unfixable.ts << 'EOF'
// @ts-ignore
const unusedVariable = "this will cause ESLint error";
const anotherUnused = "this too";

// Missing return type
function badFunction(param) {
  return param + 1;
}
EOF

# Stage and commit - should fail
git add src/test-unfixable.ts
git commit -m "Test unfixable issues"
```

**Expected Result**: ❌ Commit fails, you must fix issues manually

### 2. CI/CD Testing

#### Test 3: Clean Code (Should Pass)
```bash
# Create clean code
cat > src/test-clean.ts << 'EOF'
interface CleanInterface {
  id: number;
  name: string;
}

class CleanClass {
  private data: CleanInterface[] = [];

  async getData(): Promise<CleanInterface[]> {
    return this.data.filter((item) => item.id > 0);
  }
}
EOF

git add src/test-clean.ts
git commit -m "Add clean code for CI testing"
git push origin test-branch
```

**Expected Result**: ✅ GitHub Actions passes

#### Test 4: Dirty Code (Should Fail)
```bash
# Create dirty code
cat > src/test-dirty.ts << 'EOF'
// Missing semicolons, bad formatting
const badCode = "test"
const anotherBad = "code"

function badFunction(param){
return param+1
}
EOF

git add src/test-dirty.ts
git commit -m "Add dirty code for CI testing"
git push origin test-branch
```

**Expected Result**: ❌ GitHub Actions fails

## 🔧 Manual Testing Commands

### Test All Checks Locally
```bash
npm run ci:check
```

### Test Individual Components
```bash
# ESLint only
npm run lint

# Prettier only
npm run format:check

# TypeScript only
npm run type-check

# Auto-fix issues
npm run lint:fix
npm run format
```

### Test Pre-commit Hook Manually
```bash
# Run lint-staged manually
npm run pre-commit
```

## 🚀 GitHub Actions Testing

### Test Workflow Triggers
1. **Push to main/develop**: Workflow should run automatically
2. **Pull Request**: Workflow should run on PR creation/updates
3. **Manual Trigger**: Can be triggered manually from GitHub UI

### Check Workflow Status
1. Go to your repository on GitHub
2. Click "Actions" tab
3. Look for "Lint and Format Check" workflow
4. Check if it passes or fails

### Workflow Steps
The workflow runs these steps:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies (`npm ci`)
4. Run ESLint (`npm run lint`)
5. Check Prettier formatting (`npm run format:check`)
6. Run TypeScript type check (`npx tsc --noEmit`)

## 🐛 Troubleshooting

### Pre-commit Hook Not Running
```bash
# Check if Husky is installed
ls -la .husky/

# Reinstall Husky
npm run prepare

# Check Git hooks
ls -la .git/hooks/
```

### ESLint Issues
```bash
# Check ESLint configuration
npx eslint --print-config src/index.ts

# Run ESLint with debug info
DEBUG=eslint:* npm run lint
```

### Prettier Issues
```bash
# Check Prettier configuration
npx prettier --find-config-path src/index.ts

# Check what files Prettier would format
npx prettier --check src/**/*.{ts,js,json,md}
```

## 📊 Test Results Summary

| Test | Local Hook | CI/CD | Status |
|------|------------|-------|--------|
| Auto-fixable issues | ✅ Auto-fixes | ✅ Passes | Working |
| Unfixable issues | ❌ Blocks commit | ❌ Fails | Working |
| Clean code | ✅ Passes | ✅ Passes | Working |
| Dirty code | ❌ Blocks commit | ❌ Fails | Working |

## 🎯 Best Practices for Testing

1. **Always test locally first** - Don't rely only on CI/CD
2. **Test both scenarios** - Clean code should pass, dirty code should fail
3. **Test edge cases** - Empty files, large files, special characters
4. **Test different file types** - .ts, .js, .json, .md files
5. **Monitor CI/CD regularly** - Check GitHub Actions status frequently

## 🔄 Continuous Testing

Set up these automated tests:
1. **Pre-commit**: Runs on every commit attempt
2. **CI/CD**: Runs on every push/PR
3. **Scheduled**: Run nightly/weekly comprehensive tests
4. **Release**: Run before every release

This ensures your code quality standards are always maintained! 🎉
