"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/status-block";
import { readSession, repo } from "@/lib/data/repository";
import type { Candidate, Election, Tallies } from "@/lib/types";

export default function AdminResultsPage() {
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
      if (!session || session.kind !== "admin") {
        router.replace("/admin/login");
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
      setError(err instanceof Error ? err.message : "Could not load tallies.");
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
        <LoadingBlock label="Loading tallies…" />
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorBlock message={error ?? "Not found"} onRetry={load} />
      </div>
    );
  }

  const total = Object.values(tallies).reduce((a, b) => a + b, 0);
  const sorted = [...candidates].sort(
    (a, b) => (tallies[b.id] ?? 0) - (tallies[a.id] ?? 0),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={election.status === "closed" ? "closed" : "open"}>
            {election.status}
          </Badge>
          <span className="text-sm text-ink/50">{total} total votes</span>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/elections">Back</Link>
        </Button>
      </div>
      <h1 className="font-display text-3xl text-ink">{election.title}</h1>
      <p className="mt-2 text-ink/60">{election.constituency}</p>

      {sorted.length === 0 ? (
        <div className="mt-8">
          <EmptyBlock
            title="No candidates"
            description="Add candidates, then refresh to see vote counts."
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {sorted.map((c) => {
            const count = tallies[c.id] ?? 0;
            const pct = total === 0 ? 0 : Math.round((count / total) * 100);
            return (
              <li key={c.id} className="rounded-xl border border-ink/10 bg-white/90 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-lg">{c.name}</p>
                    <p className="text-sm text-ink/55">
                      {c.party} · {c.symbol}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {count} <span className="text-xs font-normal text-ink/45">({pct}%)</span>
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-ink/5">
                  <div className="h-full rounded-full bg-saffron" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
