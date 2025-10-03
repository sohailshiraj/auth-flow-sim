import type {
  User,
  AuthSession,
  LoginCredentials,
  TwoFactorCode,
  PasswordResetRequest,
  PasswordResetConfirm,
  OAuthCallback,
  AuthResult,
  FlowSimulation,
  SimulatorOptions,
  AuthEvent,
  SimulatorState,
  AuthEventType,
} from "../types/index.js";
import { generateId, delay, createMockUser } from "../utils/helpers.js";

/**
 * Main Authentication Flow Simulator class
 * Provides comprehensive simulation of authentication flows for development
 */
export class AuthFlowSimulator {
  private state: SimulatorState;
  private options: SimulatorOptions;

  constructor(options: SimulatorOptions = {}) {
    this.options = {
      enableLogging: true,
      delayMs: 100,
      ...options,
    };

    this.state = {
      users: options.mockUsers || this.createDefaultUsers(),
      sessions: [],
      events: [],
      config: {
        enable2FA: true,
        enablePasswordReset: true,
        enableOAuth: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        ...options.config,
      },
      isRunning: false,
    };
  }

  /**
   * Start the simulator
   */
  async start(): Promise<void> {
    this.state.isRunning = true;
    this.log("Simulator started");
    this.emitEvent("login-attempt", true);
  }

  /**
   * Stop the simulator
   */
  async stop(): Promise<void> {
    this.state.isRunning = false;
    this.log("Simulator stopped");
    this.emitEvent("logout", true);
  }

  /**
   * Simulate a login attempt
   */
  async simulateLogin(credentials: LoginCredentials): Promise<AuthResult> {
    await this.delay();

    const user = this.findUserByEmail(credentials.email);

    if (!user) {
      this.emitEvent("login-failure", false, { email: credentials.email }, "User not found");
      return { success: false, error: "Invalid credentials" };
    }

    // Simulate password validation
    const isValidPassword = await this.validatePassword(user, credentials.password);

    if (!isValidPassword) {
      this.emitEvent(
        "login-failure",
        false,
        { userId: user.id, email: credentials.email },
        "Invalid password"
      );
      return { success: false, error: "Invalid credentials" };
    }

    // Check if 2FA is required
    if (user.twoFactorEnabled) {
      this.emitEvent("2fa-required", true, { userId: user.id });
      return {
        success: false,
        requires2FA: true,
        user,
        error: "Two-factor authentication required",
      };
    }

    // Create session
    const session = await this.createSession(user, credentials.rememberMe);

    this.emitEvent("login-success", true, { userId: user.id, sessionId: session.id });

    return {
      success: true,
      user,
      session,
    };
  }

  /**
   * Simulate 2FA verification
   */
  async simulate2FA(userId: string, code: TwoFactorCode): Promise<AuthResult> {
    await this.delay();

    const user = this.findUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Simulate 2FA code validation
    const isValidCode = await this.validate2FACode(user, code);

    if (!isValidCode) {
      this.emitEvent("2fa-failure", false, { userId }, "Invalid 2FA code");
      return { success: false, error: "Invalid 2FA code" };
    }

    // Create session after successful 2FA
    const session = await this.createSession(user, false);

    this.emitEvent("2fa-success", true, { userId, sessionId: session.id });

    return {
      success: true,
      user,
      session,
    };
  }

  /**
   * Simulate password reset request
   */
  async simulatePasswordResetRequest(request: PasswordResetRequest): Promise<AuthResult> {
    await this.delay();

    const user = this.findUserByEmail(request.email);
    if (!user) {
      // Don't reveal if user exists for security
      this.emitEvent("password-reset-requested", true, { email: request.email });
      return { success: true };
    }

    // Generate reset token (in real app, this would be sent via email)
    const resetToken = generateId();

    this.emitEvent("password-reset-requested", true, { userId: user.id, resetToken });

    return { success: true };
  }

  /**
   * Simulate password reset confirmation
   */
  async simulatePasswordResetConfirm(confirm: PasswordResetConfirm): Promise<AuthResult> {
    await this.delay();

    // In a real app, you'd validate the token
    // For simulation, we'll just accept any token
    this.emitEvent("password-reset-completed", true, { token: confirm.token });

    return { success: true };
  }

  /**
   * Simulate OAuth callback
   */
  async simulateOAuthCallback(callback: OAuthCallback): Promise<AuthResult> {
    await this.delay();

    // Simulate OAuth provider response
    const user = await this.findOrCreateOAuthUser(callback);
    const session = await this.createSession(user, false);

    this.emitEvent("oauth-callback", true, {
      userId: user.id,
      sessionId: session.id,
      provider: callback.provider,
    });

    return {
      success: true,
      user,
      session,
    };
  }

