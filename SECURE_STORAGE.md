# Secure Storage Implementation

## Overview

This document outlines the implementation of secure storage for sensitive information in the VoxProfit app. We've replaced AsyncStorage with
platform-specific secure storage solutions:

- **iOS**: Using Keychain via `react-native-keychain`
- **Android**: Using EncryptedSharedPreferences via `react-native-encrypted-storage`

## Why the Change?

AsyncStorage is not secure for storing sensitive information like authentication tokens because:

1. It stores data in plain text
2. Any app with sufficient permissions can access the data
3. It's vulnerable to root access on jailbroken/rooted devices

## Implementation Details

### Required Packages

```bash
npm install react-native-keychain react-native-encrypted-storage --save
```

### Secure Storage Utility

We've created a utility (`utils/secureStorage.ts`) that provides a unified API for secure storage across platforms:

- `setSecureToken(token: string)`: Securely stores the authentication token
- `getSecureToken()`: Retrieves the securely stored token
- `removeSecureToken()`: Removes the securely stored token

### Usage

The `useAuth` hook has been updated to use these secure storage methods instead of AsyncStorage.

## Non-Sensitive Data

For non-sensitive data like user preferences (e.g., `hasSeenHighlights`), we continue to use AsyncStorage as it's appropriate for that purpose.

## Security Considerations

- The secure storage implementation provides significantly better protection than AsyncStorage
- However, no mobile storage is 100% secure on compromised devices
- For highest security, consider implementing token expiration and refresh mechanisms

## Testing

Please test the authentication flow on both iOS and Android devices to ensure the secure storage is working correctly.
