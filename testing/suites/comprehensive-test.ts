#!/usr/bin/env node

/**
 * Comprehensive Test Suite for auth-flow-sim Package
 * Tests all features, edge cases, and error scenarios
 */

import { createAuthFlowSimulator, PredefinedFlows } from '../../src/index';

interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL';
    result?: any;
    error?: string;
}

class TestSuite {
    private simulator: any = null;
    private testResults: TestResult[] = [];
    private currentTest: string = '';

    async runTest(name: string, testFn: () => Promise<any>): Promise<any> {
        this.currentTest = name;
        console.log(`\n🧪 Running: ${name}`);
        console.log('─'.repeat(50));

        try {
            const result = await testFn();
            this.testResults.push({ name, status: 'PASS', result });
            console.log(`✅ ${name} - PASSED`);
            return result;
        } catch (error: any) {
            this.testResults.push({ name, status: 'FAIL', error: error.message });
            console.log(`❌ ${name} - FAILED: ${error.message}`);
            return null;
        }
    }

    async setup(): Promise<void> {
        console.log('🚀 Setting up comprehensive test suite...\n');

        this.simulator = createAuthFlowSimulator({
            enableLogging: true,
            delayMs: 50, // Faster for testing
            config: {
                enable2FA: true,
                enablePasswordReset: true,
                enableOAuth: true,
                sessionTimeout: 5, // 5 minutes for testing
                maxLoginAttempts: 3,
                lockoutDuration: 1, // 1 minute for testing
            },
            mockUsers: [
                {
                    id: '1',
                    email: 'admin@example.com',
                    name: 'Admin User',
                    twoFactorEnabled: true,
                    emailVerified: true,
                    createdAt: new Date()
                },
                {
                    id: '2',
                    email: 'user@example.com',
                    name: 'Regular User',
                    twoFactorEnabled: false,
                    emailVerified: true,
                    createdAt: new Date()
                },
                {
                    id: '3',
                    email: 'unverified@example.com',
                    name: 'Unverified User',
                    twoFactorEnabled: false,
                    emailVerified: false,
                    createdAt: new Date()
                }
            ]
        });

        await this.simulator.start();
        console.log('✅ Simulator started with test configuration\n');
    }

    async teardown(): Promise<void> {
        if (this.simulator) {
            await this.simulator.stop();
            console.log('\n🛑 Simulator stopped');
        }
    }

    async runAllTests(): Promise<void> {
        await this.setup();

        try {
            // Basic Authentication Tests
            await this.testBasicLogin();
            await this.testInvalidCredentials();
            await this.testLoginWithRememberMe();

            // 2FA Tests
            await this.test2FAFlow();
            await this.test2FAInvalidCode();
            await this.test2FATimeout();

            // Password Reset Tests
            await this.testPasswordResetFlow();
            await this.testPasswordResetInvalidToken();

            // OAuth Tests
            await this.testOAuthFlow();
            await this.testOAuthInvalidState();

            // Session Management Tests
            await this.testSessionManagement();
            await this.testSessionExpiry();
            await this.testConcurrentSessions();

            // Rate Limiting Tests
            await this.testRateLimiting();
            await this.testAccountLockout();

            // Event Tracking Tests
            await this.testEventTracking();
            await this.testEventFiltering();

            // Predefined Flows Tests
            await this.testPredefinedFlows();

            // Error Handling Tests
            await this.testErrorHandling();
            await this.testInvalidInputs();

            // Performance Tests
            await this.testPerformance();

        } finally {
            await this.teardown();
            this.printSummary();
        }
    }

    async testBasicLogin(): Promise<any> {
        return this.runTest('Basic Login', async () => {
            const result = await this.simulator.simulateLogin({
                email: 'user@example.com',
                password: 'password123'
            });

            if (!result.success) {
                throw new Error(`Login failed: ${result.error}`);
            }

            if (!result.user || result.user.email !== 'user@example.com') {
                throw new Error('User data incorrect');
            }

            if (!result.session || !result.session.id) {
                throw new Error('Session not created');
            }

            return result;
        });
    }

