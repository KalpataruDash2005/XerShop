# PrintHub Mobile - React Native (Expo)

PrintHub customer mobile app for Android & iOS built with Expo and React Native.

## Features

- Cross-platform (Android & iOS)
- Document upload from camera or gallery
- Location-based shop discovery
- Real-time order tracking
- Secure authentication with JWT
- Push notifications
- Dark/Light theme support

## Tech Stack

- **Framework**: React Native with Expo SDK 51
- **Navigation**: Expo Router (file-based)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Maps**: react-native-maps (Google Maps)
- **Location**: expo-location
- **Storage**: expo-secure-store
- **UI**: NativeWind (Tailwind for RN)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```
printhub-mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Auth screens (login, register)
│   ├── (tabs)/            # Main app tabs (home, shops, orders, profile)
│   ├── shops/[id]         # Shop details
│   ├── orders/[id]        # Order details
│   └── upload/            # Document upload
├── src/
│   ├── components/        # Reusable components
│   ├── lib/              # API client, utilities
│   ├── store/            # Zustand stores
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   ├── constants/        # Colors, spacing, etc.
│   └── assets/           # Images, fonts
├── app.json              # Expo config
└── package.json
```

## Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `/(auth)/login` | Email/phone login |
| Register | `/(auth)/register` | User registration |
| Home | `/(tabs)` | Dashboard with quick actions |
| Shops | `/(tabs)/shops` | Nearby print shops map/list |
| Orders | `/(tabs)/orders` | Order history |
| Profile | `/(tabs)/profile` | User profile & settings |
| Upload | `/upload` | Document upload |
| Shop Details | `/shops/[id]` | Shop info, pricing |
| Order Details | `/orders/[id]` | Order tracking |

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for Android
npm run build:android

# Build for iOS
npm run build:ios

# Submit to stores
npm run submit
```

## Environment Variables

Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Permissions

The app requires:
- **Camera** - To scan documents
- **Photo Library** - To upload documents
- **Location** - To find nearby shops
- **Notifications** - Order status updates
