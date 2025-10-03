import { AuthFlowSimulator } from "../simulators/AuthFlowSimulator";
import type { SimulatorOptions } from "../types/index";

/**
 * Factory function to create an AuthFlowSimulator instance
 * This provides a convenient way to create and configure the simulator
 */
export function createAuthFlowSimulator(options?: SimulatorOptions): AuthFlowSimulator {
  return new AuthFlowSimulator(options);
}

/**
 * Create a simulator with common development settings
 */
export function createDevSimulator(): AuthFlowSimulator {
  return createAuthFlowSimulator({
    enableLogging: true,
    delayMs: 200, // Slightly longer delay for better simulation
    config: {
      enable2FA: true,
      enablePasswordReset: true,
      enableOAuth: true,
      sessionTimeout: 60, // 1 hour for development
      maxLoginAttempts: 10,
      lockoutDuration: 5, // 5 minutes
    },
  });
}

/**
 * Create a simulator with production-like settings
 */
export function createProdSimulator(): AuthFlowSimulator {
  return createAuthFlowSimulator({
    enableLogging: false,
    delayMs: 100,
    config: {
      enable2FA: true,
      enablePasswordReset: true,
      enableOAuth: true,
      sessionTimeout: 30, // 30 minutes
      maxLoginAttempts: 5,
      lockoutDuration: 15, // 15 minutes
    },
  });
}

/**
 * Create a simulator for testing purposes
 */
export function createTestSimulator(): AuthFlowSimulator {
  return createAuthFlowSimulator({
    enableLogging: false,
    delayMs: 0, // No delay for testing
    config: {
      enable2FA: true,
      enablePasswordReset: true,
      enableOAuth: true,
      sessionTimeout: 5, // 5 minutes for testing
      maxLoginAttempts: 3,
      lockoutDuration: 1, // 1 minute for testing
    },
  });
}
