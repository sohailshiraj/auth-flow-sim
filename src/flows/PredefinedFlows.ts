import type { FlowSimulation } from "../types/index.js";

/**
 * Predefined authentication flow simulations
 */
export class PredefinedFlows {
  /**
   * Standard login flow (no 2FA)
   */
  static createStandardLoginFlow(): FlowSimulation {
    return {
      id: "standard-login",
      name: "Standard Login Flow",
      description: "Basic login flow without 2FA",
      steps: [
        {
          id: "enter-credentials",
          name: "Enter Credentials",
          description: "User enters email and password",
          type: "login",
          status: "pending",
        },
        {
          id: "validate-credentials",
          name: "Validate Credentials",
          description: "System validates email and password",
          type: "login",
          status: "pending",
        },
        {
          id: "create-session",
          name: "Create Session",
          description: "System creates user session",
          type: "session-check",
          status: "pending",
        },
        {
          id: "redirect-dashboard",
          name: "Redirect to Dashboard",
          description: "User is redirected to dashboard",
          type: "login",
          status: "pending",
        },
      ],
      currentStepIndex: 0,
      status: "not-started",
      createdAt: new Date(),
    };
  }

  /**
   * Login flow with 2FA
   */
  static create2FALoginFlow(): FlowSimulation {
    return {
      id: "2fa-login",
      name: "2FA Login Flow",
      description: "Login flow with two-factor authentication",
      steps: [
        {
          id: "enter-credentials",
          name: "Enter Credentials",
          description: "User enters email and password",
          type: "login",
          status: "pending",
        },
        {
          id: "validate-credentials",
          name: "Validate Credentials",
          description: "System validates email and password",
          type: "login",
          status: "pending",
        },
        {
          id: "request-2fa",
          name: "Request 2FA Code",
          description: "System requests 2FA code from user",
          type: "2fa",
          status: "pending",
        },
        {
          id: "enter-2fa-code",
          name: "Enter 2FA Code",
          description: "User enters 2FA code",
          type: "2fa",
          status: "pending",
        },
        {
          id: "validate-2fa",
          name: "Validate 2FA Code",
          description: "System validates 2FA code",
          type: "2fa",
          status: "pending",
        },
        {
          id: "create-session",
          name: "Create Session",
          description: "System creates user session",
          type: "session-check",
          status: "pending",
        },
        {
          id: "redirect-dashboard",
          name: "Redirect to Dashboard",
          description: "User is redirected to dashboard",
          type: "login",
          status: "pending",
        },
      ],
      currentStepIndex: 0,
      status: "not-started",
      createdAt: new Date(),
    };
  }

  /**
   * Password reset flow
   */
  static createPasswordResetFlow(): FlowSimulation {
    return {
      id: "password-reset",
      name: "Password Reset Flow",
      description: "Complete password reset process",
      steps: [
        {
          id: "request-reset",
          name: "Request Password Reset",
          description: "User requests password reset",
          type: "password-reset",
          status: "pending",
        },
        {
          id: "send-email",
          name: "Send Reset Email",
          description: "System sends reset email to user",
          type: "password-reset",
          status: "pending",
        },
        {
          id: "click-reset-link",
          name: "Click Reset Link",
          description: "User clicks reset link in email",
          type: "password-reset",
          status: "pending",
        },
        {
          id: "enter-new-password",
          name: "Enter New Password",
          description: "User enters new password",
          type: "password-reset",
          status: "pending",
        },
        {
          id: "confirm-password",
          name: "Confirm Password",
          description: "User confirms new password",
          type: "password-reset",
          status: "pending",
        },
        {
          id: "update-password",
          name: "Update Password",
          description: "System updates user password",
          type: "password-reset",
          status: "pending",
        },
        {
          id: "redirect-login",
          name: "Redirect to Login",
          description: "User is redirected to login page",
          type: "password-reset",
          status: "pending",
        },
      ],
      currentStepIndex: 0,
      status: "not-started",
      createdAt: new Date(),
    };
  }