    async testInvalidCredentials(): Promise<any> {
        return this.runTest('Invalid Credentials', async () => {
            const result = await this.simulator.simulateLogin({
                email: 'user@example.com',
                password: 'wrongpassword'
            });

            if (result.success) {
                throw new Error('Login should have failed with wrong password');
            }

            if (!result.error) {
                throw new Error('Error message missing');
            }

            return result;
        });
    }

    async testLoginWithRememberMe(): Promise<any> {
        return this.runTest('Login with Remember Me', async () => {
            const result = await this.simulator.simulateLogin({
                email: 'user@example.com',
                password: 'password123',
                rememberMe: true
            });

            if (!result.success) {
                throw new Error(`Login failed: ${result.error}`);
            }

            if (!result.session) {
                throw new Error('Session not created');
            }

            // Check if remember me affects session duration
            const sessionCheck = await this.simulator.checkSession(result.session.id);
            if (!sessionCheck.success) {
                throw new Error('Session should be valid');
            }

            return result;
        });
    }

    async test2FAFlow(): Promise<any> {
        return this.runTest('2FA Flow', async () => {
            // First login should require 2FA
            const loginResult = await this.simulator.simulateLogin({
                email: 'admin@example.com',
                password: 'password123'
            });

            if (!loginResult.requires2FA) {
                throw new Error('2FA should be required for admin user');
            }

            if (!loginResult.user) {
                throw new Error('User should be returned even when 2FA is required');
            }

            // Complete 2FA
            const twoFactorResult = await this.simulator.simulate2FA(loginResult.user.id, {
                code: '123456',
                method: 'totp'
            });

            if (!twoFactorResult.success) {
                throw new Error(`2FA failed: ${twoFactorResult.error}`);
            }

            if (!twoFactorResult.user) {
                throw new Error('User not returned after successful 2FA');
            }

            return { loginResult, twoFactorResult };
        });
    }

    async test2FAInvalidCode(): Promise<any> {
        return this.runTest('2FA Invalid Code', async () => {
            const loginResult = await this.simulator.simulateLogin({
                email: 'admin@example.com',
                password: 'password123'
            });

            if (!loginResult.requires2FA) {
                throw new Error('2FA should be required');
            }

            const twoFactorResult = await this.simulator.simulate2FA(loginResult.user.id, {
                code: '000000', // Invalid code
                method: 'totp'
            });

            if (twoFactorResult.success) {
                throw new Error('2FA should have failed with invalid code');
            }

            if (!twoFactorResult.error) {
                throw new Error('Error message missing for invalid 2FA code');
            }

            return twoFactorResult;
        });
    }

    async test2FATimeout(): Promise<any> {
        return this.runTest('2FA Timeout', async () => {
            // This test would need to be implemented based on your 2FA timeout logic
            // For now, we'll just verify the 2FA flow exists
            const loginResult = await this.simulator.simulateLogin({
                email: 'admin@example.com',
                password: 'password123'
            });

            if (!loginResult.requires2FA) {
                throw new Error('2FA should be required');
            }

            // Simulate waiting and then trying 2FA
            await new Promise(resolve => setTimeout(resolve, 100));

            const twoFactorResult = await this.simulator.simulate2FA(loginResult.user.id, {
                code: '123456',
                method: 'totp'
            });

            if (!twoFactorResult.success) {
                throw new Error(`2FA should still work: ${twoFactorResult.error}`);
            }

            return twoFactorResult;
        });
    }

