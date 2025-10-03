# Auth Flow Simulator

[![npm version](https://img.shields.io/npm/v/auth-flow-sim.svg)](https://www.npmjs.com/package/auth-flow-sim)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A comprehensive authentication flow simulator for local development. Simulate OAuth, 2FA, password reset, and session management flows without real auth providers.

## 🚀 Features

- **Complete Auth Flow Simulation** - Simulate entire authentication journeys
- **Multiple Auth Methods** - OAuth, 2FA, password reset, session management
- **Zero Dependencies** - No external auth providers required
- **TypeScript Support** - Full type safety and IntelliSense
- **Flexible Configuration** - Customize flows for your needs
- **Event Tracking** - Monitor all authentication events
- **Predefined Flows** - Ready-to-use common authentication patterns

## 📦 Installation

```bash
npm install auth-flow-sim
# or
yarn add auth-flow-sim
# or
pnpm add auth-flow-sim
```

## 🎯 Quick Start

```typescript
import { createAuthFlowSimulator } from 'auth-flow-sim';

// Create a simulator instance
const simulator = createAuthFlowSimulator({
  enableLogging: true,
  delayMs: 200, // Simulate network delay
});

// Start the simulator
await simulator.start();

// Simulate a login
const result = await simulator.simulateLogin({
  email: 'user@example.com',
  password: 'password123'
});

if (result.success) {
  console.log('Login successful!', result.user);
} else {
  console.log('Login failed:', result.error);
}
```

## 📚 Usage Examples

### Basic Login Flow

```typescript
import { createAuthFlowSimulator } from 'auth-flow-sim';

const simulator = createAuthFlowSimulator();

// Simulate login
const loginResult = await simulator.simulateLogin({
  email: 'john@example.com',
  password: 'password123',
  rememberMe: true
});

if (loginResult.success) {
  console.log('User logged in:', loginResult.user);
  console.log('Session created:', loginResult.session);
}
```

### 2FA Authentication

```typescript
// First, attempt login
const loginResult = await simulator.simulateLogin({
  email: 'admin@example.com',
  password: 'password123'
});

if (loginResult.requires2FA) {
  // Simulate 2FA code entry
  const twoFactorResult = await simulator.simulate2FA(loginResult.user!.id, {
    code: '123456',
    method: 'totp'
  });
  
  if (twoFactorResult.success) {
    console.log('2FA successful!', twoFactorResult.user);
  }
}
```

### Password Reset Flow

```typescript
// Request password reset
const resetRequest = await simulator.simulatePasswordResetRequest({
  email: 'user@example.com',
  redirectUrl: 'https://yourapp.com/reset-password'
});

if (resetRequest.success) {
  // Simulate password reset confirmation
  const resetConfirm = await simulator.simulatePasswordResetConfirm({
    token: 'reset-token-123',
    newPassword: 'newPassword123'
  });
  
  console.log('Password reset successful!');
}
```

### OAuth Flow

```typescript
// Simulate OAuth callback
const oauthResult = await simulator.simulateOAuthCallback({
  code: 'oauth-code-123',
  state: 'random-state',
  provider: 'google'
});

if (oauthResult.success) {
  console.log('OAuth login successful!', oauthResult.user);
}
```

### Session Management

```typescript
// Check if session is valid
const sessionCheck = await simulator.checkSession('session-id-123');

if (sessionCheck.success) {
  console.log('Session is valid:', sessionCheck.user);
} else {
  console.log('Session expired or invalid');
}

// Logout
const logoutResult = await simulator.simulateLogout('session-id-123');
console.log('Logout successful:', logoutResult.success);
```

## 🔧 Configuration

### Simulator Options

```typescript
import { createAuthFlowSimulator } from 'auth-flow-sim';

const simulator = createAuthFlowSimulator({
  // Enable/disable logging
  enableLogging: true,
  
  // Simulate network delay (ms)
  delayMs: 200,
  
  // Authentication configuration
  config: {
    enable2FA: true,
    enablePasswordReset: true,
    enableOAuth: true,
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
    lockoutDuration: 15, // minutes
  },
  
  // Custom mock users
  mockUsers: [
    {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      twoFactorEnabled: true,
      emailVerified: true,
      createdAt: new Date()
    }
  ]
});
```

### Predefined Flows

```typescript
import { PredefinedFlows } from 'auth-flow-sim';

// Get all predefined flows
const flows = PredefinedFlows.getAllFlows();

// Create specific flows
const loginFlow = PredefinedFlows.createStandardLoginFlow();
const twoFactorFlow = PredefinedFlows.create2FALoginFlow();
const passwordResetFlow = PredefinedFlows.createPasswordResetFlow();
const oauthFlow = PredefinedFlows.createOAuthFlow('Google');
```

## 🎨 Integration Examples

### With Next.js

```typescript
// pages/api/auth/simulate.ts
import { createAuthFlowSimulator } from 'auth-flow-sim';

const simulator = createAuthFlowSimulator();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    
    const result = await simulator.simulateLogin({ email, password });
    
    res.status(200).json(result);
  }
}
```

### With Express.js

```typescript
// app.js
import express from 'express';
import { createAuthFlowSimulator } from 'auth-flow-sim';

const app = express();
const simulator = createAuthFlowSimulator();

app.post('/api/auth/login', async (req, res) => {
  const result = await simulator.simulateLogin(req.body);
  res.json(result);
});

app.post('/api/auth/2fa', async (req, res) => {
  const result = await simulator.simulate2FA(req.body.userId, req.body.code);
  res.json(result);
});
```

### With React

```typescript
// AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { createAuthFlowSimulator, AuthResult } from 'auth-flow-sim';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [simulator] = useState(() => createAuthFlowSimulator());
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const result = await simulator.simulateLogin({ email, password });
    
    if (result.success) {
      setUser(result.user);
      setSession(result.session);
    }
    
    return result;
  };

  return (
    <AuthContext.Provider value={{ login, user, session }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 📊 Event Tracking

```typescript
// Get all authentication events
const events = simulator.getEvents();

// Filter events by type
const loginEvents = events.filter(event => event.type === 'login-success');

// Monitor events in real-time
simulator.on('auth-event', (event) => {
  console.log('Auth event:', event.type, event.success);
});
```

## 🧪 Testing

The library includes comprehensive testing utilities:

```typescript
import { createTestSimulator } from 'auth-flow-sim';

// Create a simulator optimized for testing
const testSimulator = createTestSimulator({
  delayMs: 0, // No delay for faster tests
  enableLogging: false
});

// Use in your tests
describe('Authentication Flow', () => {
  it('should simulate successful login', async () => {
    const result = await testSimulator.simulateLogin({
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
  });
});
```

## 🔄 Development Workflow

This project uses modern development tools:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** for running linters on staged files
- **GitHub Actions** for CI/CD

### Available Scripts

```bash
# Development
npm run dev          # Watch mode for TypeScript compilation
npm run build        # Build the library
npm run clean        # Clean build directory

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check formatting
npm run type-check   # TypeScript type checking

# Testing & CI
npm run test         # Run all checks
npm run ci:check     # Run CI checks locally
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need for better authentication testing tools
- Built with TypeScript for type safety
- Designed for modern JavaScript/TypeScript applications

## 📞 Support

- 📧 Email: sohailshiraj@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/auth-flow-sim/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/yourusername/auth-flow-sim/wiki)

---

**Made with ❤️ for developers who need better authentication testing tools**
