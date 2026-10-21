import type {
  Admin,
  Candidate,
  Election,
  Tallies,
  Vote,
  Voter,
} from "@/lib/types";

const STORAGE_KEY = "bharat-e-vote-mock-v1";

type StoreShape = {
  voters: Voter[];
  admins: Admin[];
  elections: Election[];
  candidates: Candidate[];
  votes: Vote[];
  passwords: Record<string, string>;
};

function seed(): StoreShape {
  const now = new Date();
  const inSeven = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    passwords: {
      "voter@demo.in": "voter123",
      "admin@demo.in": "admin123",
    },
    voters: [
      {
        uid: "voter-demo-1",
        name: "Aarav Sharma",
        email: "voter@demo.in",
        voterId: "ABC1234567",
        constituency: "Pune Central",
        createdAt: now.toISOString(),
      },
    ],
    admins: [
      {
        uid: "admin-demo-1",
        name: "Election Officer",
        email: "admin@demo.in",
        role: "admin",
      },
    ],
    elections: [
      {
        id: "el-lok-sabha-demo",
        title: "Lok Sabha — Pune Central",
        description:
          "Cast your vote for the Member of Parliament representing Pune Central. One vote per registered elector.",
        constituency: "Pune Central",
        status: "open",
        startAt: now.toISOString(),
        endAt: inSeven.toISOString(),
      },
      {
        id: "el-mla-draft",
        title: "Vidhan Sabha — Kothrud",
        description:
          "Assembly election for Kothrud. Currently in draft — open it from the admin portal when ballots are ready.",
        constituency: "Kothrud",
        status: "draft",
        startAt: now.toISOString(),
        endAt: inSeven.toISOString(),
      },
      {
        id: "el-closed-demo",
        title: "Municipal Ward 12 — Sample Closed Poll",
        description:
          "A completed local body poll used to demonstrate published results.",
        constituency: "Ward 12",
        status: "closed",
        startAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    candidates: [
      {
        id: "c-1",
        electionId: "el-lok-sabha-demo",
        name: "Meera Deshmukh",
        party: "Progress Front",
        symbol: "Lotus",
        manifesto: "Transit-first city, youth apprenticeships, cleaner rivers.",
      },
      {
        id: "c-2",
        electionId: "el-lok-sabha-demo",
        name: "Rohit Patil",
        party: "People's Alliance",
        symbol: "Hand",
        manifesto: "Affordable housing, MSME credit, digital public services.",
      },
      {
        id: "c-3",
        electionId: "el-lok-sabha-demo",
        name: "Sana Qureshi",
        party: "Civic Unity",
        symbol: "Lamp",
        manifesto: "Campus safety, open data budgets, local climate action.",
      },
      {
        id: "c-4",
        electionId: "el-closed-demo",
        name: "Karan Joshi",
        party: "Neighbourhood First",
        symbol: "Tree",
        manifesto: "Ward parks and waste segregation.",
      },
      {
        id: "c-5",
        electionId: "el-closed-demo",
        name: "Nisha Kulkarni",
        party: "City Voice",
        symbol: "Cycle",
        manifesto: "Safer crossings and street lighting.",
      },
    ],
    votes: [
      {
        id: "admin-demo-1_el-closed-demo",
        electionId: "el-closed-demo",
        voterUid: "seed-voter-a",
        candidateId: "c-4",
        castAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "seed-voter-b_el-closed-demo",
        electionId: "el-closed-demo",
        voterUid: "seed-voter-b",
        candidateId: "c-5",
        castAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "seed-voter-c_el-closed-demo",
        electionId: "el-closed-demo",
        voterUid: "seed-voter-c",
        candidateId: "c-4",
        castAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };
}

function read(): StoreShape {
  if (typeof window === "undefined") return seed();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw) as StoreShape;
  } catch {
    const initial = seed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function write(store: StoreShape) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export const mockStore = {
  reset() {
    const initial = seed();
    write(initial);
    return initial;
  },

  async signInVoter(email: string, password: string) {
    const store = read();
    if (store.passwords[email] !== password) {
      throw new Error("Invalid email or password.");
    }
    const voter = store.voters.find((v) => v.email === email);
    if (!voter) throw new Error("No voter profile found for this account.");
    return voter;
  },

  async registerVoter(input: {
    name: string;
    email: string;
    password: string;
    voterId: string;
    constituency: string;
  }) {
    const store = read();
    if (store.voters.some((v) => v.email === input.email)) {
      throw new Error("An account with this email already exists.");
    }
    if (store.voters.some((v) => v.voterId === input.voterId)) {
      throw new Error("This EPIC / voter ID is already registered.");
    }
    const voter: Voter = {
      uid: id("voter"),
      name: input.name,
      email: input.email,
      voterId: input.voterId.toUpperCase(),
      constituency: input.constituency,
      createdAt: new Date().toISOString(),
    };
    store.voters.push(voter);
    store.passwords[input.email] = input.password;
    write(store);
    return voter;
  },

  async signInAdmin(email: string, password: string) {
    const store = read();
    if (store.passwords[email] !== password) {
      throw new Error("Invalid email or password.");
    }
    const admin = store.admins.find((a) => a.email === email);
    if (!admin) throw new Error("This account is not listed as an admin.");
    return admin;
  },

  async listElections() {
    return read().elections.sort((a, b) => b.startAt.localeCompare(a.startAt));
  },

  async getElection(electionId: string) {
    const election = read().elections.find((e) => e.id === electionId);
    if (!election) throw new Error("Election not found.");
    return election;
  },

  async listCandidates(electionId: string) {
    return read().candidates.filter((c) => c.electionId === electionId);
  },

  async listVoters() {
    return read().voters;
  },

  async hasVoted(electionId: string, voterUid: string) {
    return read().votes.some(
      (v) => v.electionId === electionId && v.voterUid === voterUid,
    );
  },

  async castVote(electionId: string, voterUid: string, candidateId: string) {
    const store = read();
    const election = store.elections.find((e) => e.id === electionId);
    if (!election) throw new Error("Election not found.");
    if (election.status !== "open") {
      throw new Error("This election is not open for voting.");
    }
    const voteId = `${voterUid}_${electionId}`;
    if (store.votes.some((v) => v.id === voteId)) {
      throw new Error("You have already voted in this election.");
    }
    if (!store.candidates.some((c) => c.id === candidateId && c.electionId === electionId)) {
      throw new Error("Invalid candidate for this election.");
    }
    store.votes.push({
      id: voteId,
      electionId,
      voterUid,
      candidateId,
      castAt: new Date().toISOString(),
    });
    write(store);
  },

  async tallies(electionId: string): Promise<Tallies> {
    const store = read();
    const result: Tallies = {};
    for (const c of store.candidates.filter((x) => x.electionId === electionId)) {
      result[c.id] = 0;
    }
    for (const vote of store.votes.filter((v) => v.electionId === electionId)) {
      result[vote.candidateId] = (result[vote.candidateId] ?? 0) + 1;
    }
    return result;
  },

  async createElection(input: Omit<Election, "id">) {
    const store = read();
    const election: Election = { ...input, id: id("el") };
    store.elections.unshift(election);
    write(store);
    return election;
  },

  async updateElectionStatus(electionId: string, status: Election["status"]) {
    const store = read();
    const election = store.elections.find((e) => e.id === electionId);
    if (!election) throw new Error("Election not found.");
    election.status = status;
    write(store);
    return election;
  },

  async createCandidate(input: Omit<Candidate, "id">) {
    const store = read();
    const candidate: Candidate = { ...input, id: id("c") };
    store.candidates.push(candidate);
    write(store);
    return candidate;
  },

  async deleteCandidate(candidateId: string) {
    const store = read();
    store.candidates = store.candidates.filter((c) => c.id !== candidateId);
    write(store);
  },
};
