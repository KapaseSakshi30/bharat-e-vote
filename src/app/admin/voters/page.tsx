"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/status-block";
import { readSession, repo } from "@/lib/data/repository";
import type { Voter } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminVotersPage() {
  const router = useRouter();
  const [voters, setVoters] = useState<Voter[]>([]);
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
      setVoters(await repo.listVoters());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load voters.");
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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Voters</h1>
          <p className="mt-1 text-sm text-ink/60">
            Electors who registered through the voter app.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Back to portal</Link>
        </Button>
      </div>

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}
      {!loading && !error && voters.length === 0 && (
        <EmptyBlock
          title="No voters registered"
          description="When electors create accounts, their EPIC IDs and constituencies appear here."
        />
      )}
      {!loading && !error && voters.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white/90">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/5 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">EPIC ID</th>
                <th className="px-4 py-3 font-semibold">Constituency</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {voters.map((v) => (
                <tr key={v.uid} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{v.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{v.voterId}</td>
                  <td className="px-4 py-3 text-ink/70">{v.constituency}</td>
                  <td className="px-4 py-3 text-ink/70">{v.email}</td>
                  <td className="px-4 py-3 text-ink/50">{formatDate(v.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