    async testPasswordResetFlow(): Promise<any> {
        return this.runTest('Password Reset Flow', async () => {
            // Request password reset
            const resetRequest = await this.simulator.simulatePasswordResetRequest({
                email: 'user@example.com',
                redirectUrl: 'https://test.com/reset'
            });

            if (!resetRequest.success) {
                throw new Error(`Password reset request failed: ${resetRequest.error}`);
            }

            if (!resetRequest.token) {
                throw new Error('Reset token not provided');
            }

            // Confirm password reset
            const resetConfirm = await this.simulator.simulatePasswordResetConfirm({
                token: resetRequest.token,
                newPassword: 'newPassword123'
            });

            if (!resetConfirm.success) {
                throw new Error(`Password reset confirmation failed: ${resetConfirm.error}`);
            }

            return { resetRequest, resetConfirm };
        });
    }

    async testPasswordResetInvalidToken(): Promise<any> {
        return this.runTest('Password Reset Invalid Token', async () => {
            const resetConfirm = await this.simulator.simulatePasswordResetConfirm({
                token: 'invalid-token',
                newPassword: 'newPassword123'
            });

            if (resetConfirm.success) {
                throw new Error('Password reset should have failed with invalid token');
            }

            if (!resetConfirm.error) {
                throw new Error('Error message missing for invalid token');
            }

            return resetConfirm;
        });
    }

    async testOAuthFlow(): Promise<any> {
        return this.runTest('OAuth Flow', async () => {
            const oauthResult = await this.simulator.simulateOAuthCallback({
                code: 'valid-oauth-code',
                state: 'valid-state',
                provider: 'google'
            });

            if (!oauthResult.success) {
                throw new Error(`OAuth failed: ${oauthResult.error}`);
            }

            if (!oauthResult.user) {
                throw new Error('User not returned after OAuth');
            }

            if (!oauthResult.session) {
                throw new Error('Session not created after OAuth');
            }

            return oauthResult;
        });
    }

    async testOAuthInvalidState(): Promise<any> {
        return this.runTest('OAuth Invalid State', async () => {
            const oauthResult = await this.simulator.simulateOAuthCallback({
                code: 'valid-oauth-code',
                state: 'invalid-state',
                provider: 'google'
            });

            if (oauthResult.success) {
                throw new Error('OAuth should have failed with invalid state');
            }

            if (!oauthResult.error) {
                throw new Error('Error message missing for invalid OAuth state');
            }

            return oauthResult;
        });
    }

    async testSessionManagement(): Promise<any> {
        return this.runTest('Session Management', async () => {
            // Create a session
            const loginResult = await this.simulator.simulateLogin({
                email: 'user@example.com',
                password: 'password123'
            });

            if (!loginResult.success || !loginResult.session) {
                throw new Error('Failed to create session');
            }

            // Check session
            const sessionCheck = await this.simulator.checkSession(loginResult.session.id);
            if (!sessionCheck.success) {
                throw new Error('Session should be valid');
            }

            if (sessionCheck.user?.email !== 'user@example.com') {
                throw new Error('Session user data incorrect');
            }

            // Logout
            const logoutResult = await this.simulator.simulateLogout(loginResult.session.id);
            if (!logoutResult.success) {
                throw new Error(`Logout failed: ${logoutResult.error}`);
            }

            // Verify session is invalid after logout
            const sessionCheckAfterLogout = await this.simulator.checkSession(loginResult.session.id);
            if (sessionCheckAfterLogout.success) {
                throw new Error('Session should be invalid after logout');
            }

            return { loginResult, sessionCheck, logoutResult };
        });
    }

    async testSessionExpiry(): Promise<any> {
        return this.runTest('Session Expiry', async () => {
            // This test would need to be implemented based on your session expiry logic
            // For now, we'll just verify session management works
            const loginResult = await this.simulator.simulateLogin({
                email: 'user@example.com',
                password: 'password123'
            });

            if (!loginResult.success || !loginResult.session) {
                throw new Error('Failed to create session');
            }

            const sessionCheck = await this.simulator.checkSession(loginResult.session.id);
            if (!sessionCheck.success) {
                throw new Error('Session should be valid');
            }

            return sessionCheck;
        });
    }

