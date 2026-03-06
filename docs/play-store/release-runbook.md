# Release Runbook (Capacitor Android)

## Prerequisites
- Node.js installed
- JDK 21 installed
- Android SDK installed (`C:\Android` on this machine)

## One-time setup
1. `npm install`
2. `npm run build:web`
3. `npx cap sync android`
4. Configure signing in `android/keystore.properties` (use `android/keystore.properties.example`)

## Build signed AAB
1. Set environment variables:
   - `JAVA_HOME` -> JDK 21 path
   - `ANDROID_HOME` and `ANDROID_SDK_ROOT` -> `C:\Android`
2. Build:
   - `cd android`
   - `gradlew.bat bundleRelease`

## Output
- `android/app/build/outputs/bundle/release/app-release.aab`

## Verification
- `jarsigner -verify -verbose -certs app-release.aab`

## Upload
- Play Console -> Production (or Closed testing) -> Create release -> Upload AAB
