# Corriding App 🏎️

A clean, modern React Native app built with Expo Router, ready for corriding app development.

## Features

✅ **Authentication System** - Complete auth flow with onboarding
✅ **Modern UI Components** - Gluestack UI components with NativeWind styling  
✅ **Theme System** - Consistent colors and design system
✅ **Redux Toolkit** - State management ready for your features
✅ **Expo Router** - File-based routing system
✅ **TypeScript** - Full type safety

## Project Structure

```
app/
├── (auth)/          # Authentication screens
├── (public)/        # Public screens (splash, onboarding)
├── (main)/          # Main app screens
└── _layout.tsx      # Root layout with providers

components/
├── ui/              # Reusable UI components
├── modals/          # Modal components
└── schema-forms/    # Form components

hooks/               # Custom React hooks
redux/               # Redux store and slices
utils/               # Utility functions
constants/           # App constants and theme
```

## Get Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npx expo start
   ```

3. **Run on device/simulator**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app

## Customization

### Theme & Colors
- Edit `constants/theme.ts` for color schemes
- Modify `tailwind.config.js` for styling
- Update `gluestack-ui.config.json` for component themes

### Add New Features
1. Create new screens in `app/` directory
2. Add Redux slices in `redux/` folder
3. Create reusable components in `components/`
4. Add custom hooks in `hooks/`

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS  
- `npm run web` - Run on web
- `npm test` - Run tests
- `npm run lint` - Lint code

## Clean Foundation

This template has been cleaned from a previous investment app, keeping only:
- Authentication & onboarding flows
- UI component library and theme system
- Essential utilities and configurations
- Redux store with auth and user management

Perfect foundation for building your corriding app! 🚀
