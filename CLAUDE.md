# CoRide Morocco - AI Assistant Context

## Project Overview
React Native mobile app for carpooling in Morocco with role-based UI (driver/rider), real-time features, and trajectory tribes. Built with Expo Router, NativeWind, and WebSocket integrations.

## Core Tech Stack
- **Framework**: React Native 0.81 + Expo 54
- **Routing**: Expo Router (file-based)
- **Styling**: NativeWind 4.1 (Tailwind for RN) + Gluestack UI
- **Animations**: React Native Reanimated 4.1
- **State**: Contexts (Auth, Theme, UI, AppState) + hooks
- **Icons**: Monicon (configured in metro.config.js)
- **Maps**: react-native-maps
- **Real-time**: WebSocket services
- **Storage**: expo-secure-store + async-storage

## Project Structure
```
app/                    # Expo Router pages (file-based routing)
  (auth)/              # Auth screens
  (main)/              # Main app screens  
  (public)/            # Public screens
  rides/               # Ride management
  payments/            # Payment features
  tribes/              # Tribe features
components/            # Reusable components
  ui/                  # UI components (buttons, inputs, etc)
  modals/              # Modal components
services/              # API services (auth, rides, tribes, websocket)
hooks/                 # Custom hooks
contexts/              # React contexts
types/                 # TypeScript types
utils/                 # Utilities
constants/             # App constants (theme, icons, schemas)
docs/                  # API documentation
env/                   # Environment configs (dev/prod)
```

## Key Files
- `metro.config.js`: Metro config with Monicon icons + buffer polyfill
- `tailwind.config.js`: Theme colors and Tailwind config
- `constants/theme.ts`: App theme definitions
- `.github/instructions/rule.instructions.md`: Coding rules (READ FIRST)
- `polyfills.js`: Node.js polyfills for RN

## Coding Standards (CRITICAL)
1. **Always check existing code** before making changes
2. **Follow exact instructions** - don't add extra features
3. **Use NativeWind** for styling (check if component supports `className`)
4. **Use Reanimated** for animations/transitions
5. **Check theme colors** from tailwind.config.js/theme.ts
6. **Match existing UI style** when creating screens
7. **Update metro.config.js** when adding/editing Monicon icons
8. **Use text-md** instead of text-base
9. **Add comments** for each function explaining what it does
10. **Location handling**: Always provide lat/lng fallback if address unavailable
11. **Drawer width**: Use max width to prevent full-screen occupation
12. **Role-based UI**: Clear separation of driver/rider, immediate updates on role switch
13. **Type safety**: Optional properties if not always present
14. **Timeouts**: Use `ReturnType<typeof setTimeout>` for RN compatibility

## File Routing (Expo Router)
- `app/index.tsx`: Root/entry screen
- `app/(auth)/_layout.tsx`: Auth layout
- `app/(main)/_layout.tsx`: Main app layout
- `app/[param].tsx`: Dynamic routes
- Folder names with `()` are route groups (don't affect URL)

## Styling Patterns
```tsx
// Always use NativeWind when possible
<View className="flex-1 bg-background p-4">
  <Text className="text-md text-foreground">Content</Text>
</View>

// If className not supported, use style
<Component style={{ backgroundColor: colors.background }} />
```

## Common Services
- `services/auth.ts`: Authentication
- `services/rideApi.ts`: Ride management
- `services/tribesApi.ts`: Tribe features
- `services/tribeWebSocket.ts`: Real-time tribe updates
- `services/BaseApiService.ts`: Base API client

## Environment Setup
- Dev config: `env/env.dev.ts`
- Prod config: `env/env.prod.ts`
- IP auto-detection: `scripts/get-wifi-ip.js`

## Common Patterns
- Custom hooks in `hooks/` (useAuth, useRides, useUser, etc.)
- Form schemas in `constants/formSchemas.ts`
- Theme usage via `useAppTheme()` hook
- Role switching via `useUser()` hook

## Important Notes
- Always examine project structure before coding
- Read `.github/instructions/rule.instructions.md` for detailed rules
- Check other screens for UI consistency
- Use TypeScript for type safety
- Test on both Android and iOS if possible
- WebSocket connections for real-time features

## Commands
- `npm start`: Start dev server
- `npm run android`: Run on Android
- `npm test`: Run tests
- `npm run lint`: Run linter
