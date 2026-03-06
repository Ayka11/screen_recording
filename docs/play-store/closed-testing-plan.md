# Closed Testing Plan (Lignum)

## Goal
Validate install, navigation, state persistence, and quiz/pro unlock flow before production.

## Test matrix
- Android 10, 12, 14+
- Low-memory device + modern flagship
- Portrait mode primary

## Scenarios
1. Fresh install, first launch, tab navigation
2. Plant tree and verify persistence after app restart
3. Run quiz from start to finish
4. Unlock Pro and verify rare trees unlock
5. Offline start behavior
6. Long-session stability (10+ minutes)

## Exit criteria
- No blocking crashes
- No ANR events in test feedback
- Core navigation and persistence stable
- No policy red flags observed

## Play Console note
If your account has mandatory closed-testing gates, satisfy them before requesting production access.
