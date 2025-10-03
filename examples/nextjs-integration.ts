/**
 * Next.js Integration Example
 * Shows how to integrate auth-flow-sim with Next.js API routes
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createAuthFlowSimulator } from '../src/index.js';

// Create a singleton simulator instance
const simulator = createAuthFlowSimulator({
    enableLogging: process.env.NODE_ENV === 'development',
    delayMs: process.env.NODE_ENV === 'development' ? 200 : 100,
});

// API route: /api/auth/simulate/login
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password, rememberMe } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await simulator.simulateLogin({
            email,
            password,
            rememberMe: rememberMe || false,
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Login simulation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// API route: /api/auth/simulate/2fa
export async function twoFactorHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, code, method } = req.body;

        if (!userId || !code) {
            return res.status(400).json({ error: 'User ID and code are required' });
        }

        const result = await simulator.simulate2FA(userId, {
            code,
            method: method || 'totp',
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('2FA simulation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// API route: /api/auth/simulate/password-reset
export async function passwordResetHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, redirectUrl } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const result = await simulator.simulatePasswordResetRequest({
            email,
            redirectUrl,
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Password reset simulation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// API route: /api/auth/simulate/oauth
export async function oauthHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code, state, provider } = req.body;

        if (!code || !state || !provider) {
            return res.status(400).json({ error: 'Code, state, and provider are required' });
        }

        const result = await simulator.simulateOAuthCallback({
            code,
            state,
            provider,
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('OAuth simulation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// API route: /api/auth/simulate/session
export async function sessionHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        // Check session
        const { sessionId } = req.query;

        if (!sessionId || typeof sessionId !== 'string') {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        try {
            const result = await simulator.checkSession(sessionId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Session check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'DELETE') {
        // Logout
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        try {
            const result = await simulator.simulateLogout(sessionId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Logout simulation error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

// API route: /api/auth/simulate/events
export async function eventsHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const events = simulator.getEvents();
        const state = simulator.getState();

        res.status(200).json({
            events,
            state: {
                userCount: state.users.length,
                sessionCount: state.sessions.length,
                eventCount: state.events.length,
                isRunning: state.isRunning,
            },
        });
    } catch (error) {
        console.error('Events retrieval error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
