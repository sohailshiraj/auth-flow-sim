# Testing Guide for auth-flow-sim Package

This guide provides comprehensive testing approaches for the `auth-flow-sim` package without requiring separate test applications.

## 🚀 Quick Start Testing

### 1. **Basic Package Verification**
```bash
# Test if package installs and basic functionality works
npm run test:basic
# or
node test-package.js
```

### 2. **Comprehensive Feature Testing**
```bash
# Test all features with detailed output
npm run test:all
# or
node comprehensive-test.js
```

### 3. **Interactive Testing**
```bash
# Interactive mode to test features on-demand
npm run test:interactive
# or
node interactive-test.js
```

## 📋 Available Test Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run test:basic` | Basic functionality test | Quick verification |
| `npm run test:all` | Comprehensive test suite | Full feature testing |
| `npm run test:interactive` | Interactive testing mode | Manual testing |
| `npm run test:quick` | Quick test runner | Fast testing |
| `npm run test:performance` | Performance benchmark | Speed testing |
| `npm run test:stress` | Stress test with concurrency | Load testing |
| `npm run test:package` | Run both basic and comprehensive | Complete testing |

## 🧪 Test Types Explained

### 1. **Basic Test** (`test-package.js`)
- **Purpose**: Quick verification that package works
- **Duration**: ~5 seconds
- **Tests**: Login, 2FA, OAuth, Password Reset, Session Management
- **Output**: Simple pass/fail with key information

### 2. **Comprehensive Test** (`comprehensive-test.js`)
- **Purpose**: Complete feature coverage testing
- **Duration**: ~30 seconds
- **Tests**: All features + edge cases + error scenarios
- **Output**: Detailed test results with summary

### 3. **Interactive Test** (`interactive-test.js`)
- **Purpose**: Manual testing with user control
- **Duration**: User-controlled
- **Tests**: Individual feature testing on-demand
- **Output**: Step-by-step interactive testing

### 4. **Quick Test Runner** (`quick-test.js`)
- **Purpose**: Flexible testing with different modes
- **Duration**: Varies by mode
- **Modes**: basic, all, interactive, performance, stress
- **Output**: Mode-specific results

## 🔧 Testing Individual Features

### Login Testing
```bash
# Test basic login
node -e "
import { createAuthFlowSimulator } from 'auth-flow-sim';
const sim = createAuthFlowSimulator({ enableLogging: true });
sim.start().then(() => {
  return sim.simulateLogin({ email: 'user@example.com', password: 'password123' });
}).then(result => {
  console.log(result.success ? '✅ Login works' : '❌ Login failed');
  return sim.stop();
});
"
```

### 2FA Testing
```bash
# Test 2FA flow
node -e "
import { createAuthFlowSimulator } from 'auth-flow-sim';
const sim = createAuthFlowSimulator({ enableLogging: true });
sim.start().then(async () => {
  const login = await sim.simulateLogin({ email: 'admin@example.com', password: 'password123' });
  if (login.requires2FA) {
    const twoFactor = await sim.simulate2FA(login.user.id, { code: '123456', method: 'totp' });
    console.log(twoFactor.success ? '✅ 2FA works' : '❌ 2FA failed');
  }
  return sim.stop();
});
"
```

### OAuth Testing
```bash
# Test OAuth flow
node -e "
import { createAuthFlowSimulator } from 'auth-flow-sim';
const sim = createAuthFlowSimulator({ enableLogging: true });
sim.start().then(() => {
  return sim.simulateOAuthCallback({ code: 'test', state: 'test', provider: 'google' });
}).then(result => {
  console.log(result.success ? '✅ OAuth works' : '❌ OAuth failed');
  return sim.stop();
});
"
```

## 📊 Performance Testing

### Benchmark Testing
```bash
# Run performance benchmark
npm run test:performance
```

This will:
- Run 100 login operations
- Measure execution time
- Calculate operations per second
- Show success rate