  /**
   * Simulate logout
   */
  async simulateLogout(sessionId: string): Promise<AuthResult> {
    await this.delay();

    const sessionIndex = this.state.sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex === -1) {
      return { success: false, error: "Session not found" };
    }

    this.state.sessions.splice(sessionIndex, 1);
    this.emitEvent("logout", true, { sessionId });

    return { success: true };
  }

  /**
   * Check if session is valid
   */
  async checkSession(sessionId: string): Promise<AuthResult> {
    await this.delay();

    const session = this.state.sessions.find((s) => s.id === sessionId);
    if (!session) {
      this.emitEvent("session-expired", false, { sessionId }, "Session not found");
      return { success: false, error: "Session not found" };
    }

    if (session.expiresAt < new Date()) {
      // Remove expired session
      this.state.sessions = this.state.sessions.filter((s) => s.id !== sessionId);
      this.emitEvent("session-expired", false, { sessionId }, "Session expired");
      return { success: false, error: "Session expired" };
    }

    const user = this.findUserById(session.userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      user,
      session,
    };
  }

  /**
   * Create a flow simulation
   */
  createFlowSimulation(name: string, description: string): FlowSimulation {
    const simulation: FlowSimulation = {
      id: generateId(),
      name,
      description,
      steps: [],
      currentStepIndex: 0,
      status: "not-started",
      createdAt: new Date(),
    };

    return simulation;
  }

  /**
   * Get current simulator state
   */
  getState(): SimulatorState {
    return { ...this.state };
  }

  /**
   * Get all events
   */
  getEvents(): AuthEvent[] {
    return [...this.state.events];
  }

  /**
   * Clear all data
   */
  reset(): void {
    this.state.users = this.createDefaultUsers();
    this.state.sessions = [];
    this.state.events = [];
    this.log("Simulator reset");
  }

  // Private methods

  private createDefaultUsers(): User[] {
    return [
      createMockUser("john@example.com", "John Doe", true),
      createMockUser("jane@example.com", "Jane Smith", false),
      createMockUser("admin@example.com", "Admin User", true),
    ];
  }

  private findUserByEmail(email: string): User | undefined {
    return this.state.users.find((user) => user.email === email);
  }

  private findUserById(id: string): User | undefined {
    return this.state.users.find((user) => user.id === id);
  }

  private async validatePassword(_user: User, password: string): Promise<boolean> {
    // In simulation, accept any password
    // In real app, you'd hash and compare
    return password.length >= 6;
  }

  private async validate2FACode(_user: User, code: TwoFactorCode): Promise<boolean> {
    // In simulation, accept any 6-digit code
    return /^\d{6}$/.test(code.code);
  }

  private async createSession(user: User, rememberMe: boolean = false): Promise<AuthSession> {
    const session: AuthSession = {
      id: generateId(),
      userId: user.id,
      token: generateId(),
      refreshToken: generateId(),
      expiresAt: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000)), // 30 days or 30 minutes
      createdAt: new Date(),
      deviceInfo: {
        userAgent: "AuthFlowSimulator/1.0.0",
        ipAddress: "127.0.0.1",
        deviceType: "desktop",
      },
    };

    this.state.sessions.push(session);
    this.emitEvent("session-created", true, { userId: user.id, sessionId: session.id });

    return session;
  }

  private async findOrCreateOAuthUser(callback: OAuthCallback): Promise<User> {
    // In simulation, create a user based on OAuth provider
    const email = `oauth-${callback.provider}@example.com`;
    let user = this.findUserByEmail(email);

    if (!user) {
      user = createMockUser(email, `${callback.provider} User`, false);
      this.state.users.push(user);
    }

    return user;
  }

  private emitEvent(
    type: AuthEventType,
    success: boolean,
    data?: Record<string, unknown>,
    error?: string
  ): void {
    const event: AuthEvent = {
      type,
      timestamp: new Date(),
      success,
      data: data || {},
      ...(error && { error }),
    };

    this.state.events.push(event);
    this.log(`Event: ${type} - ${success ? "SUCCESS" : "FAILURE"}`, data);
  }

  private async delay(): Promise<void> {
    if (this.options.delayMs && this.options.delayMs > 0) {
      await delay(this.options.delayMs);
    }
  }

  private log(message: string, data?: unknown): void {
    if (this.options.enableLogging) {
      console.log(`[AuthFlowSimulator] ${message}`, data || "");
    }
  }
}
