# Bearing Finder

A mobile app built with Expo and React Native that helps you find the distance and compass bearing from your current GPS location to a target point.

## Features

- Live GPS tracking using `expo-location`
- Set target by:
  - tapping the map
  - entering latitude/longitude manually
- Real-time distance display (`m` / `km`)
- Real-time bearing display in degrees and cardinal direction (`N`, `NE`, `E`, ...)
- Animated direction arrow

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React Navigation (native stack)
- `react-native-maps`

## Project Structure

- `App.js` - navigation and app shell
- `screens/HomeScreen.js` - main map + UI + live calculations
- `utils/geo.js` - distance and bearing utility functions
- `app.json` - Expo app configuration and platform permissions

## Prerequisites

- Node.js 18+
- npm
- Expo CLI (optional, `npx expo` also works)

## Installation

```bash
npm install
```

## Run the App

```bash
npm run start
```

Then choose one of the targets:

- `a` for Android emulator/device
- `i` for iOS simulator (macOS only)
- `w` for web

Or run directly:

```bash
npm run android
npm run ios
npm run web
```

## How to Use

1. Grant location permission when prompted.
2. Set a target by tapping on the map or entering coordinates.
3. View:
   - distance to target
   - bearing in degrees
   - compass direction label
4. Use **Clear** to remove the target.

## Permissions

Location permissions are configured in `app.json`:

- iOS: `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysUsageDescription`
- Android: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`

## GitHub Push Checklist

Use these commands from the project root:

```bash
git status
git add .
git commit -m "Add Bearing Finder app and project README"
git branch -M main
```

If remote is not set yet:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
```

Push to GitHub:

```bash
git push -u origin main
```

## Notes

- This project uses `.gitignore` to exclude `node_modules`, Expo local files, and native build artifacts.
- If map behavior differs by platform, test on a physical device for most accurate GPS results.
