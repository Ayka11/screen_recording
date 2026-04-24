# Screen Recorder Pro - Android

A native Android screen recording application with professional-grade features.

## Features

- **High-Quality Screen Recording**: Capture video at up to 4K resolution
- **Audio Recording**: Record microphone audio with configurable settings
- **Floating Controls**: Draggable overlay for pause/resume/stop functionality
- **Video Management**: Browse, preview, and delete recorded videos
- **Settings & Customization**: 
  - Resolution selection (720p to 4K)
  - Frame rate control (15-60 fps)
  - Bit rate adjustment
  - Audio recording toggle
  - Save location configuration
- **Touch Pointer Display**: Show/hide touch gestures during recording
- **Share Integration**: Share recordings via installed apps
- **App Shortcuts**: Quick record action from app drawer

## Technologies Used

- **Android SDK**: API 21 - 34 (Lollipop to Android 14)
- **Gradle Build System**: For dependency management and build automation
- **AndroidX**: Modern Android support library
- **Material Design Components**: Material Design 3 UI
- **Firebase**: Analytics and ads integration (optional)
- **MediaProjection API**: Native screen capture

## Requirements

- Android 5.0 (API 21) or higher
- Minimum 100MB free storage for recordings
- Android 11+ for optimal scoped storage handling

## Building the App

### Prerequisites

- Android Studio Koala or later
- JDK 17+
- Android SDK Tools (Build Tools 34+)
- Gradle 8.x

### Setup

1. Clone the repository
2. Open project in Android Studio
3. Update `local.properties` with your SDK path:
   ```
   sdk.dir=/path/to/Android/sdk
   ```

### Build Commands

#### Debug Build
```bash
./gradlew assembleDebug
```
Output: `app/build/outputs/apk/debug/app-debug.apk`

#### Release Build
```bash
./gradlew assembleRelease
```
Requires signing configuration in `keystore/`

#### Run on Device
```bash
./gradlew installDebug
```

### Signing Configuration

For release builds, configure your keystore:

1. Place your keystore file in `keystore/` directory
2. Update signing config in `app/build.gradle` with keystore path and credentials
3. Store sensitive credentials in `local.properties` (not committed to git)

**Note**: `keystore/password` file contains keystore password - never commit to version control.

## Project Structure

```
screen-recorder-pro-android/
├── app/
│   ├── build.gradle              # App-level dependencies and build config
│   ├── src/
│   │   ├── main/
│   │   │   ├── AndroidManifest.xml  # App permissions and components
│   │   │   ├── java/            # Java/Kotlin source code
│   │   │   │   └── com/openapps/screenrecorderpro/
│   │   │   │       ├── MainActivity.java      # Main activity
│   │   │   │       ├── RecorderService.java   # Recording service
│   │   │   │       └── ...
│   │   │   └── res/             # Resources (layouts, drawables, strings)
│   │   ├── test/                # Unit tests
│   │   └── androidTest/         # Instrumented tests
│   ├── proguard-rules.pro       # Code obfuscation rules
│   └── google-services.json     # Firebase configuration (if used)
├── gradle/                       # Gradle wrapper
├── build.gradle                  # Project-level build config
├── settings.gradle              # Gradle settings
├── gradle.properties            # Gradle properties
├── keystore/                    # Android keystore (for signing)
├── apk/                         # Pre-built APK files
└── README.md                    # This file
```

## Permissions

The app requires the following permissions:

- `RECORD_AUDIO` - For audio recording
- `MANAGE_EXTERNAL_STORAGE` - For saving videos to storage
- `SYSTEM_ALERT_WINDOW` - For floating controls
- `VIBRATE` - For haptic feedback
- `INTERNET` - For analytics and ads (optional)

## Configuration

### Build Variants

- **Debug**: Unoptimized, debug symbols included, analytics disabled
- **Release**: Optimized, ProGuard obfuscation, analytics enabled

### Version Information

- **Min SDK**: API 21 (Android 5.0)
- **Target SDK**: API 34 (Android 14)
- **Current Version**: 1.2 (Build 3)

## Privacy & Security

See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) for details on data handling and privacy practices.

## Troubleshooting

### Build Fails with Gradle Error
- Run `./gradlew clean` before building
- Ensure SDK is properly configured in `local.properties`
- Check JDK version is 17 or higher

### App Crashes on Startup
- Check device has screen recording support (API 21+)
- Verify all permissions are granted
- Check logcat for detailed error messages

### Recording Permission Denied
- Ensure app has RECORD_AUDIO and MANAGE_EXTERNAL_STORAGE permissions
- On Android 11+, grant "Photos and Videos" or "All Files" permission

## License

See project root for license information.