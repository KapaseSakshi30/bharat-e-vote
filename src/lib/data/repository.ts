import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/config";
import { mockStore } from "@/lib/data/mock-store";
import type {
  Candidate,
  Election,
  ElectionStatus,
  SessionUser,
  Tallies,
  Voter,
} from "@/lib/types";

const SESSION_KEY = "bharat-e-vote-session";

export function usingMock(): boolean {
  return !isFirebaseConfigured();
}

export function readSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function writeSession(user: SessionUser | null) {
  if (typeof window === "undefined") return;
  if (!user) window.localStorage.removeItem(SESSION_KEY);
  else window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export const repo = {
  usingMock,

  async signInVoter(email: string, password: string): Promise<SessionUser> {
    if (usingMock()) {
      const voter = await mockStore.signInVoter(email, password);
      const session: SessionUser = {
        uid: voter.uid,
        email: voter.email,
        displayName: voter.name,
        kind: "voter",
      };
      writeSession(session);
      return session;
    }
    const auth = getFirebaseAuth()!;
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const db = getFirebaseDb()!;
    const snap = await getDoc(doc(db, "voters", cred.user.uid));
    if (!snap.exists()) {
      await signOut(auth);
      throw new Error("No voter profile found for this account.");
    }
    const data = snap.data() as Voter;
    const session: SessionUser = {
      uid: cred.user.uid,
      email: data.email,
      displayName: data.name,
      kind: "voter",
    };
    writeSession(session);
    return session;
  },

  async registerVoter(input: {
    name: string;
    email: string;
    password: string;
    voterId: string;
    constituency: string;
  }): Promise<SessionUser> {
    if (usingMock()) {
      const voter = await mockStore.registerVoter(input);
      const session: SessionUser = {
        uid: voter.uid,
        email: voter.email,
        displayName: voter.name,
        kind: "voter",
      };
      writeSession(session);
      return session;
    }
    const auth = getFirebaseAuth()!;
    const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
    await updateProfile(cred.user, { displayName: input.name });
    const voter: Voter = {
      uid: cred.user.uid,
      name: input.name,
      email: input.email,
      voterId: input.voterId.toUpperCase(),
      constituency: input.constituency,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(getFirebaseDb()!, "voters", cred.user.uid), voter);
    const session: SessionUser = {
      uid: voter.uid,
      email: voter.email,
      displayName: voter.name,
      kind: "voter",
    };
    writeSession(session);
    return session;
  },

  async signInAdmin(email: string, password: string): Promise<SessionUser> {
    if (usingMock()) {
      const admin = await mockStore.signInAdmin(email, password);
      const session: SessionUser = {
        uid: admin.uid,
        email: admin.email,
        displayName: admin.name,
        kind: "admin",
      };
      writeSession(session);
      return session;
    }
    const auth = getFirebaseAuth()!;
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(getFirebaseDb()!, "admins", cred.user.uid));
    if (!snap.exists()) {
      await signOut(auth);
      throw new Error("This account is not listed as an admin.");
    }
    const data = snap.data();
    const session: SessionUser = {
      uid: cred.user.uid,
      email: (data.email as string) ?? email,
      displayName: (data.name as string) ?? "Admin",
      kind: "admin",
    };
    writeSession(session);
    return session;
  },

  async signOut() {
    writeSession(null);
    if (!usingMock()) {
      const auth = getFirebaseAuth();
      if (auth) await signOut(auth);
    }
  },

  async listElections(): Promise<Election[]> {
    if (usingMock()) return mockStore.listElections();
    const snap = await getDocs(collection(getFirebaseDb()!, "elections"));
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Election, "id">) }))
      .sort((a, b) => b.startAt.localeCompare(a.startAt));
  },

  async getElection(electionId: string): Promise<Election> {
    if (usingMock()) return mockStore.getElection(electionId);
    const snap = await getDoc(doc(getFirebaseDb()!, "elections", electionId));
    if (!snap.exists()) throw new Error("Election not found.");
    return { id: snap.id, ...(snap.data() as Omit<Election, "id">) };
  },

  async listCandidates(electionId: string): Promise<Candidate[]> {
    if (usingMock()) return mockStore.listCandidates(electionId);
    const q = query(
      collection(getFirebaseDb()!, "candidates"),
      where("electionId", "==", electionId),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Candidate, "id">) }));
  },

  async listVoters(): Promise<Voter[]> {
    if (usingMock()) return mockStore.listVoters();
    const snap = await getDocs(collection(getFirebaseDb()!, "voters"));
    return snap.docs.map((d) => d.data() as Voter);
  },

  async hasVoted(electionId: string, voterUid: string): Promise<boolean> {
    if (usingMock()) return mockStore.hasVoted(electionId, voterUid);
    const snap = await getDoc(
      doc(getFirebaseDb()!, "votes", `${voterUid}_${electionId}`),
    );
    return snap.exists();
  },

  async castVote(electionId: string, voterUid: string, candidateId: string) {
    if (usingMock()) return mockStore.castVote(electionId, voterUid, candidateId);
    const db = getFirebaseDb()!;
    const election = await this.getElection(electionId);
    if (election.status !== "open") {
      throw new Error("This election is not open for voting.");
    }
    const voteId = `${voterUid}_${electionId}`;
    const existing = await getDoc(doc(db, "votes", voteId));
    if (existing.exists()) {
      throw new Error("You have already voted in this election.");
    }
    await setDoc(doc(db, "votes", voteId), {
      electionId,
      voterUid,
      candidateId,
      castAt: new Date().toISOString(),
    });
  },

  async tallies(electionId: string): Promise<Tallies> {
    if (usingMock()) return mockStore.tallies(electionId);
    const candidates = await this.listCandidates(electionId);
    const result: Tallies = {};
    for (const c of candidates) result[c.id] = 0;
    const q = query(
      collection(getFirebaseDb()!, "votes"),
      where("electionId", "==", electionId),
    );
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const candidateId = d.data().candidateId as string;
      result[candidateId] = (result[candidateId] ?? 0) + 1;
    });
    return result;
  },

  async createElection(input: Omit<Election, "id">): Promise<Election> {
    if (usingMock()) return mockStore.createElection(input);
    const ref = doc(collection(getFirebaseDb()!, "elections"));
    await setDoc(ref, input);
    return { id: ref.id, ...input };
  },

  async updateElectionStatus(electionId: string, status: ElectionStatus) {
    if (usingMock()) return mockStore.updateElectionStatus(electionId, status);
    await updateDoc(doc(getFirebaseDb()!, "elections", electionId), { status });
    return this.getElection(electionId);
  },

  async createCandidate(input: Omit<Candidate, "id">): Promise<Candidate> {
    if (usingMock()) return mockStore.createCandidate(input);
    const ref = doc(collection(getFirebaseDb()!, "candidates"));
    await setDoc(ref, input);
    return { id: ref.id, ...input };
  },

  async deleteCandidate(candidateId: string) {
    if (usingMock()) return mockStore.deleteCandidate(candidateId);
    await deleteDoc(doc(getFirebaseDb()!, "candidates", candidateId));
  },
};
