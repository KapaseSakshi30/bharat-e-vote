# Bharat E Vote

Secure digital voting for Indian elections.

| Surface | Stack | Path |
|---------|-------|------|
| **Voter app** | Kotlin · Jetpack Compose · MVVM · Firebase | [`android/`](./android/) |
| **Admin / candidate portal** | Next.js · TypeScript · Tailwind · Firebase | repo root (`src/`) |

Both share the same Firestore collections: `voters`, `admins`, `elections`, `candidates`, `votes`.

## Android voter app

```bash
# Open android/ in Android Studio, then Run ▶
# Or (after wrapper is generated):
cd android && ./gradlew :app:assembleDebug
```

- Package: `com.bharatevote.voter`
- Mock mode when `android/app/google-services.json` is missing  
  Demo: `voter@demo.in` / `voter123`
- Template: `android/app/google-services.json.example`
- Details: [`android/README.md`](./android/README.md)

## Web admin portal

```bash
npm install
npm run dev
# → http://127.0.0.1:43147
```

| Role | Email | Password (mock) |
|------|-------|-----------------|
| Admin | `admin@demo.in` | `admin123` |
| Voter (web demo only) | `voter@demo.in` | `voter123` |

Portal routes: `/admin/*` (elections, candidates, voters, tallies). The marketing home also links the legacy web voter flows for demos; **production voters use the Android app**.

## Firebase (both clients)

1. Create one Firebase project.
2. **Web:** copy config into `.env.local` from `.env.example` (`NEXT_PUBLIC_FIREBASE_*`).
3. **Android:** register package `com.bharatevote.voter`, download `google-services.json` → `android/app/`.
4. Enable **Email/Password** Auth + **Firestore** (prefer `asia-south1`).
5. Seed an `admins/{uid}` document for portal officers.
6. Deploy `firestore.rules`.

Full steps: Project store `docs/firebase-setup.md` (or ask the Project for a copy).

Vote document IDs: `{voterUid}_{electionId}` (one ballot per elector per election).

## Spec note

Sakshi Kapase’s resume lists Bharat E-Vote as Android + Ethereum. **This slice uses Firebase** for Auth/Firestore (per Project direction). On-chain voting can be a later phase.

## License

MIT
