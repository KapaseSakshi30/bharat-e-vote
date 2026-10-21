"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/status-block";
import { readSession, repo } from "@/lib/data/repository";
import type { Candidate, Election } from "@/lib/types";

export default function VoterElectionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const session = readSession();
      if (!session || session.kind !== "voter") {
        router.replace("/voter/login");
        return;
      }
      const [el, cans, already] = await Promise.all([
        repo.getElection(id),
        repo.listCandidates(id),
        repo.hasVoted(id, session.uid),
      ]);
      setElection(el);
      setCandidates(cans);
      setVoted(already);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this election.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const session = readSession();
    if (!session) return;
    if (!selected) {
      setError("Select a candidate before casting your vote.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await repo.castVote(id, session.uid, selected);
      setVoted(true);
      setSuccess("Your vote has been recorded. Thank you for participating.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote could not be cast.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <LoadingBlock label="Opening ballot…" />
      </div>
    );
  }

  if (error && !election) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorBlock message={error} onRetry={load} />
      </div>
    );
  }

  if (!election) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge variant={election.status === "open" ? "open" : "closed"}>
          {election.status}
        </Badge>
        <span className="text-sm text-ink/50">{election.constituency}</span>
      </div>
      <h1 className="font-display text-3xl text-ink">{election.title}</h1>
      <p className="mt-3 text-ink/65">{election.description}</p>

      {election.status !== "open" && (
        <div className="mt-8">
          <EmptyBlock
            title="Voting is closed"
            description="This poll is no longer accepting ballots. You can review the published tally instead."
          />
          <Button asChild className="mt-4">
            <Link href={`/voter/results/${election.id}`}>View results</Link>
          </Button>
        </div>
      )}

      {election.status === "open" && voted && (
        <Card className="mt-8 border-leaf/30 bg-leaf/5">
          <CardHeader>
            <CardTitle>Ballot sealed</CardTitle>
            <CardDescription>
              {success ?? "You have already voted in this election. Each elector may vote once."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={`/voter/results/${election.id}`}>Preview live tally</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {election.status === "open" && !voted && (
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          {candidates.length === 0 ? (
            <EmptyBlock
              title="No candidates yet"
              description="Officers have not added candidates to this ballot. Check back shortly."
            />
          ) : (
            candidates.map((c) => (
              <label
                key={c.id}
                className={`flex cursor-pointer gap-4 rounded-xl border bg-white/90 p-4 transition-all ${
                  selected === c.id
                    ? "border-leaf ring-2 ring-leaf/30"
                    : "border-ink/10 hover:border-ink/25"
                }`}
              >
                <input
                  type="radio"
                  name="candidate"
                  className="mt-1"
                  checked={selected === c.id}
                  onChange={() => setSelected(c.id)}
                />
                <div>
                  <p className="font-display text-lg text-ink">{c.name}</p>
                  <p className="text-sm text-ink/55">
                    {c.party} · Symbol: {c.symbol}
                  </p>
                  <p className="mt-2 text-sm text-ink/70">{c.manifesto}</p>
                </div>
              </label>
            ))
          )}
          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
              {error}
            </p>
          )}
          {candidates.length > 0 && (
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Recording vote…" : "Cast my vote"}
            </Button>
          )}
        </form>
      )}
    </div>
  );
}
