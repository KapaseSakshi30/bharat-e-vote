# Bharat E Vote

Secure digital voting for Indian elections — a **voter ballot** and **election officer portal** in one responsive web app.

Built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Firebase Auth + Firestore**. When Firebase env vars are missing, the app runs in **local mock mode** with demo accounts and seed elections.

## Features

- **Voter:** register with EPIC ID, sign in, open ballots, cast one vote per election, view results
- **Admin portal:** create elections, add candidates, open/close voting, review voters, watch tallies
- **Empty / loading / error** states on list and detail flows
- Works on **mobile and desktop**

## Quick start

```bash
npm install
npm run dev -- --port 43147
```

Open [http://127.0.0.1:43147](http://127.0.0.1:43147).

### Demo accounts (mock mode)

| Role  | Email           | Password  |
|-------|-----------------|-----------|
| Voter | `voter@demo.in` | `voter123` |
| Admin | `admin@demo.in` | `admin123` |

## Firebase

1. Copy `.env.example` → `.env.local` and paste your Firebase web config (`NEXT_PUBLIC_FIREBASE_*`).
2. Enable **Email/Password** Auth and create a **Firestore** database.
3. Add an `admins/{uid}` document for portal users.
4. Deploy the sample security rules from the project Firebase setup doc.

Full console steps and sample rules: see `docs` in the Project store, or the summary below.

### Collections

`voters`, `admins`, `elections`, `candidates`, `votes`

Vote document IDs use `{voterUid}_{electionId}` so each elector can vote once per election.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (add `-- --port 43147`) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Spec note

The original Android assignment PDF was not available in the build environment. This slice implements the Project brief: voter + admin surfaces, Firebase-shaped data, and a runnable mock fallback. Native Android can be layered later against the same Firestore model.

## License

MIT
