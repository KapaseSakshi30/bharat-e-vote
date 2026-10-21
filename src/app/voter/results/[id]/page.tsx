"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ErrorBlock, LoadingBlock, EmptyBlock } from "@/components/status-block";
import { readSession, repo } from "@/lib/data/repository";
import type { Candidate, Election, Tallies } from "@/lib/types";

export default function VoterResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [tallies, setTallies] = useState<Tallies>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const session = readSession();
      if (!session) {
        router.replace("/voter/login");
        return;
      }
      const [el, cans, counts] = await Promise.all([
        repo.getElection(id),
        repo.listCandidates(id),
        repo.tallies(id),
      ]);
      setElection(el);
      setCandidates(cans);
      setTallies(counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load results.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <LoadingBlock label="Counting ballots…" />
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorBlock message={error ?? "Election not found."} onRetry={load} />
      </div>
    );
  }

  const total = Object.values(tallies).reduce((a, b) => a + b, 0);
  const sorted = [...candidates].sort(
    (a, b) => (tallies[b.id] ?? 0) - (tallies[a.id] ?? 0),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge variant={election.status === "closed" ? "closed" : "open"}>
          {election.status === "closed" ? "Final results" : "Live tally"}
        </Badge>
        <span className="text-sm text-ink/50">{total} votes counted</span>
      </div>
      <h1 className="font-display text-3xl text-ink">{election.title}</h1>
      <p className="mt-2 text-ink/60">{election.constituency}</p>

      {sorted.length === 0 ? (
        <div className="mt-8">
          <EmptyBlock
            title="No candidates on the ballot"
            description="Results will appear once candidates are added and votes are cast."
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {sorted.map((c, index) => {
            const count = tallies[c.id] ?? 0;
            const pct = total === 0 ? 0 : Math.round((count / total) * 100);
            return (
              <li
                key={c.id}
                className="overflow-hidden rounded-xl border border-ink/10 bg-white/90"
              >
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="font-display text-lg text-ink">
                      {index === 0 && total > 0 ? "★ " : ""}
                      {c.name}
                    </p>
                    <p className="text-sm text-ink/55">
                      {c.party} · {c.symbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ink">{count}</p>
                    <p className="text-xs text-ink/45">{pct}%</p>
                  </div>
                </div>
                <div className="h-2 bg-ink/5">
                  <div
                    className="h-full bg-leaf transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
