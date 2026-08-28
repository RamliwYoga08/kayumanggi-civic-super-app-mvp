# Deployment

## Web

Validate:

```bash
npx expo-doctor@latest
npm run typecheck
npm test
```

Export:

```bash
npm run export:web
```

The static site is written to `dist/`.

Configure your hosting provider with the same public Supabase environment variables:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Never upload a Supabase secret key as a client environment variable.

## EAS Hosting

With EAS CLI authenticated:

```bash
eas deploy
```

## Android

Install EAS CLI:

```bash
npm install -g eas-cli
eas login
```

Preview APK:

```bash
eas build -p android --profile preview
```

Production app bundle:

```bash
eas build -p android --profile production
```

Publishing to Google Play requires the appropriate developer account and verification/payment requirements.

## iOS

```bash
eas build -p ios --profile production
```

App Store distribution generally requires an Apple Developer account and App Store Connect configuration. Local iOS Simulator development requires macOS/Xcode.

## Supabase production checklist

- Email confirmation configured
- Production redirect URLs configured
- RLS left enabled
- Secret keys stored only in trusted server/admin environments
- Storage buckets private
- Demo seed content replaced or clearly labeled
- Admin roles assigned manually and audited
- Real payment features not enabled until a payment provider is integrated
- Government/public-official content has an evidence/verification process

