"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ElectionCard } from "@/components/election-card";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/status-block";
import { readSession, repo } from "@/lib/data/repository";
import type { Election, SessionUser } from "@/lib/types";

export default function VoterDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const session = readSession();
      if (!session || session.kind !== "voter") {
        router.replace("/voter/login");
        return;
      }
      setUser(session);
      const list = await repo.listElections();
      setElections(list.filter((e) => e.status !== "draft"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load elections.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Your ballot box</h1>
        <p className="mt-2 text-ink/60">
          {user
            ? `Welcome, ${user.displayName}. Open elections appear below.`
            : "Loading your session…"}
        </p>
      </div>

      {loading && <LoadingBlock label="Fetching elections…" />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}
      {!loading && !error && elections.length === 0 && (
        <EmptyBlock
          title="No elections yet"
          description="When an officer opens a poll for your constituency, it will show up here."
        />
      )}
      {!loading && !error && elections.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          {elections.map((election) => (
            <ElectionCard
              key={election.id}
              election={election}
              href={
                election.status === "open"
                  ? `/voter/elections/${election.id}`
                  : `/voter/results/${election.id}`
              }
              actionLabel={election.status === "open" ? "Open ballot" : "View results"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
