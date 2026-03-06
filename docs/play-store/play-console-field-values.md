# Play Console Field-by-Field Values (Lignum)

Last prepared: 2026-03-06
Package name: `com.ayka.lignum`
AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## 1) Dashboard -> Setup your app
- App name: `Lignum`
- Default language: `English (United States) - en-US`
- App or game: `App`
- Free or paid: `Free` (recommended for current build)

## 2) App content
### Privacy policy
- Privacy policy URL: host and paste your final policy URL
- Template to finalize: `docs/play-store/privacy-policy-template.md`

### Ads
- Does your app contain ads?: `No`

### App access
- All functionality available without credentials?: `Yes`

### Content rating
- Category likely: `Education`
- Questionnaire: no violence, sexual content, gambling, drugs, user-generated content

### Target audience and content
- Age groups (recommended): `13-15`, `16-17`, `18+`
- Child-directed: `No`

### News apps
- Is this a news app?: `No`

### Health apps (if shown)
- Is this a health app collecting health data?: `No`

## 3) Data safety (based on current app)
- Does your app collect/share required user data?: `No` (verify if you add analytics/backend later)
- Data is processed ephemerally only?: `No` (local persistence exists)
- Security practices:
  - Data encrypted in transit: `Not applicable` for no server-side collection
  - Account deletion mechanism: `Not applicable` (no account)

Reference draft: `docs/play-store/data-safety-declarations.md`

## 4) Store presence -> Main store listing
### App details
- App name: `Lignum`
- Short description:
  `Grow your forest while learning trees through bite-size lessons and quizzes.`
- Full description:
  `Lignum is a micro-learning app that helps you discover tree species in a fun, visual way.

  What you can do:
  - Build your personal forest by planting trees you learn about
  - Explore a tree encyclopedia with clear, practical facts
  - Test your knowledge with short quizzes
  - Unlock a premium set of rare and ancient trees in this build

  Designed for learners, nature fans, and curious minds, Lignum turns daily learning into a simple habit.`

### Graphics (must upload)
- App icon: `512 x 512` PNG
- Feature graphic: `1024 x 500`
- Phone screenshots: at least 2
- 7-inch tablet screenshots: recommended

## 5) Testing tracks
### Internal testing (first)
- Create internal test release and upload the AAB.
- Add tester emails.

### Closed testing (if required by your account)
- Create closed testing track and upload same AAB.
- Add testers and complete required duration before production access request.

## 6) Production release
- Create production release
- Upload AAB: `app-release.aab`
- Release name: `1.0 (1)`
- Release notes (en-US):
  `Initial Android release of Lignum with forest learning, encyclopedia, and quiz modes.`

## 7) Important policy notes for this build
- External payment links are removed from app UI.
- If you later sell digital content, implement Google Play Billing before release.

## 8) Final upload sequence (recommended)
1. Complete App content + Data safety + Privacy policy URL
2. Complete Main store listing + graphics
3. Upload AAB to Internal test
4. Run smoke test from Play-distributed build
5. Move to Closed test or Production per account gating
6. Submit for review
