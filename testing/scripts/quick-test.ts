#!/usr/bin/env node

/**
 * Quick Test Runner for auth-flow-sim Package
 * Usage: npx tsx testing/scripts/quick-test.ts [test-type]
 * 
 * Test types:
 * - basic: Basic functionality test
 * - all: All features test
 * - interactive: Interactive mode
 * - performance: Performance test
 * - stress: Stress test
 * - help: Show help
 */

import { createAuthFlowSimulator, PredefinedFlows } from '../../src/index';

const testType = process.argv[2] || 'basic';

async function runBasicTest(): Promise<void> {
    console.log('🧪 Running Basic Test...\n');

    const simulator = createAuthFlowSimulator({ enableLogging: true, delayMs: 50 });
    await simulator.start();

    try {
        // Test login
        const login = await simulator.simulateLogin({
            email: 'user@example.com',
            password: 'password123'
        });
        console.log(login.success ? '✅ Login test passed' : '❌ Login test failed');

        // Test 2FA
        const twoFactor = await simulator.simulateLogin({
            email: 'admin@example.com',
            password: 'password123'
        });
        if (twoFactor.requires2FA) {
            const twoFactorAuth = await simulator.simulate2FA(twoFactor.user!.id, {
                code: '123456',
                method: 'totp'
            });
            console.log(twoFactorAuth.success ? '✅ 2FA test passed' : '❌ 2FA test failed');
        }

        // Test OAuth
        const oauth = await simulator.simulateOAuthCallback({
            code: 'test-code',
            state: 'test-state',
            provider: 'google'
        });
        console.log(oauth.success ? '✅ OAuth test passed' : '❌ OAuth test failed');

        // Test password reset
        const reset = await simulator.simulatePasswordResetRequest({
            email: 'user@example.com',
            redirectUrl: 'https://test.com'
        });
        console.log(reset.success ? '✅ Password reset test passed' : '❌ Password reset test failed');

        console.log('\n🎉 Basic test completed!');

    } finally {
        await simulator.stop();
    }
}

async function runAllFeaturesTest(): Promise<void> {
    console.log('🧪 Running All Features Test...\n');

    const simulator = createAuthFlowSimulator({
        enableLogging: true,
        delayMs: 10,
        config: {
            enable2FA: true,
            enablePasswordReset: true,
            enableOAuth: true,
            sessionTimeout: 5,
            maxLoginAttempts: 3,
            lockoutDuration: 1
        }
    });

    await simulator.start();

    try {
        const tests = [
            { name: 'Basic Login', test: () => simulator.simulateLogin({ email: 'user@example.com', password: 'password123' }) },
            {
                name: '2FA Login', test: async () => {
                    const login = await simulator.simulateLogin({ email: 'admin@example.com', password: 'password123' });
                    if (login.requires2FA) {
                        return await simulator.simulate2FA(login.user!.id, { code: '123456', method: 'totp' });
                    }
                    return login;
                }
            },
            { name: 'OAuth Login', test: () => simulator.simulateOAuthCallback({ code: 'test', state: 'test', provider: 'google' }) },
            {
                name: 'Password Reset', test: async () => {
                    const request = await simulator.simulatePasswordResetRequest({ email: 'user@example.com', redirectUrl: 'https://test.com' });
                    if (request.success) {
                        return await simulator.simulatePasswordResetConfirm({ token: request.token!, newPassword: 'newpass' });
                    }
                    return request;
                }
            },
            {
                name: 'Session Management', test: async () => {
                    const login = await simulator.simulateLogin({ email: 'user@example.com', password: 'password123' });
                    if (login.success && login.session) {
                        const check = await simulator.checkSession(login.session.id);
                        const logout = await simulator.simulateLogout(login.session.id);
                        return { sessionCheck: check, logout };
                    }
                    return login;
                }
            },
            { name: 'Event Tracking', test: () => ({ events: simulator.getEvents().length }) },
            { name: 'Predefined Flows', test: () => ({ flows: PredefinedFlows.getAllFlows().length }) }
        ];

        for (const { name, test } of tests) {
            try {
                const result = await test();
                const success = result.success !== false && result.events !== undefined ? true : result.success;
                console.log(`${success ? '✅' : '❌'} ${name}`);
            } catch (error: any) {
                console.log(`❌ ${name} - Error: ${error.message}`);
            }
        }

        console.log('\n🎉 All features test completed!');

    } finally {
        await simulator.stop();
    }
}

