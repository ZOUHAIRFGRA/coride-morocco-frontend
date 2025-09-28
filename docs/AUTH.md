# CoRide Morocco - Authentication System

## Overview

A comprehensive, culturally-authentic authentication system for the CoRide Morocco app, built with React Native, TypeScript, and Expo. Features Moroccan-themed UI components, bilingual support, and complete integration with the FastAPI backend.

## 🎨 Features

### **Moroccan Cultural Design**
- **Colors**: Traditional Moroccan palette (Red, Green, Gold, Blue)
- **Typography**: Support for Arabic and French languages
- **Patterns**: Inspired by zellige tiles and Islamic geometric designs
- **Gradients**: Sahara sunset, Atlas mountains, ocean-inspired themes

### **Complete Authentication Flow**
- ✅ User Registration with validation
- ✅ User Login with secure token handling
- ✅ Email Verification with 6-digit codes
- ✅ Password strength validation
- ✅ Moroccan phone number validation
- ✅ Form validation with real-time error feedback
- ✅ Bilingual UI (Arabic/French)

### **Backend Integration**
- Full integration with FastAPI authentication endpoints
- Secure token storage and management
- Automatic token refresh
- Error handling and user feedback
- Rate limiting and security features

## 🏗️ Architecture

```
screens/auth/
├── AuthFlowDemo.tsx          # Demo component showcasing all screens
├── LoginScreen.tsx           # User login form
├── RegisterScreen.tsx        # User registration with full validation
├── EmailVerificationScreen.tsx # 6-digit code verification
└── index.ts                  # Central exports

components/auth/
├── ThemedInput.tsx           # Reusable input component
└── ThemedButton.tsx          # Themed button variants

services/
└── auth.ts                   # API service for backend communication

utils/
└── validation.ts             # Form validation utilities

types/
└── auth.ts                   # TypeScript interfaces and types
```

## 🚀 Quick Start

### Import and Use

```typescript
import { 
  LoginScreen, 
  RegisterScreen, 
  EmailVerificationScreen,
  AuthFlowDemo 
} from './screens/auth';

// Use in your navigation
const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Verify" component={EmailVerificationScreen} />
  </Stack.Navigator>
);

// Or try the complete demo
export default function App() {
  return <AuthFlowDemo />;
}
```

## 📱 Screens

### **1. Login Screen**
- Email and password input with validation
- Moroccan red gradient header
- "Remember me" and "Forgot password" options
- Link to registration screen
- Arabic text with RTL support

**Features:**
- Real-time form validation
- Loading states and error handling
- Accessible design with proper contrast
- Moroccan-themed visual elements

### **2. Registration Screen**
- Complete user information form
- Moroccan phone number validation
- Password strength indicator
- Terms and conditions acceptance
- Role selection (Rider/Driver)
- Language preference (Arabic/French)

**Fields:**
- First Name / Last Name
- Email address
- Moroccan phone number
- Password with confirmation
- Account type selection
- Language preference
- Terms acceptance

### **3. Email Verification Screen**
- 6-digit code input with auto-focus
- Resend code functionality with countdown
- Visual feedback for entered codes
- Clean, focused design

**Features:**
- Auto-advance to next input field
- Code validation and submission
- Resend cooldown timer
- Clear success/error messages

## 🛠️ API Integration

### **Backend Compatibility**

The authentication system is fully compatible with your FastAPI backend endpoints:

```python
# Your backend endpoints that are supported:
POST /auth/register          # User registration
POST /auth/login            # User login  
POST /auth/refresh          # Token refresh
GET  /auth/me              # Get current user
POST /auth/verify-email     # Email verification
POST /auth/resend-verification # Resend verification code
PUT  /auth/change-password  # Change password
POST /auth/logout          # User logout
```

### **API Service Usage**

```typescript
import { authService } from './services/auth';

// Register user
const result = await authService.register({
  email: 'user@example.com',
  phone: '+212612345678',
  password: 'SecurePass123!',
  first_name: 'Ahmed',
  last_name: 'Bennani',
  preferred_language: 'ar',
  role: UserRole.RIDER
});

// Login user
const loginResult = await authService.login({
  email: 'user@example.com',
  password: 'SecurePass123!'
});

// Verify email
const verifyResult = await authService.verifyEmail('123456');
```