### Stress Testing
```bash
# Run stress test
npm run test:stress
```

This will:
- Test 50 concurrent users
- Each user performs 10 operations
- Measure performance under load
- Show concurrent operation handling

## 🐛 Debugging and Troubleshooting

### Enable Detailed Logging
```bash
# Run with verbose logging
node -e "
import { createAuthFlowSimulator } from 'auth-flow-sim';
const sim = createAuthFlowSimulator({ 
  enableLogging: true, 
  delayMs: 100 
});
// ... your test code
"
```

### Check Simulator State
```bash
# Inspect simulator state
node -e "
import { createAuthFlowSimulator } from 'auth-flow-sim';
const sim = createAuthFlowSimulator();
sim.start().then(() => {
  console.log('State:', sim.getState());
  console.log('Events:', sim.getEvents());
  return sim.stop();
});
"
```

### Event Monitoring
```bash
# Monitor events in real-time
node -e "
import { createAuthFlowSimulator } from 'auth-flow-sim';
const sim = createAuthFlowSimulator({ enableLogging: true });
sim.on('auth-event', (event) => {
  console.log('Event:', event.type, event.success);
});
sim.start().then(() => {
  // ... perform operations
});
"
```

## 🎯 Testing Scenarios

### 1. **Happy Path Testing**
- Valid login credentials
- Successful 2FA completion
- Valid OAuth callback
- Successful password reset
- Valid session management

### 2. **Error Path Testing**
- Invalid credentials
- Wrong 2FA codes
- Invalid OAuth states
- Expired tokens
- Invalid sessions

### 3. **Edge Case Testing**
- Missing required fields
- Malformed input data
- Concurrent operations
- Rate limiting
- Session expiry

### 4. **Integration Testing**
- Multiple auth methods
- Session persistence
- Event tracking
- State management

## 📈 Test Results Interpretation

### Success Indicators
- ✅ All tests pass
- 📊 High success rate (>95%)
- ⏱️ Reasonable performance (<100ms per operation)
- 🔄 No memory leaks
- 📝 Proper event logging

### Failure Indicators
- ❌ Any test fails
- 📊 Low success rate (<90%)
- ⏱️ Poor performance (>500ms per operation)
- 🔄 Memory leaks detected
- 📝 Missing or incorrect events

## 🔄 Continuous Testing

### Pre-commit Testing
```bash
# Run before committing
npm run test:package
```

### CI/CD Testing
```bash
# Run in CI/CD pipeline
npm run test:all && npm run test:performance
```

### Regular Testing
```bash
# Daily testing routine
npm run test:basic
npm run test:performance
```

## 🛠️ Custom Testing

### Create Custom Test
```javascript
// custom-test.js
import { createAuthFlowSimulator } from 'auth-flow-sim';

async function customTest() {
    const simulator = createAuthFlowSimulator({
        enableLogging: true,
        delayMs: 100,
        config: {
            // Your custom configuration
        }
    });

    await simulator.start();
    
    try {
        // Your custom test logic
        const result = await simulator.simulateLogin({
            email: 'custom@example.com',
            password: 'custompass'
        });
        
        console.log('Custom test result:', result);
    } finally {
        await simulator.stop();
    }
}

customTest().catch(console.error);
```

### Run Custom Test
```bash
node custom-test.js
```

## 📚 Additional Resources

- **Package Documentation**: See README.md
- **API Reference**: Check TypeScript definitions in dist/
- **Examples**: See examples/ directory
- **Issues**: Report bugs on GitHub
- **Contributing**: See CONTRIBUTING.md

## 🎉 Conclusion

This testing approach provides comprehensive coverage of all `auth-flow-sim` features without requiring separate test applications. You can:

1. **Quickly verify** package functionality with basic tests
2. **Thoroughly test** all features with comprehensive tests
3. **Manually explore** features with interactive testing
4. **Measure performance** with benchmark tests
5. **Test under load** with stress tests

Choose the testing approach that best fits your needs!