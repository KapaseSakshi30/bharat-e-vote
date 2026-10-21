"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/status-block";
import { readSession, repo } from "@/lib/data/repository";
import type { Candidate, Election } from "@/lib/types";

export default function AdminCandidatesPage() {
  const router = useRouter();
  const [elections, setElections] = useState<Election[]>([]);
  const [electionId, setElectionId] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    party: "",
    symbol: "",
    manifesto: "",
  });
  const [saving, setSaving] = useState(false);

  async function bootstrap() {
    setLoading(true);
    setError(null);
    try {
      const session = readSession();
      if (!session || session.kind !== "admin") {
        router.replace("/admin/login");
        return;
      }
      const els = await repo.listElections();
      setElections(els);
      const first = els[0]?.id ?? "";
      setElectionId(first);
      if (first) setCandidates(await repo.listCandidates(first));
      else setCandidates([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSelectElection(id: string) {
    setElectionId(id);
    setLoading(true);
    try {
      setCandidates(await repo.listCandidates(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!electionId) {
      setError("Create an election first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await repo.createCandidate({ electionId, ...form });
      setForm({ name: "", party: "", symbol: "", manifesto: "" });
      setCandidates(await repo.listCandidates(electionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add candidate.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await repo.deleteCandidate(id);
      setCandidates(await repo.listCandidates(electionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Candidates</h1>
          <p className="mt-1 text-sm text-ink/60">Attach ballot options to an election.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Back to portal</Link>
        </Button>
      </div>

      <div className="mb-6">
        <Label htmlFor="election">Election</Label>
        <select
          id="election"
          className="mt-2 flex h-11 w-full max-w-md rounded-md border border-ink/15 bg-white px-3 text-sm"
          value={electionId}
          onChange={(e) => void onSelectElection(e.target.value)}
        >
          {elections.length === 0 && <option value="">No elections</option>}
          {elections.map((el) => (
            <option key={el.id} value={el.id}>
              {el.title} ({el.status})
            </option>
          ))}
        </select>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add candidate</CardTitle>
          <CardDescription>Name, party, election symbol, and short manifesto.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onCreate}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="party">Party</Label>
              <Input
                id="party"
                value={form.party}
                onChange={(e) => setForm({ ...form, party: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="manifesto">Manifesto summary</Label>
              <Input
                id="manifesto"
                value={form.manifesto}
                onChange={(e) => setForm({ ...form, manifesto: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={saving || !electionId}>
              {saving ? "Adding…" : "Add to ballot"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorBlock message={error} onRetry={bootstrap} />}
      {!loading && !error && candidates.length === 0 && (
        <EmptyBlock
          title="No candidates"
          description="Add the first candidate for the selected election."
        />
      )}
      {!loading && candidates.length > 0 && (
        <ul className="space-y-3">
          {candidates.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-3 rounded-xl border border-ink/10 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-display text-lg text-ink">{c.name}</p>
                <p className="text-sm text-ink/55">
                  {c.party} · {c.symbol}
                </p>
                <p className="mt-1 text-sm text-ink/70">{c.manifesto}</p>
              </div>
              <Button size="sm" variant="danger" onClick={() => onDelete(c.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
