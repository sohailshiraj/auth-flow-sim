/**
 * React Context Integration Example
 * Shows how to integrate auth-flow-sim with React using Context API
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    createAuthFlowSimulator,
    AuthFlowSimulator,
    AuthResult,
    User,
    AuthSession,
    LoginCredentials,
    TwoFactorCode,
    PasswordResetRequest,
    PasswordResetConfirm,
    OAuthCallback,
} from '../src/index.js';

// Types for the context
interface AuthContextType {
    // State
    user: User | null;
    session: AuthSession | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (credentials: LoginCredentials) => Promise<AuthResult>;
    logout: () => Promise<AuthResult>;
    checkSession: (sessionId: string) => Promise<AuthResult>;
    simulate2FA: (userId: string, code: TwoFactorCode) => Promise<AuthResult>;
    requestPasswordReset: (request: PasswordResetRequest) => Promise<AuthResult>;
    confirmPasswordReset: (confirm: PasswordResetConfirm) => Promise<AuthResult>;
    simulateOAuth: (callback: OAuthCallback) => Promise<AuthResult>;

    // Utilities
    clearError: () => void;
    getEvents: () => any[];
    getState: () => any;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
interface AuthProviderProps {
    children: ReactNode;
    enableLogging?: boolean;
    delayMs?: number;
}

export function AuthProvider({
    children,
    enableLogging = true,
    delayMs = 200
}: AuthProviderProps) {
    const [simulator] = useState<AuthFlowSimulator>(() =>
        createAuthFlowSimulator({
            enableLogging,
            delayMs,
        })
    );

    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize simulator
    useEffect(() => {
        simulator.start();
        return () => {
            simulator.stop();
        };
    }, [simulator]);

    // Helper function to handle results
    const handleResult = (result: AuthResult) => {
        if (result.success) {
            setUser(result.user || null);
            setSession(result.session || null);
            setError(null);
        } else {
            setError(result.error || 'An error occurred');
        }
        return result;
    };

    // Login function
    const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await simulator.simulateLogin(credentials);
            return handleResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = async (): Promise<AuthResult> => {
        if (!session) {
            return { success: false, error: 'No active session' };
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await simulator.simulateLogout(session.id);
            if (result.success) {
                setUser(null);
                setSession(null);
            }
            return handleResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Logout failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Check session function
    const checkSession = async (sessionId: string): Promise<AuthResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await simulator.checkSession(sessionId);
            return handleResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Session check failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // 2FA function
    const simulate2FA = async (userId: string, code: TwoFactorCode): Promise<AuthResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await simulator.simulate2FA(userId, code);
            return handleResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '2FA failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Password reset request
    const requestPasswordReset = async (request: PasswordResetRequest): Promise<AuthResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await simulator.simulatePasswordResetRequest(request);
            return handleResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Password reset request failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Password reset confirmation
    const confirmPasswordReset = async (confirm: PasswordResetConfirm): Promise<AuthResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await simulator.simulatePasswordResetConfirm(confirm);
            return handleResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Password reset confirmation failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // OAuth simulation
    const simulateOAuth = async (callback: OAuthCallback): Promise<AuthResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await simulator.simulateOAuthCallback(callback);
            return handleResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'OAuth simulation failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Clear error
    const clearError = () => setError(null);

    // Get events
    const getEvents = () => simulator.getEvents();

    // Get state
    const getState = () => simulator.getState();

    const value: AuthContextType = {
        user,
        session,
        isLoading,
        error,
        login,
        logout,
        checkSession,
        simulate2FA,
        requestPasswordReset,
        confirmPasswordReset,
        simulateOAuth,
        clearError,
        getEvents,
        getState,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use the auth context
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Example usage component
export function LoginForm() {
    const { login, isLoading, error, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        const result = await login({
            email,
            password,
            rememberMe,
        });

        if (result.success) {
            console.log('Login successful!');
        } else if (result.requires2FA) {
            console.log('2FA required');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                />
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                    Remember me
                </label>
            </div>

            {error && (
                <div className="text-red-600 text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
        </form>
    );
}

// Example app component
export function App() {
    return (
        <AuthProvider enableLogging={true} delayMs={200}>
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Auth Flow Simulator Demo
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <LoginForm />
                    </div>
                </div>
            </div>
        </AuthProvider>
    );
}
