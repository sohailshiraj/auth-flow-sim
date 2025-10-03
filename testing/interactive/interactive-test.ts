#!/usr/bin/env node

/**
 * Interactive Test Interface for auth-flow-sim Package
 * Run this to test features interactively without creating separate applications
 */

import { createAuthFlowSimulator, PredefinedFlows } from '../../src/index';
import { createInterface } from 'readline';

class InteractiveTester {
    private simulator: any = null;
    private rl: any = null;

    constructor() {
        this.rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start(): Promise<void> {
        console.log('🚀 Interactive Auth Flow Simulator Tester');
        console.log('==========================================\n');

        // Initialize simulator
        this.simulator = createAuthFlowSimulator({
            enableLogging: true,
            delayMs: 100,
            config: {
                enable2FA: true,
                enablePasswordReset: true,
                enableOAuth: true,
                sessionTimeout: 30,
                maxLoginAttempts: 5,
                lockoutDuration: 15,
            }
        });

        await this.simulator.start();
        console.log('✅ Simulator initialized and started\n');

        this.showMenu();
    }

    showMenu(): void {
        console.log('\n📋 Available Tests:');
        console.log('1.  Basic Login Test');
        console.log('2.  2FA Flow Test');
        console.log('3.  Password Reset Test');
        console.log('4.  OAuth Flow Test');
        console.log('5.  Session Management Test');
        console.log('6.  Event Tracking Test');
        console.log('7.  Predefined Flows Test');
        console.log('8.  Error Handling Test');
        console.log('9.  Performance Test');
        console.log('10. Custom Test');
        console.log('11. Show Simulator State');
        console.log('12. Show All Events');
        console.log('13. Clear Events');
        console.log('14. Reset Simulator');
        console.log('0.  Exit');
        console.log('─'.repeat(40));

        this.rl.question('Select a test (0-14): ', (answer: string) => {
            this.handleSelection(answer.trim());
        });
    }

    async handleSelection(choice: string): Promise<void> {
        switch (choice) {
            case '1':
                await this.testBasicLogin();
                break;
            case '2':
                await this.test2FAFlow();
                break;
            case '3':
                await this.testPasswordReset();
                break;
            case '4':
                await this.testOAuthFlow();
                break;
            case '5':
                await this.testSessionManagement();
                break;
            case '6':
                await this.testEventTracking();
                break;
            case '7':
                await this.testPredefinedFlows();
                break;
            case '8':
                await this.testErrorHandling();
                break;
            case '9':
                await this.testPerformance();
                break;
            case '10':
                await this.testCustom();
                break;
            case '11':
                this.showSimulatorState();
                break;
            case '12':
                this.showAllEvents();
                break;
            case '13':
                this.clearEvents();
                break;
            case '14':
                await this.resetSimulator();
                break;
            case '0':
                this.exit();
                break;
            default:
                console.log('❌ Invalid selection. Please try again.');
                this.showMenu();
        }
    }

    async testBasicLogin(): Promise<void> {
        console.log('\n🔐 Testing Basic Login...');
        console.log('─'.repeat(30));

        try {
            const result = await this.simulator.simulateLogin({
                email: 'user@example.com',
                password: 'password123',
                rememberMe: true
            });

            if (result.success) {
                console.log('✅ Login successful!');
                console.log(`👤 User: ${result.user?.name} (${result.user?.email})`);
                console.log(`🔑 Session ID: ${result.session?.id}`);
                console.log(`⏰ Session expires: ${result.session?.expiresAt}`);
            } else {
                console.log('❌ Login failed:', result.error);
            }

            this.showMenu();
        } catch (error: any) {
            console.log('❌ Test error:', error.message);
            this.showMenu();
        }
    }

    async test2FAFlow(): Promise<void> {
        console.log('\n🔐 Testing 2FA Flow...');
        console.log('─'.repeat(30));

        try {
            // First login (should require 2FA for admin)
            const loginResult = await this.simulator.simulateLogin({
                email: 'admin@example.com',
                password: 'password123'
            });

            if (loginResult.requires2FA) {
                console.log('🔐 2FA required for admin user');
                console.log(`👤 User: ${loginResult.user?.name}`);

                const twoFactorResult = await this.simulator.simulate2FA(loginResult.user.id, {
                    code: '123456',
                    method: 'totp'
                });

                if (twoFactorResult.success) {
                    console.log('✅ 2FA successful!');
                    console.log(`👤 User: ${twoFactorResult.user?.name}`);
                    console.log(`🔑 Session ID: ${twoFactorResult.session?.id}`);
                } else {
                    console.log('❌ 2FA failed:', twoFactorResult.error);
                }
            } else {
                console.log('⚠️  2FA not required (unexpected)');
            }

            this.showMenu();
        } catch (error: any) {
            console.log('❌ Test error:', error.message);
            this.showMenu();
        }
    }

    async testPasswordReset(): Promise<void> {
        console.log('\n🔄 Testing Password Reset...');
        console.log('─'.repeat(30));

        try {
            // Request password reset
            const resetRequest = await this.simulator.simulatePasswordResetRequest({
                email: 'user@example.com',
                redirectUrl: 'https://test.com/reset'
            });

            if (resetRequest.success) {
                console.log('✅ Password reset request successful');
                console.log(`📧 Reset token: ${resetRequest.token}`);
                console.log(`📧 Email sent to: ${resetRequest.email}`);

                // Confirm password reset
                const resetConfirm = await this.simulator.simulatePasswordResetConfirm({
                    token: resetRequest.token,
                    newPassword: 'newPassword123'
                });

                if (resetConfirm.success) {
                    console.log('✅ Password reset confirmation successful');
                } else {
                    console.log('❌ Password reset confirmation failed:', resetConfirm.error);
                }
            } else {
                console.log('❌ Password reset request failed:', resetRequest.error);
            }

            this.showMenu();
        } catch (error: any) {
            console.log('❌ Test error:', error.message);
            this.showMenu();
        }
    }

    async testOAuthFlow(): Promise<void> {
        console.log('\n🔗 Testing OAuth Flow...');
        console.log('─'.repeat(30));

        try {
            const oauthResult = await this.simulator.simulateOAuthCallback({
                code: 'oauth-code-123',
                state: 'random-state',
                provider: 'google'
            });

            if (oauthResult.success) {
                console.log('✅ OAuth login successful!');
                console.log(`👤 User: ${oauthResult.user?.name} (${oauthResult.user?.email})`);
                console.log(`🔑 Session ID: ${oauthResult.session?.id}`);
                console.log(`🔗 Provider: ${oauthResult.provider}`);
            } else {
                console.log('❌ OAuth login failed:', oauthResult.error);
            }

            this.showMenu();
        } catch (error: any) {
            console.log('❌ Test error:', error.message);
            this.showMenu();
        }
    }

    async testSessionManagement(): Promise<void> {
        console.log('\n🔑 Testing Session Management...');
        console.log('─'.repeat(30));

        try {
            // Create a session
            const loginResult = await this.simulator.simulateLogin({
                email: 'user@example.com',
                password: 'password123'
            });

            if (loginResult.success && loginResult.session) {
                console.log('✅ Session created');
                console.log(`🔑 Session ID: ${loginResult.session.id}`);

                // Check session
                const sessionCheck = await this.simulator.checkSession(loginResult.session.id);
                if (sessionCheck.success) {
                    console.log('✅ Session is valid');
                    console.log(`👤 User: ${sessionCheck.user?.name}`);
                } else {
                    console.log('❌ Session check failed:', sessionCheck.error);
                }

                // Logout
                const logoutResult = await this.simulator.simulateLogout(loginResult.session.id);
                if (logoutResult.success) {
                    console.log('✅ Logout successful');
                } else {
                    console.log('❌ Logout failed:', logoutResult.error);
                }

                // Verify session is invalid after logout
                const sessionCheckAfterLogout = await this.simulator.checkSession(loginResult.session.id);
                if (!sessionCheckAfterLogout.success) {
                    console.log('✅ Session properly invalidated after logout');
                } else {
                    console.log('❌ Session still valid after logout (unexpected)');
                }
            } else {
                console.log('❌ Failed to create session');
            }

            this.showMenu();
        } catch (error: any) {
            console.log('❌ Test error:', error.message);
            this.showMenu();
        }
    }

    async testEventTracking(): Promise<void> {
        console.log('\n📊 Testing Event Tracking...');
        console.log('─'.repeat(30));

        try {
            const events = this.simulator.getEvents();
            console.log(`📊 Total events: ${events.length}`);

            if (events.length > 0) {
                // Show event breakdown
                const eventTypes = events.reduce((acc: any, event: any) => {
                    acc[event.type] = (acc[event.type] || 0) + 1;
                    return acc;
                }, {});

                console.log('\n📈 Event breakdown:');
                Object.entries(eventTypes).forEach(([type, count]) => {
                    console.log(`   ${type}: ${count}`);
                });

                // Show recent events
                console.log('\n📋 Recent events:');
                events.slice(-5).forEach((event: any, index: number) => {
                    const timestamp = new Date(event.timestamp).toLocaleTimeString();
                    console.log(`   ${index + 1}. [${timestamp}] ${event.type} - ${event.success ? '✅' : '❌'}`);
                });
            } else {
                console.log('⚠️  No events recorded yet');
            }

            this.showMenu();
        } catch (error: any) {
            console.log('❌ Test error:', error.message);
            this.showMenu();
        }
    }

    async testPredefinedFlows(): Promise<void> {
        console.log('\n🎯 Testing Predefined Flows...');
        console.log('─'.repeat(30));

        try {
            // Get all flows
            const allFlows = PredefinedFlows.getAllFlows();
            console.log(`📋 Available flows: ${allFlows.length}`);

            // Test specific flows
            const flows = {
                'Standard Login': PredefinedFlows.createStandardLoginFlow(),
                '2FA Login': PredefinedFlows.create2FALoginFlow(),
                'Password Reset': PredefinedFlows.createPasswordResetFlow(),
                'Google OAuth': PredefinedFlows.createOAuthFlow('Google'),
                'GitHub OAuth': PredefinedFlows.createOAuthFlow('GitHub')
            };

            console.log('\n🔧 Created flows:');
            Object.entries(flows).forEach(([name, flow]) => {
                if (flow) {
                    console.log(`   ✅ ${name}: ${flow.name || 'Unnamed'}`);
                } else {
                    console.log(`   ❌ ${name}: Failed to create`);
                }
            });

            this.showMenu();
        } catch (error: any) {
            console.log('❌ Test error:', error.message);
            this.showMenu();
        }
    }

    async testErrorHandling(): Promise<void> {
        console.log('\n⚠️  Testing Error Handling...');
        console.log('─'.repeat(30));

        try {
            const errorTests = [
                {
                    name: 'Invalid credentials',
                    test: () => this.simulator.simulateLogin({
                        email: 'user@example.com',
                        password: 'wrongpassword'
                    })
                },
                {
                    name: 'Missing email',
                    test: () => this.simulator.simulateLogin({
                        password: 'password123'
                    })
                },
                {
                    name: 'Invalid 2FA code',
                    test: () => this.simulator.simulate2FA('1', {
                        code: '000000',
                        method: 'totp'
                    })
                },
                {
                    name: 'Invalid session check',
                    test: () => this.simulator.checkSession('invalid-session-id')
                },
                {
                    name: 'Invalid OAuth state',
                    test: () => this.simulator.simulateOAuthCallback({
                        code: 'test',
                        state: 'invalid-state',
                        provider: 'google'
                    })
                }
            ];

            console.log('🧪 Running error tests...\n');

            for (const { name, test } of errorTests) {
                try {
                    const result = await test();
                    if (result.success) {
                        console.log(`   ⚠️  ${name}: Should have failed but succeeded`);
                    } else {
                        console.log(`   ✅ ${name}: Failed as expected - ${result.error}`);
                    }
                } catch (error: any) {
                    console.log(`   ✅ ${name}: Threw error as expected - ${error.message}`);
                }
            }

            this.showMenu();
        } catch (error: any) {
            console.log('❌ Test error:', error.message);
            this.showMenu();
        }
    }

    async testPerformance(): Promise<void> {
        console.log('\n⚡ Testing Performance...');
        console.log('─'.repeat(30));

        try {
            const iterations = 10;
            console.log(`🚀 Running ${iterations} login operations...`);

            const startTime = Date.now();
            const operations = [];

            for (let i = 0; i < iterations; i++) {
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
            const avgTime = duration / iterations;

            console.log(`✅ Completed ${iterations} operations in ${duration}ms`);
            console.log(`📊 Success rate: ${successCount}/${iterations} (${((successCount / iterations) * 100).toFixed(1)}%)`);
            console.log(`⏱️  Average time per operation: ${avgTime.toFixed(2)}ms`);

            this.showMenu();
        } catch (error: any) {
            console.log('❌ Test error:', error.message);
            this.showMenu();
        }
    }

    async testCustom(): Promise<void> {
        console.log('\n🎨 Custom Test...');
        console.log('─'.repeat(30));
        console.log('Enter custom test parameters:');

        this.rl.question('Email: ', async (email: string) => {
            this.rl.question('Password: ', async (password: string) => {
                this.rl.question('Remember me? (y/n): ', async (rememberMe: string) => {
                    try {
                        const result = await this.simulator.simulateLogin({
                            email: email || 'user@example.com',
                            password: password || 'password123',
                            rememberMe: rememberMe.toLowerCase() === 'y'
                        });

                        if (result.success) {
                            console.log('✅ Custom login successful!');
                            console.log(`👤 User: ${result.user?.name}`);
                            console.log(`🔑 Session: ${result.session?.id}`);
                        } else {
                            console.log('❌ Custom login failed:', result.error);
                        }

                        this.showMenu();
                    } catch (error: any) {
                        console.log('❌ Custom test error:', error.message);
                        this.showMenu();
                    }
                });
            });
        });
    }

    showSimulatorState(): void {
        console.log('\n📊 Simulator State...');
        console.log('─'.repeat(30));

        try {
            const state = this.simulator.getState();
            console.log(`👥 Users: ${state.users.length}`);
            console.log(`🔑 Sessions: ${state.sessions.length}`);
            console.log(`📊 Events: ${state.events.length}`);
            console.log(`🔄 Running: ${state.isRunning ? 'Yes' : 'No'}`);

            if (state.users.length > 0) {
                console.log('\n👤 Users:');
                state.users.forEach((user: any, index: number) => {
                    console.log(`   ${index + 1}. ${user.name} (${user.email}) - 2FA: ${user.twoFactorEnabled ? 'Yes' : 'No'}`);
                });
            }

            if (state.sessions.length > 0) {
                console.log('\n🔑 Active Sessions:');
                state.sessions.forEach((session: any, index: number) => {
                    const expiresAt = new Date(session.expiresAt).toLocaleString();
                    console.log(`   ${index + 1}. ${session.id} - Expires: ${expiresAt}`);
                });
            }

            this.showMenu();
        } catch (error: any) {
            console.log('❌ Error getting state:', error.message);
            this.showMenu();
        }
    }

    showAllEvents(): void {
        console.log('\n📋 All Events...');
        console.log('─'.repeat(30));

        try {
            const events = this.simulator.getEvents();

            if (events.length === 0) {
                console.log('⚠️  No events recorded');
            } else {
                events.forEach((event: any, index: number) => {
                    const timestamp = new Date(event.timestamp).toLocaleString();
                    const status = event.success ? '✅' : '❌';
                    console.log(`${index + 1}. [${timestamp}] ${status} ${event.type}`);

                    if (event.user) {
                        console.log(`   👤 User: ${event.user.name} (${event.user.email})`);
                    }
                    if (event.session) {
                        console.log(`   🔑 Session: ${event.session.id}`);
                    }
                    if (event.error) {
                        console.log(`   ❌ Error: ${event.error}`);
                    }
                    console.log('');
                });
            }

            this.showMenu();
        } catch (error: any) {
            console.log('❌ Error getting events:', error.message);
            this.showMenu();
        }
    }

    clearEvents(): void {
        console.log('\n🗑️  Clearing Events...');
        console.log('─'.repeat(30));

        try {
            // Note: This would need to be implemented in your simulator
            // For now, we'll just show a message
            console.log('⚠️  Event clearing not implemented in simulator');
            console.log('💡 Consider adding a clearEvents() method to your simulator');

            this.showMenu();
        } catch (error: any) {
            console.log('❌ Error clearing events:', error.message);
            this.showMenu();
        }
    }

    async resetSimulator(): Promise<void> {
        console.log('\n🔄 Resetting Simulator...');
        console.log('─'.repeat(30));

        try {
            await this.simulator.stop();
            await this.simulator.start();
            console.log('✅ Simulator reset successfully');

            this.showMenu();
        } catch (error: any) {
            console.log('❌ Error resetting simulator:', error.message);
            this.showMenu();
        }
    }

    async exit(): Promise<void> {
        console.log('\n👋 Exiting Interactive Tester...');

        if (this.simulator) {
            await this.simulator.stop();
            console.log('🛑 Simulator stopped');
        }

        this.rl.close();
        process.exit(0);
    }
}

// Start the interactive tester
const tester = new InteractiveTester();
tester.start().catch(console.error);