async function runPerformanceTest(): Promise<void> {
    console.log('⚡ Running Performance Test...\n');

    const simulator = createAuthFlowSimulator({ enableLogging: false, delayMs: 0 });
    await simulator.start();

    try {
        const iterations = 100;
        console.log(`🚀 Running ${iterations} operations...`);

        const startTime = Date.now();
        const operations = [];

        for (let i = 0; i < iterations; i++) {
            operations.push(simulator.simulateLogin({
                email: `user${i}@example.com`,
                password: 'password123'
            }));
        }

        const results = await Promise.all(operations);
        const endTime = Date.now();
        const duration = endTime - startTime;

        const successCount = results.filter(r => r.success).length;
        const avgTime = duration / iterations;

        console.log(`✅ Completed ${iterations} operations in ${duration}ms`);
        console.log(`📊 Success rate: ${successCount}/${iterations} (${((successCount / iterations) * 100).toFixed(1)}%)`);
        console.log(`⏱️  Average time: ${avgTime.toFixed(2)}ms per operation`);
        console.log(`🚀 Operations per second: ${(1000 / avgTime).toFixed(0)}`);

    } finally {
        await simulator.stop();
    }
}

async function runStressTest(): Promise<void> {
    console.log('💪 Running Stress Test...\n');

    const simulator = createAuthFlowSimulator({ enableLogging: false, delayMs: 0 });
    await simulator.start();

    try {
        const concurrentUsers = 50;
        const operationsPerUser = 10;

        console.log(`🚀 Testing ${concurrentUsers} concurrent users with ${operationsPerUser} operations each...`);

        const startTime = Date.now();
        const userPromises = [];

        for (let user = 0; user < concurrentUsers; user++) {
            const userPromise = (async () => {
                const results = [];
                for (let op = 0; op < operationsPerUser; op++) {
                    try {
                        const result = await simulator.simulateLogin({
                            email: `user${user}@example.com`,
                            password: 'password123'
                        });
                        results.push(result);
                    } catch (error: any) {
                        results.push({ success: false, error: error.message });
                    }
                }
                return results;
            })();
            userPromises.push(userPromise);
        }

        const allResults = await Promise.all(userPromises);
        const endTime = Date.now();
        const duration = endTime - startTime;

        const totalOperations = concurrentUsers * operationsPerUser;
        const successCount = allResults.flat().filter(r => r.success).length;
        const avgTime = duration / totalOperations;

        console.log(`✅ Completed ${totalOperations} operations in ${duration}ms`);
        console.log(`📊 Success rate: ${successCount}/${totalOperations} (${((successCount / totalOperations) * 100).toFixed(1)}%)`);
        console.log(`⏱️  Average time: ${avgTime.toFixed(2)}ms per operation`);
        console.log(`🚀 Operations per second: ${(1000 / avgTime).toFixed(0)}`);

    } finally {
        await simulator.stop();
    }
}

function showHelp(): void {
    console.log(`
🧪 Auth Flow Simulator - Quick Test Runner

Usage: npx tsx testing/scripts/quick-test.ts [test-type]

Available test types:
  basic       - Basic functionality test (default)
  all         - All features comprehensive test
  interactive - Interactive testing mode
  performance - Performance benchmark test
  stress      - Stress test with concurrent users
  help        - Show this help message

Examples:
  npx tsx testing/scripts/quick-test.ts basic
  npx tsx testing/scripts/quick-test.ts all
  npx tsx testing/scripts/quick-test.ts performance
  npx tsx testing/scripts/quick-test.ts stress

For interactive testing, run:
  npx tsx testing/interactive/interactive-test.ts
`);
}

// Main execution
switch (testType) {
    case 'basic':
        runBasicTest().catch(console.error);
        break;
    case 'all':
        runAllFeaturesTest().catch(console.error);
        break;
    case 'interactive':
        console.log('🔄 Starting interactive mode...');
        console.log('Run: npx tsx testing/interactive/interactive-test.ts');
        break;
    case 'performance':
        runPerformanceTest().catch(console.error);
        break;
    case 'stress':
        runStressTest().catch(console.error);
        break;
    case 'help':
        showHelp();
        break;
    default:
        console.log(`❌ Unknown test type: ${testType}`);
        showHelp();
}