## ✅ Validation Features

### **Moroccan Phone Validation**
```typescript
// Supports multiple formats:
// +212612345678
// 0612345678  
// 612345678

const validation = validateMoroccanPhone('0612345678');
// Returns: { isValid: true, formatted: '+212612345678' }
```

### **Password Strength**
```typescript
const strength = validatePasswordStrength('MyPassword123!');
// Returns strength analysis with requirements check
```

### **Real-time Form Validation**
- Email format validation
- Password strength checking  
- Phone number format validation
- Required field validation
- Terms acceptance validation

## 🎨 Theme Integration

### **Using Moroccan Colors**
```typescript
import { useThemedStyles } from './hooks/useTheme';

const { colors } = useThemedStyles();
// colors.moroccanRed, colors.moroccanGreen, colors.saharaGold, etc.
```

### **Responsive Components**
```typescript
import { ThemedButton, ThemedInput } from './components/auth';

<ThemedButton 
  title="تسجيل الدخول" 
  variant="primary" 
  onPress={handleLogin}
/>

<ThemedInput
  label="البريد الإلكتروني"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  error={emailError}
/>
```

## 🌐 Internationalization

### **Arabic Support**
- Right-to-left (RTL) text support
- Arabic labels and placeholders
- Cultural context in messaging
- Proper Arabic typography

### **Bilingual Features**
- User can choose preferred language
- Support for Arabic and French
- Consistent terminology across screens
- Cultural adaptation for Morocco

## 🔒 Security Features

### **Form Security**
- Password strength validation
- Secure input handling
- Protection against common attacks
- Rate limiting awareness

### **Token Management**
- Secure token storage (expandable to AsyncStorage)
- Automatic token refresh
- Proper logout handling
- Session management

## 🧪 Testing the Authentication

### **Demo Component**

The `AuthFlowDemo` component provides a complete showcase:

```typescript
import { AuthFlowDemo } from './screens/auth';

// Renders navigation between all auth screens
export default function App() {
  return <AuthFlowDemo />;
}
```

### **Individual Screen Testing**

Each screen can be tested independently:

```typescript
// Test login screen
<LoginScreen 
  onLoginSuccess={() => console.log('Success!')}
  onNavigateToRegister={() => console.log('Go to register')}
/>

// Test registration
<RegisterScreen
  onRegistrationSuccess={() => console.log('Registered!')}
  onNavigateToLogin={() => console.log('Go to login')}
/>
```

## 📦 Dependencies

### **Required Packages**
```bash
# Install these packages for full functionality:
npm install expo-linear-gradient
npm install @expo/vector-icons

# For production, also add:
npm install @react-native-async-storage/async-storage
```

### **Development Setup**
1. Ensure Expo CLI is installed
2. Set up your backend API URL in environment variables
3. Configure proper TypeScript settings
4. Test with Expo Go for rapid development

## 🚀 Production Considerations

### **Before Production**
- [ ] Replace in-memory storage with AsyncStorage
- [ ] Add biometric authentication support
- [ ] Implement proper error logging
- [ ] Add analytics tracking
- [ ] Test on multiple device sizes
- [ ] Add accessibility labels
- [ ] Test with screen readers
- [ ] Add proper font loading for Arabic

### **Backend Integration**
- [ ] Configure proper API endpoints
- [ ] Set up environment variables
- [ ] Test token refresh functionality
- [ ] Validate all error scenarios
- [ ] Test rate limiting behavior

## 🤝 Contributing

The authentication system follows the established Moroccan theme patterns and can be extended with:

- Additional authentication methods (social login)
- Biometric authentication
- Multi-factor authentication
- Password reset functionality
- Profile management screens

All new components should follow the established patterns for theming, validation, and cultural adaptation.

---

**Built with ❤️ for Morocco's commuting community**