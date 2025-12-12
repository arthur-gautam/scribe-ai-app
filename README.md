# ScribeAI - AI Clinical Scribe Mobile App

A React Native/Expo mobile application for AI-powered clinical documentation with real-time transcription, intelligent insights, and automated summary generation.

## 🚀 Features

- **Real-time Recording** - High-quality audio recording with live waveform visualization
- **AI Transcription** - Real-time speech-to-text conversion
- **Smart Insights** - AI-generated suggestions during sessions
- **Automated Summaries** - Key findings and action items extraction
- **Secure Storage** - Supabase backend with row-level security
- **Cross-Platform** - iOS and Android support via Expo

## 📱 Screens

1. **Splash** - Animated logo with brand identity
2. **Auth** - Email/password and Google OAuth login
3. **Dashboard** - Session list with search and filtering
4. **New Session** - Title and goal input for new recordings
5. **Live Recording** - Real-time transcription with AI insights
6. **Processing** - Animated progress during AI analysis
7. **Summary** - Key findings, action items, and export options
8. **Settings** - User preferences and account management

## 🛠 Tech Stack

- **Framework**: React Native + Expo SDK 52
- **Navigation**: React Navigation 6
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **Animations**: React Native Reanimated 3
- **Icons**: React Native SVG (custom icons)
- **State**: React Hooks + Supabase real-time subscriptions

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account

### Setup

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd scribe-ai-app
npm install
```

2. **Configure Supabase**

Create a new Supabase project and run the schema:
```bash
# Copy the contents of supabase/schema.sql 
# Paste into Supabase SQL Editor and run
```

3. **Set environment variables**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. **Start the development server**
```bash
npx expo start
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth web client ID |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google OAuth iOS client ID |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android client ID |

### Supabase Setup

1. **Enable Email Auth** in Authentication settings
2. **Enable Google OAuth** (optional) in Authentication > Providers
3. **Run schema.sql** in SQL Editor
4. **Enable Realtime** for the `sessions` table

## 📂 Project Structure

```
scribe-ai-app/
├── App.tsx                 # Entry point
├── src/
│   ├── screens/           # Screen components
│   │   ├── SplashScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── NewSessionScreen.tsx
│   │   ├── LiveRecordingScreen.tsx
│   │   ├── ProcessingScreen.tsx
│   │   ├── SummaryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── hooks/             # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useSessions.ts
│   │   └── useRecording.ts
│   ├── services/          # API services
│   │   └── supabase.ts
│   ├── navigation/        # Navigation config
│   │   └── AppNavigator.tsx
│   ├── theme/             # Design system
│   │   └── index.ts
│   └── types/             # TypeScript types
│       └── navigation.ts
├── supabase/
│   └── schema.sql         # Database schema
└── assets/                # Images and fonts
```

## 🎨 Design System

### Colors
- **Primary**: `#1E3A5F` (Deep Medical Blue)
- **Secondary**: `#2AA696` (Soft Teal)
- **Success**: `#10B981` (Green)
- **Danger**: `#EF4444` (Red)
- **Warning**: `#F59E0B` (Amber)

### Typography
- Font: System default (San Francisco on iOS, Roboto on Android)
- Sizes: 12px (micro) to 32px (timer)

### Spacing
- Base unit: 8px
- Scale: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)

## 🔐 Security

- Row-Level Security (RLS) enabled on all tables
- Users can only access their own data
- Supabase handles JWT token management
- Sensitive data never stored locally

## 📱 Building for Production

### iOS
```bash
npx expo build:ios
# or with EAS
eas build --platform ios
```

### Android
```bash
npx expo build:android
# or with EAS
eas build --platform android
```

## 🧪 Testing

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## 🔄 Future Enhancements

- [ ] Deepgram integration for real-time transcription
- [ ] n8n webhook for AI processing pipeline
- [ ] PDF export with professional formatting
- [ ] Email summary delivery
- [ ] Offline mode with sync
- [ ] Multi-language support

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ by MedhaAI**
