# Dynamic IP Configuration

This project is configured to automatically detect your Wi-Fi IP address to avoid hardcoding IP addresses in the development environment.

## How it works

1. **IP Detection Script**: `scripts/get-wifi-ip.js` runs `ipconfig` command and extracts the IPv4 address specifically from the "Wireless LAN adapter Wi-Fi:" section, ignoring other adapters like Tailscale, virtual adapters, or disconnected Wi-Fi adapters.

2. **Smart Environment Variable Management**: The script intelligently updates the `.env` file by:
   - Preserving all existing environment variables
   - Maintaining comments and file structure
   - Only updating `EXPO_PUBLIC_WIFI_IP` with the new IP address
   - Adding `EXPO_PUBLIC_USING_NGROK` if it doesn't exist

3. **Development Environment**: `env/env.dev.ts` reads the IP from the environment variable.

## Usage

### Starting the development server with auto IP detection:

```bash
# Regular start (IP detection runs automatically via prestart hook)
npm start

# Start with --go flag and IP detection
npm run start:go

# Other commands also include IP detection
npm run android
npm run ios
npm run web
```

### Manual IP detection:

```bash
node scripts/get-wifi-ip.js
```

## Fallback

If the script fails to detect the Wi-Fi IP address, it falls back to `192.168.1.2`.

## Files

- `scripts/get-wifi-ip.js` - IP detection script
- `.env` - Auto-generated file with current IP (not committed to git)
- `.env.example` - Example of the .env file format
- `env/env.dev.ts` - Development environment configuration

## Benefits

- No need to manually update IP addresses when they change
- Works automatically when switching networks
- Maintains fallback for reliability
- Compatible with existing ngrok configuration
- **Preserves all existing environment variables** - won't overwrite your custom .env settings
- Maintains file structure and comments in your .env file
- Safe to run multiple times without losing configuration