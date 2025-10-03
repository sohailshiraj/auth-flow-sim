/**
 * Basic Usage Example
 * Demonstrates the core functionality of auth-flow-sim
 */

import { createAuthFlowSimulator } from '../src/index.js';

async function basicExample() {
    console.log('🚀 Auth Flow Simulator - Basic Usage Example\n');

    // Create a simulator instance
    const simulator = createAuthFlowSimulator({
        enableLogging: true,
        delayMs: 200, // Simulate network delay
    });

    // Start the simulator
    await simulator.start();

    try {
        // Example 1: Basic Login
        console.log('📝 Example 1: Basic Login');
        console.log('─'.repeat(40));

        const loginResult = await simulator.simulateLogin({
            email: 'john@example.com',
            password: 'password123',
            rememberMe: true,
        });

        if (loginResult.success) {
            console.log('✅ Login successful!');
            console.log('👤 User:', loginResult.user?.name);
            console.log('🔑 Session ID:', loginResult.session?.id);
        } else {
            console.log('❌ Login failed:', loginResult.error);
        }

        console.log('\n');

        // Example 2: 2FA Login
        console.log('📝 Example 2: 2FA Login');
        console.log('─'.repeat(40));

        const twoFactorLoginResult = await simulator.simulateLogin({
            email: 'admin@example.com', // This user has 2FA enabled
            password: 'password123',
        });

        if (twoFactorLoginResult.requires2FA) {
            console.log('🔐 2FA required for admin user');

            const twoFactorResult = await simulator.simulate2FA(
                twoFactorLoginResult.user!.id,
                {
                    code: '123456',
                    method: 'totp',
                }
            );

            if (twoFactorResult.success) {
                console.log('✅ 2FA successful!');
                console.log('👤 User:', twoFactorResult.user?.name);
            } else {
                console.log('❌ 2FA failed:', twoFactorResult.error);
            }
        }

        console.log('\n');

        // Example 3: Password Reset
        console.log('📝 Example 3: Password Reset');
        console.log('─'.repeat(40));

        const resetRequest = await simulator.simulatePasswordResetRequest({
            email: 'jane@example.com',
            redirectUrl: 'https://yourapp.com/reset-password',
        });

        if (resetRequest.success) {
            console.log('📧 Password reset email sent');

            const resetConfirm = await simulator.simulatePasswordResetConfirm({
                token: 'reset-token-123',
                newPassword: 'newPassword123',
            });

            if (resetConfirm.success) {
                console.log('✅ Password reset successful!');
            }
        }

        console.log('\n');

        // Example 4: OAuth Login
        console.log('📝 Example 4: OAuth Login');
        console.log('─'.repeat(40));

        const oauthResult = await simulator.simulateOAuthCallback({
            code: 'oauth-code-123',
            state: 'random-state',
            provider: 'google',
        });

        if (oauthResult.success) {
            console.log('✅ OAuth login successful!');
            console.log('👤 User:', oauthResult.user?.name);
        }

        console.log('\n');

        // Example 5: Session Management
        console.log('📝 Example 5: Session Management');
        console.log('─'.repeat(40));

        if (loginResult.session) {
            const sessionCheck = await simulator.checkSession(loginResult.session.id);

            if (sessionCheck.success) {
                console.log('✅ Session is valid');
                console.log('👤 User:', sessionCheck.user?.name);
            } else {
                console.log('❌ Session invalid:', sessionCheck.error);
            }

            // Logout
            const logoutResult = await simulator.simulateLogout(loginResult.session.id);
            console.log('🚪 Logout successful:', logoutResult.success);
        }

        console.log('\n');

        // Example 6: Event Tracking
        console.log('📝 Example 6: Event Tracking');
        console.log('─'.repeat(40));

        const events = simulator.getEvents();
        console.log(`📊 Total events: ${events.length}`);

        const eventTypes = events.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        console.log('📈 Event breakdown:', eventTypes);

    } finally {
        // Stop the simulator
        await simulator.stop();
        console.log('\n🛑 Simulator stopped');
    }
}

// Run the example
basicExample().catch(console.error);
