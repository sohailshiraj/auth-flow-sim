/**
 * Core types for the Authentication Flow Simulator
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  createdAt: Date;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  userAgent: string;
  ipAddress: string;
  deviceType: "mobile" | "desktop" | "tablet";
  browser?: string;
  os?: string;
}

export interface AuthFlowConfig {
  enable2FA: boolean;
  enablePasswordReset: boolean;
  enableOAuth: boolean;
  sessionTimeout: number; // in minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface TwoFactorCode {
  code: string;
  method: "sms" | "email" | "totp" | "app";
}

export interface PasswordResetRequest {
  email: string;
  redirectUrl?: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface OAuthProvider {
  name: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthCallback {
  code: string;
  state: string;
  provider: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  session?: AuthSession;
  error?: string;
  requires2FA?: boolean;
  requiresPasswordReset?: boolean;
}

export interface FlowStep {
  id: string;
  name: string;
  description: string;
  type: "login" | "2fa" | "password-reset" | "oauth" | "logout" | "session-check";
  status: "pending" | "in-progress" | "completed" | "failed";
  data?: Record<string, unknown>;
  nextSteps?: string[];
}

export interface FlowSimulation {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  currentStepIndex: number;
  status: "not-started" | "in-progress" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
}

export interface SimulatorOptions {
  config?: Partial<AuthFlowConfig>;
  mockUsers?: User[];
  enableLogging?: boolean;
  delayMs?: number; // Simulate network delay
}

export type AuthEventType =
  | "login-attempt"
  | "login-success"
  | "login-failure"
  | "2fa-required"
  | "2fa-success"
  | "2fa-failure"
  | "password-reset-requested"
  | "password-reset-completed"
  | "oauth-initiated"
  | "oauth-callback"
  | "session-created"
  | "session-expired"
  | "logout";

export interface AuthEvent {
  type: AuthEventType;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  data?: Record<string, unknown>;
  success: boolean;
  error?: string;
}

export interface SimulatorState {
  users: User[];
  sessions: AuthSession[];
  events: AuthEvent[];
  config: AuthFlowConfig;
  isRunning: boolean;
}
