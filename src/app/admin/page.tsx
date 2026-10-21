"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBlock, LoadingBlock } from "@/components/status-block";
import { readSession, repo } from "@/lib/data/repository";
import type { Election, SessionUser, Voter } from "@/lib/types";

export default function AdminHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
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
      setUser(session);
      const [els, vs] = await Promise.all([repo.listElections(), repo.listVoters()]);
      setElections(els);
      setVoters(vs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portal.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCount = elections.filter((e) => e.status === "open").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Election portal</h1>
          <p className="mt-2 text-ink/60">
            {user ? `Signed in as ${user.displayName}` : "Loading…"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/elections">Manage elections</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/candidates">Candidates</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/voters">Voters</Link>
          </Button>
        </div>
      </div>

      {loading && <LoadingBlock label="Loading portal…" />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}
      {!loading && !error && (
        <div className="grid gap-5 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Elections</CardDescription>
              <CardTitle className="text-3xl">{elections.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-ink/60">
              {openCount} currently open for voting
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Registered voters</CardDescription>
              <CardTitle className="text-3xl">{voters.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-ink/60">
              Profiles synced from Auth + Firestore
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Quick action</CardDescription>
              <CardTitle className="text-lg">Open a draft poll</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link href="/admin/elections">Go to elections</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