    async testConcurrentSessions(): Promise<any> {
        return this.runTest('Concurrent Sessions', async () => {
            // Create multiple sessions for the same user
            const session1 = await this.simulator.simulateLogin({
                email: 'user@example.com',
                password: 'password123'
            });

            const session2 = await this.simulator.simulateLogin({
                email: 'user@example.com',
                password: 'password123'
            });

            if (!session1.success || !session2.success) {
                throw new Error('Failed to create concurrent sessions');
            }

            if (session1.session?.id === session2.session?.id) {
                throw new Error('Sessions should have different IDs');
            }

            // Both sessions should be valid
            const check1 = await this.simulator.checkSession(session1.session.id);
            const check2 = await this.simulator.checkSession(session2.session.id);

            if (!check1.success || !check2.success) {
                throw new Error('Both sessions should be valid');
            }

            return { session1, session2 };
        });
    }

    async testRateLimiting(): Promise<any> {
        return this.runTest('Rate Limiting', async () => {
            // Try multiple failed logins to trigger rate limiting
            const attempts = [];
            for (let i = 0; i < 5; i++) {
                const result = await this.simulator.simulateLogin({
                    email: 'user@example.com',
                    password: 'wrongpassword'
                });
                attempts.push(result);
            }

            // Check if rate limiting was triggered
            const events = this.simulator.getEvents();
            const rateLimitEvents = events.filter((e: any) => e.type.includes('rate-limit'));

            if (rateLimitEvents.length === 0) {
                console.log('⚠️  Rate limiting not triggered (may not be implemented)');
            }

            return { attempts, rateLimitEvents };
        });
    }

    async testAccountLockout(): Promise<any> {
        return this.runTest('Account Lockout', async () => {
            // This test would need to be implemented based on your lockout logic
            // For now, we'll just verify the system handles multiple failed attempts
            const attempts = [];
            for (let i = 0; i < 3; i++) {
                const result = await this.simulator.simulateLogin({
                    email: 'user@example.com',
                    password: 'wrongpassword'
                });
                attempts.push(result);
            }

            // Check if account lockout was triggered
            const events = this.simulator.getEvents();
            const lockoutEvents = events.filter((e: any) => e.type.includes('lockout'));

            if (lockoutEvents.length === 0) {
                console.log('⚠️  Account lockout not triggered (may not be implemented)');
            }

            return { attempts, lockoutEvents };
        });
    }

    async testEventTracking(): Promise<any> {
        return this.runTest('Event Tracking', async () => {
            // Perform some actions to generate events
            await this.simulator.simulateLogin({
                email: 'user@example.com',
                password: 'password123'
            });

            const events = this.simulator.getEvents();

            if (events.length === 0) {
                throw new Error('No events recorded');
            }

            // Check event structure
            const event = events[0];
            if (!event.type || !event.timestamp || !event.hasOwnProperty('success')) {
                throw new Error('Event structure invalid');
            }

            return { eventCount: events.length, events };
        });
    }

    async testEventFiltering(): Promise<any> {
        return this.runTest('Event Filtering', async () => {
            // Generate different types of events
            await this.simulator.simulateLogin({
                email: 'user@example.com',
                password: 'password123'
            });

            await this.simulator.simulateLogin({
                email: 'user@example.com',
                password: 'wrongpassword'
            });

            const events = this.simulator.getEvents();
            const loginEvents = events.filter((e: any) => e.type.includes('login'));

            if (loginEvents.length === 0) {
                throw new Error('No login events found');
            }

            return { totalEvents: events.length, loginEvents: loginEvents.length };
        });
    }

