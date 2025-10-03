import type { User } from "../types/index";

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Create a delay for simulation purposes
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock user for testing
 */
export function createMockUser(
  email: string,
  name: string,
  twoFactorEnabled: boolean = false
): User {
  return {
    id: generateId(),
    email,
    name,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    emailVerified: true,
    twoFactorEnabled,
    createdAt: new Date(),
  };
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleString();
}

/**
 * Generate a random 6-digit code for 2FA simulation
 */
export function generate2FACode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a random password reset token
 */
export function generateResetToken(): string {
  return generateId() + generateId();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a random device info for simulation
 */
export function generateDeviceInfo(): {
  userAgent: string;
  ipAddress: string;
  deviceType: "mobile" | "desktop" | "tablet";
  browser: string;
  os: string;
} {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  ];

  const browsers = ["Chrome", "Firefox", "Safari", "Edge"];
  const operatingSystems = ["Windows", "macOS", "iOS", "Android", "Linux"];
  const deviceTypes: ("mobile" | "desktop" | "tablet")[] = ["desktop", "mobile", "tablet"];

  return {
    userAgent: userAgents[Math.floor(Math.random() * userAgents.length)]!,
    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)]!,
    browser: browsers[Math.floor(Math.random() * browsers.length)]!,
    os: operatingSystems[Math.floor(Math.random() * operatingSystems.length)]!,
  };
}

/**
 * Create a deep copy of an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * Generate a random string of specified length
 */
export function randomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounce function to limit function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit function calls
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
