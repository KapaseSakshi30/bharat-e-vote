# Bharat E Vote — Android voter app

Kotlin + Jetpack Compose voter client for **Bharat E Vote**. Shares Firebase Auth + Firestore collections with the Next.js **admin / candidate portal** in the repo root.

## Open in Android Studio

1. Install [Android Studio](https://developer.android.com/studio) (Ladybug or newer recommended).
2. **File → Open** → select the `android/` folder (not the monorepo root).
3. Let Gradle sync. The project builds in **mock mode** without Firebase.

### Demo (mock mode)

| Email | Password |
|-------|----------|
| `voter@demo.in` | `voter123` |

Mock mode is active when `app/google-services.json` is missing. A banner appears on login.

## Connect Firebase

1. Firebase Console → add an **Android** app with package name `com.bharatevote.voter`.
2. Download `google-services.json` → place at `android/app/google-services.json` (never commit secrets).
3. Copy from the template: `android/app/google-services.json.example`.
4. Sync Gradle — the Google Services plugin applies automatically when the file exists (`BuildConfig.USE_FIREBASE = true`).
5. Use the **same** Firebase project as the web portal (shared `voters`, `elections`, `candidates`, `votes`).

See the Project store doc `docs/firebase-setup.md` for Auth, Firestore, and rules.

## Architecture

- **UI:** Jetpack Compose + Material 3
- **Presentation:** ViewModels (`ui/*`)
- **Domain:** models + `VoterRepository`
- **Data:** `FirebaseVoterRepository` or `MockVoterRepository`

Screens: login / register → election list → ballot → results.

## Build from CLI (optional)

```bash
cd android
./gradlew :app:assembleDebug
```

If the Gradle wrapper JAR is missing, open the project once in Android Studio to generate it, or run Android Studio’s “Create Gradle wrapper” action.
