# Data Safety Declarations (Draft)

Use this as the starting point for Play Console Data Safety.

## Current app behavior (this build)
- Uses local device storage (`localStorage` in web layer inside WebView) for game state.
- Does not require login or account creation.
- Does not request location, camera, contacts, microphone, SMS, or health permissions.
- Does not include ad SDKs.
- No external payment processing in this build.

## Likely Data Safety selections (verify before submit)
- Data collected: No (if no backend telemetry is added)
- Data shared: No
- Data encrypted in transit: N/A if no network collection occurs
- Data deletion request: N/A if no server-side account data exists

## Re-validate if you add
- Analytics/Crash SDKs
- Account system
- Payments
- Cloud sync
- Any backend APIs that collect user/device identifiers
