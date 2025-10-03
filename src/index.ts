/**
 * Authentication Flow Simulator
 * A comprehensive library for simulating authentication flows during development
 */

export * from "./types/index";
export * from "./simulators/index";
export * from "./flows/index";
export * from "./utils/index";

// Main simulator class
export { AuthFlowSimulator } from "./simulators/AuthFlowSimulator";

// Convenience exports
export { createAuthFlowSimulator } from "./utils/createAuthFlowSimulator";
