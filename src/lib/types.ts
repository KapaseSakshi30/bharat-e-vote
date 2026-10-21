export type ElectionStatus = "draft" | "open" | "closed";

export type Voter = {
  uid: string;
  name: string;
  email: string;
  voterId: string;
  constituency: string;
  createdAt: string;
};

export type Admin = {
  uid: string;
  name: string;
  email: string;
  role: "admin";
};

export type Election = {
  id: string;
  title: string;
  description: string;
  constituency: string;
  status: ElectionStatus;
  startAt: string;
  endAt: string;
};

export type Candidate = {
  id: string;
  electionId: string;
  name: string;
  party: string;
  symbol: string;
  manifesto: string;
};

export type Vote = {
  id: string;
  electionId: string;
  voterUid: string;
  candidateId: string;
  castAt: string;
};

export type SessionUser = {
  uid: string;
  email: string;
  displayName: string;
  kind: "voter" | "admin";
};

export type Tallies = Record<string, number>;