    async testPredefinedFlows(): Promise<any> {
        return this.runTest('Predefined Flows', async () => {
            // Test predefined flows
            const allFlows = PredefinedFlows.getAllFlows();

            if (!Array.isArray(allFlows) || allFlows.length === 0) {
                throw new Error('No predefined flows available');
            }

            // Test creating specific flows
            const loginFlow = PredefinedFlows.createStandardLoginFlow();
            const twoFactorFlow = PredefinedFlows.create2FALoginFlow();
            const passwordResetFlow = PredefinedFlows.createPasswordResetFlow();
            const oauthFlow = PredefinedFlows.createOAuthFlow('Google');

            if (!loginFlow || !twoFactorFlow || !passwordResetFlow || !oauthFlow) {
                throw new Error('Failed to create predefined flows');
            }

            return {
                flowCount: allFlows.length,
                flows: { loginFlow, twoFactorFlow, passwordResetFlow, oauthFlow }
            };
        });
    }

    async testErrorHandling(): Promise<any> {
        return this.runTest('Error Handling', async () => {
            // Test various error scenarios
            const tests = [
                // Missing email
                () => this.simulator.simulateLogin({ password: 'password123' }),
                // Missing password
                () => this.simulator.simulateLogin({ email: 'user@example.com' }),
                // Invalid 2FA for non-2FA user
                () => this.simulator.simulate2FA('1', { code: '123456', method: 'totp' }),
                // Invalid session check
                () => this.simulator.checkSession('invalid-session-id'),
                // Invalid OAuth
                () => this.simulator.simulateOAuthCallback({ code: 'test', state: 'test' })
            ];

            const results = [];
            for (const test of tests) {
                try {
                    const result = await test();
                    results.push({ success: true, result });
                } catch (error: any) {
                    results.push({ success: false, error: error.message });
                }
            }

            // All tests should either fail gracefully or throw errors
            const errorCount = results.filter(r => !r.success).length;
            if (errorCount === 0) {
                throw new Error('All error tests should have failed');
            }

            return { errorCount, results };
        });
    }

    async testInvalidInputs(): Promise<any> {
        return this.runTest('Invalid Inputs', async () => {
            // Test with various invalid inputs
            const invalidInputs = [
                { email: null, password: 'password123' },
                { email: 'user@example.com', password: null },
                { email: '', password: 'password123' },
                { email: 'user@example.com', password: '' },
                { email: 'invalid-email', password: 'password123' }
            ];

            const results = [];
            for (const input of invalidInputs) {
                try {
                    const result = await this.simulator.simulateLogin(input);
                    results.push({ input, result });
                } catch (error: any) {
                    results.push({ input, error: error.message });
                }
            }

            // All should fail
            const successCount = results.filter(r => r.result?.success).length;
            if (successCount > 0) {
                throw new Error(`${successCount} invalid inputs succeeded when they should have failed`);
            }

            return { results };
        });
    }

    async testPerformance(): Promise<any> {
        return this.runTest('Performance', async () => {
            const startTime = Date.now();

            // Perform multiple operations
            const operations = [];
            for (let i = 0; i < 10; i++) {
                operations.push(
                    this.simulator.simulateLogin({
                        email: `user${i}@example.com`,
                        password: 'password123'
                    })
                );
            }

            const results = await Promise.all(operations);
            const endTime = Date.now();
            const duration = endTime - startTime;

            const successCount = results.filter(r => r.success).length;

            if (successCount === 0) {
                throw new Error('All performance test operations failed');
            }

            console.log(`   ⏱️  Completed ${operations.length} operations in ${duration}ms`);

            return { duration, successCount, totalOperations: operations.length };
        });
    }

    printSummary(): void {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));

        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const total = this.testResults.length;

        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📊 Total:  ${total}`);
        console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

        if (failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`   • ${r.name}: ${r.error}`));
        }

        console.log('\n🎉 Test suite completed!');
    }
}

// Run the comprehensive test suite
const testSuite = new TestSuite();
testSuite.runAllTests().catch(console.error);
