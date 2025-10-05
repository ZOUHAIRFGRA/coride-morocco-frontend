# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: CoRide Morocco (React Native + Expo)

1) Commonly used commands (PowerShell-friendly)
- Install dependencies
  - npm install

- Start the development server (Expo)
  - npm start
  - Web only: npx expo start --web

- Run on Android/iOS locally
  - Android: npx expo run:android
  - iOS (macOS only): npx expo run:ios
  Note: package.json defines android/ios scripts with a Unix-style env var prefix (DARK_MODE=media). On Windows PowerShell, prefer the npx expo run commands above. If you need to set an env var temporarily in PowerShell, use: $env:DARK_MODE = "media"; npx expo run:android

- Lint
  - npm run lint
  - Fix (if needed): npx eslint . --ext .ts,.tsx --fix

- Tests (Jest + jest-expo)
  - All tests: npm test
  - Watch mode: npm run test:watch
  - Coverage: npm run test:coverage
  - Single file: npx jest .\__tests__\components\ui\Button.test.tsx
  - Single test by name: npx jest -t "renders correctly"

- EAS build (CI-ready profiles in eas.json)
  - Android internal (preview): npx eas build --platform android --profile preview
  - Android dev client (development): npx eas build --platform android --profile development
  - iOS (macOS only): npx eas build --platform ios --profile preview
  Notes:
    - You must be logged in to Expo locally (npx expo login) or set EXPO_TOKEN in CI (see .github/workflows/eas-dev-build.yml).
    - The CI workflow uses --non-interactive and the preview profile.

- Environment toggles
  - Controlled via env/index.ts and eas.json:
    - EXPO_PUBLIC_IS_PROD=true uses env/env.prod.ts, otherwise env/env.dev.ts
    - EXPO_PUBLIC_USING_NGROK=true switches dev URLs to the Ngrok host


2) High-level code architecture and structure
- Routing and screens (Expo Router)
  - app/ folder uses route groups: (auth), (public), (main) with group-level _layout.tsx files and a root app/_layout.tsx. Typed routes are enabled in app.json (experiments.typedRoutes = true). Screens include onboarding and authenticated main flows.

- State management (Redux migrated to Context + hooks)
  - Global state lives in contexts/AppStateContext.tsx (Auth, UserProfile, Rides slices implemented via useReducer).
  - Public hooks:
    - useAuth from contexts/AppStateContext (also re-exported in hooks/useAuth.ts)
    - useUser from hooks/useUserProfile.ts (profile, preferences, documents, search)
    - useRides from hooks/useRides.ts (create/search/manage rides, with simple caching)
  - See REDUX_MIGRATION.md for details. Legacy Redux tests remain under __tests__/redux and can be updated/removed as needed.

- Services layer (API access + token handling)
  - Base class services/BaseApiService.ts centralizes fetch(), timeouts, JSON handling, error parsing, auth header injection, and token refresh flow hooks.
  - Default API config reads from process.env.EXPO_PUBLIC_API_URL or env/index.ts (ENV.API_URL); timeout defaults to 10s.
  - Token storage:
    - In-memory by default. Auth service overrides with AsyncStorage-backed AuthTokenStorage.
  - Concrete services:
    - services/auth.ts: login/register/logout, refresh tokens, getCurrentUser, change password, verify/resend email.
    - services/userProfileApi.ts: profile, preferences, documents, ratings (some endpoints are placeholders for backend parity).
    - services/ridesApi.ts: create/search/update/cancel rides, bookings.
  - Central exports and runtime reconfiguration: services/index.ts (configureServices can update baseUrl/headers/timeout across services).

- Environment configuration
  - env/index.ts selects env.dev or env.prod based on EXPO_PUBLIC_IS_PROD.
  - env/env.dev.ts can switch between local LAN API and Ngrok host using EXPO_PUBLIC_USING_NGROK.
  - app.json includes EAS projectId and secure-store, AV, image-picker permissions.

- UI system and theming
  - NativeWind + Tailwind (global.css, tailwind.config.js) with path aliases set in tsconfig.json (e.g., @components/*, @utils/*, @constants/*).
  - Gluestack UI provider and config under components/ui/gluestack-ui-provider/.
  - Shared styling constants in constants/theme.ts.

- Icons via Monicon (Metro plugin)
  - metro.config.js integrates @monicon/metro with an allowlist of icon names.
  - When adding/removing icons, update the icons array in metro.config.js accordingly.

- Schema-driven forms system
  - Central registry in constants/formSchemas.ts.
  - Renderers in components/schema-forms/{FormFieldRenderer,FormModal,FormScreen}. See FORM_SYSTEM_GUIDE.md and components/schema-forms/README.md for usage.

- Testing setup
  - Jest preset: jest-expo with setup in jest.setup.js, including mocks for common Expo/React Native modules.
  - Transform ignore patterns configured in package.json for RN/Expo packages.
  - Coverage thresholds enforced globally (Statements/Functions/Lines: 80%, Branches: 70%).
  - CI: .github/workflows/test.yml runs npm run test on Node 18.

- CI/CD
  - .github/workflows/eas-dev-build.yml runs tests then builds Android using EAS (preview profile) with Expo token from secrets.


3) Important local rules and guidance (from .cursor rules)
- Always examine the project structure and existing screens before coding new UI; keep styling consistent.
- Use theme colors from tailwind.config.js or constants/theme.ts.
- Prefer NativeWind for styling; if a component doesn’t support className, use style props.
- Use React Native Reanimated for animations and transitions.
- When using Monicon icons, update the allowlist in metro.config.js.
- Typography: avoid text-base; use text-md.


4) Key notes from README and docs
- Project uses Expo (53), React Native (0.79), React 19, NativeWind, and Gluestack UI.
- Builds and distribution use Expo EAS with profiles defined in eas.json.
- API docs and patterns are documented in docs/BASE_API.md, docs/AUTH_API_DOCS.md, docs/USER_API_DOCS.md. BaseApiService already implements the documented response/error shapes and token refresh strategy.


5) Gotchas
- package.json android/ios scripts use a Unix-style env var assignment that won’t work in Windows PowerShell. Prefer npx expo run:android or set env vars via $env:VAR in PowerShell.
- Some services in services/userProfileApi.ts include placeholder endpoints to align with backend plans; handle failures gracefully in UI and prefer useUser hook methods which already wrap errors.
- Legacy Redux tests under __tests__/redux are retained for reference; the app runtime uses Context + services.