  /**
   * OAuth login flow
   */
  static createOAuthFlow(provider: string): FlowSimulation {
    return {
      id: `oauth-${provider.toLowerCase()}`,
      name: `${provider} OAuth Flow`,
      description: `Login using ${provider} OAuth`,
      steps: [
        {
          id: "initiate-oauth",
          name: "Initiate OAuth",
          description: `User clicks "Login with ${provider}"`,
          type: "oauth",
          status: "pending",
        },
        {
          id: "redirect-provider",
          name: "Redirect to Provider",
          description: `User is redirected to ${provider}`,
          type: "oauth",
          status: "pending",
        },
        {
          id: "provider-auth",
          name: "Provider Authentication",
          description: `User authenticates with ${provider}`,
          type: "oauth",
          status: "pending",
        },
        {
          id: "oauth-callback",
          name: "OAuth Callback",
          description: `${provider} redirects back with code`,
          type: "oauth",
          status: "pending",
        },
        {
          id: "exchange-code",
          name: "Exchange Code for Token",
          description: "System exchanges code for access token",
          type: "oauth",
          status: "pending",
        },
        {
          id: "get-user-info",
          name: "Get User Information",
          description: "System fetches user info from provider",
          type: "oauth",
          status: "pending",
        },
        {
          id: "create-or-update-user",
          name: "Create or Update User",
          description: "System creates or updates user account",
          type: "oauth",
          status: "pending",
        },
        {
          id: "create-session",
          name: "Create Session",
          description: "System creates user session",
          type: "session-check",
          status: "pending",
        },
        {
          id: "redirect-dashboard",
          name: "Redirect to Dashboard",
          description: "User is redirected to dashboard",
          type: "login",
          status: "pending",
        },
      ],
      currentStepIndex: 0,
      status: "not-started",
      createdAt: new Date(),
    };
  }

  /**
   * Session expiration flow
   */
  static createSessionExpirationFlow(): FlowSimulation {
    return {
      id: "session-expiration",
      name: "Session Expiration Flow",
      description: "Handling expired user sessions",
      steps: [
        {
          id: "detect-expired-session",
          name: "Detect Expired Session",
          description: "System detects expired session",
          type: "session-check",
          status: "pending",
        },
        {
          id: "clear-session",
          name: "Clear Session",
          description: "System clears expired session data",
          type: "session-check",
          status: "pending",
        },
        {
          id: "redirect-login",
          name: "Redirect to Login",
          description: "User is redirected to login page",
          type: "logout",
          status: "pending",
        },
        {
          id: "show-message",
          name: "Show Session Expired Message",
          description: "Display session expired message to user",
          type: "logout",
          status: "pending",
        },
      ],
      currentStepIndex: 0,
      status: "not-started",
      createdAt: new Date(),
    };
  }

  /**
   * Logout flow
   */
  static createLogoutFlow(): FlowSimulation {
    return {
      id: "logout",
      name: "Logout Flow",
      description: "Complete user logout process",
      steps: [
        {
          id: "initiate-logout",
          name: "Initiate Logout",
          description: "User clicks logout button",
          type: "logout",
          status: "pending",
        },
        {
          id: "clear-session",
          name: "Clear Session",
          description: "System clears user session",
          type: "logout",
          status: "pending",
        },
        {
          id: "clear-cookies",
          name: "Clear Cookies",
          description: "System clears authentication cookies",
          type: "logout",
          status: "pending",
        },
        {
          id: "redirect-login",
          name: "Redirect to Login",
          description: "User is redirected to login page",
          type: "logout",
          status: "pending",
        },
        {
          id: "show-logout-message",
          name: "Show Logout Message",
          description: "Display logout confirmation message",
          type: "logout",
          status: "pending",
        },
      ],
      currentStepIndex: 0,
      status: "not-started",
      createdAt: new Date(),
    };
  }

  /**
   * Get all predefined flows
   */
  static getAllFlows(): FlowSimulation[] {
    return [
      this.createStandardLoginFlow(),
      this.create2FALoginFlow(),
      this.createPasswordResetFlow(),
      this.createOAuthFlow("Google"),
      this.createOAuthFlow("GitHub"),
      this.createOAuthFlow("Microsoft"),
      this.createSessionExpirationFlow(),
      this.createLogoutFlow(),
    ];
  }
}
