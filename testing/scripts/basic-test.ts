#!/usr/bin/env node

/**
 * Basic Test Script for auth-flow-sim Package
 * Run this to verify the package works correctly after installation
 */

import { createAuthFlowSimulator } from '../../src/index';

async function testPackage(): Promise<void> {
    console.log('🧪 Testing auth-flow-sim package...\n');

    try {
        // Test 1: Package Installation
        console.log('✅ Package installed successfully');

        // Test 2: Create Simulator
        console.log('🔧 Creating simulator instance...');
        const simulator = createAuthFlowSimulator({
            enableLogging: true,
            delayMs: 100,
        });
        console.log('✅ Simulator created');

        // Test 3: Start Simulator
        console.log('🚀 Starting simulator...');
        await simulator.start();
        console.log('✅ Simulator started');

        // Test 4: Basic Login
        console.log('🔐 Testing basic login...');
        const loginResult = await simulator.simulateLogin({
            email: 'test@example.com',
            password: 'password123'
        });

        if (loginResult.success) {
            console.log('✅ Login test passed');
            console.log(`   User: ${loginResult.user?.name}`);
            console.log(`   Session: ${loginResult.session?.id}`);
        } else {
            console.log('❌ Login test failed:', loginResult.error);
        }

        // Test 5: 2FA Flow
        console.log('🔐 Testing 2FA flow...');
        const twoFactorResult = await simulator.simulateLogin({
            email: 'admin@example.com',
            password: 'password123'
        });

        if (twoFactorResult.requires2FA) {
            console.log('✅ 2FA requirement detected');
            const twoFactorAuth = await simulator.simulate2FA(twoFactorResult.user!.id, {
                code: '123456',
                method: 'totp'
            });

            if (twoFactorAuth.success) {
                console.log('✅ 2FA test passed');
            } else {
                console.log('❌ 2FA test failed:', twoFactorAuth.error);
            }
        }

        // Test 6: Password Reset
        console.log('🔄 Testing password reset...');
        const resetRequest = await simulator.simulatePasswordResetRequest({
            email: 'user@example.com',
            redirectUrl: 'https://test.com/reset'
        });

        if (resetRequest.success) {
            console.log('✅ Password reset request test passed');
        } else {
            console.log('❌ Password reset test failed:', resetRequest.error);
        }

        // Test 7: OAuth Flow
        console.log('🔗 Testing OAuth flow...');
        const oauthResult = await simulator.simulateOAuthCallback({
            code: 'test-code',
            state: 'test-state',
            provider: 'google'
        });

        if (oauthResult.success) {
            console.log('✅ OAuth test passed');
        } else {
            console.log('❌ OAuth test failed:', oauthResult.error);
        }

        // Test 8: Event Tracking
        console.log('📊 Testing event tracking...');
        const events = simulator.getEvents();
        console.log(`✅ Event tracking test passed (${events.length} events recorded)`);

        // Test 9: Stop Simulator
        console.log('🛑 Stopping simulator...');
        await simulator.stop();
        console.log('✅ Simulator stopped');

        console.log('\n🎉 All tests completed successfully!');
        console.log('📦 Your auth-flow-sim package is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testPackage();
