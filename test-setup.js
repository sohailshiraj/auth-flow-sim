#!/usr/bin/env node

/**
 * Test script for Husky + lint-staged + GitHub Actions setup
 * Run with: node test-setup.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
    try {
        log(`\n${colors.blue}Running: ${description}${colors.reset}`);
        const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        log(`✅ ${description} - PASSED`, 'green');
        return { success: true, output: result };
    } catch (error) {
        log(`❌ ${description} - FAILED`, 'red');
        log(`Error: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

function checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
        log(`✅ ${description} - EXISTS`, 'green');
        return true;
    } else {
        log(`❌ ${description} - MISSING`, 'red');
        return false;
    }
}

async function main() {
    log(`${colors.bold}🧪 Testing Husky + lint-staged + GitHub Actions Setup${colors.reset}`);
    log('='.repeat(60));

    let allTestsPassed = true;

    // Test 1: Check if required files exist
    log(`\n${colors.bold}📁 Checking Required Files${colors.reset}`);
    const requiredFiles = [
        ['.husky/pre-commit', 'Husky pre-commit hook'],
        ['.github/workflows/lint-and-format.yml', 'GitHub Actions workflow'],
        ['eslint.config.js', 'ESLint configuration'],
        ['.prettierrc', 'Prettier configuration'],
        ['package.json', 'Package.json with lint-staged config'],
    ];

    requiredFiles.forEach(([file, description]) => {
        if (!checkFileExists(file, description)) {
            allTestsPassed = false;
        }
    });

    // Test 2: Check if dependencies are installed
    log(`\n${colors.bold}📦 Checking Dependencies${colors.reset}`);
    const dependencies = ['husky', 'lint-staged', 'eslint', 'prettier'];
    dependencies.forEach((dep) => {
        const result = runCommand(`npm list ${dep}`, `Check ${dep} is installed`);
        if (!result.success) {
            allTestsPassed = false;
        }
    });

    // Test 3: Test ESLint
    log(`\n${colors.bold}🔍 Testing ESLint${colors.reset}`);
    const eslintResult = runCommand('npm run lint', 'ESLint check');
    if (!eslintResult.success) {
        allTestsPassed = false;
    }

    // Test 4: Test Prettier
    log(`\n${colors.bold}💅 Testing Prettier${colors.reset}`);
    const prettierResult = runCommand('npm run format:check', 'Prettier check');
    if (!prettierResult.success) {
        allTestsPassed = false;
    }

    // Test 5: Test TypeScript
    log(`\n${colors.bold}📝 Testing TypeScript${colors.reset}`);
    const tsResult = runCommand('npm run type-check', 'TypeScript type check');
    if (!tsResult.success) {
        allTestsPassed = false;
    }

    // Test 6: Test complete CI check
    log(`\n${colors.bold}🚀 Testing Complete CI Check${colors.reset}`);
    const ciResult = runCommand('npm run ci:check', 'Complete CI check');
    if (!ciResult.success) {
        allTestsPassed = false;
    }

    // Test 7: Test lint-staged manually
    log(`\n${colors.bold}⚡ Testing lint-staged${colors.reset}`);
    const lintStagedResult = runCommand('npm run pre-commit', 'lint-staged manual run');
    if (!lintStagedResult.success) {
        allTestsPassed = false;
    }

    // Summary
    log(`\n${colors.bold}📊 Test Summary${colors.reset}`);
    log('='.repeat(60));

    if (allTestsPassed) {
        log('🎉 All tests passed! Your setup is working correctly.', 'green');
        log('\nNext steps:');
        log('1. Create a test branch: git checkout -b test-branch');
        log('2. Make some changes and commit them');
        log('3. Push to GitHub to test CI/CD workflow');
        log('4. Check GitHub Actions tab for workflow results');
    } else {
        log('❌ Some tests failed. Please check the errors above.', 'red');
        log('\nTroubleshooting:');
        log('1. Run: npm install');
        log('2. Run: npm run prepare');
        log('3. Check file permissions');
        log('4. Review configuration files');
    }

    log(`\n${colors.bold}📚 For detailed testing instructions, see TESTING.md${colors.reset}`);
}

main().catch((error) => {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
});
