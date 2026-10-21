"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/status-block";
import { readSession, repo } from "@/lib/data/repository";
import type { Election, ElectionStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminElectionsPage() {
  const router = useRouter();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    constituency: "",
    startAt: "",
    endAt: "",
  });
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const session = readSession();
      if (!session || session.kind !== "admin") {
        router.replace("/admin/login");
        return;
      }
      setElections(await repo.listElections());
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

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await repo.createElection({
        title: form.title,
        description: form.description,
        constituency: form.constituency,
        status: "draft",
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
      });
      setForm({ title: "", description: "", constituency: "", startAt: "", endAt: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create election.");
    } finally {
      setCreating(false);
    }
  }

  async function setStatus(id: string, status: ElectionStatus) {
    try {
      await repo.updateElectionStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Elections</h1>
          <p className="mt-1 text-sm text-ink/60">Create polls and control voting phases.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Back to portal</Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>New election</CardTitle>
          <CardDescription>Starts in draft until you open voting.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onCreate}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="constituency">Constituency</Label>
              <Input
                id="constituency"
                value={form.constituency}
                onChange={(e) => setForm({ ...form, constituency: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startAt">Starts</Label>
              <Input
                id="startAt"
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endAt">Ends</Label>
              <Input
                id="endAt"
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={creating}>
                {creating ? "Saving…" : "Create draft"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && <LoadingBlock />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}
      {!loading && !error && elections.length === 0 && (
        <EmptyBlock
          title="No elections"
          description="Create your first draft election using the form above."
        />
      )}
      {!loading && elections.length > 0 && (
        <ul className="space-y-4">
          {elections.map((el) => (
            <li
              key={el.id}
              className="flex flex-col gap-4 rounded-xl border border-ink/10 bg-white/90 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-display text-xl text-ink">{el.title}</p>
                  <Badge
                    variant={
                      el.status === "open" ? "open" : el.status === "closed" ? "closed" : "draft"
                    }
                  >
                    {el.status}
                  </Badge>
                </div>
                <p className="text-sm text-ink/55">
                  {el.constituency} · {formatDate(el.startAt)} → {formatDate(el.endAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {el.status === "draft" && (
                  <Button size="sm" onClick={() => setStatus(el.id, "open")}>
                    Open voting
                  </Button>
                )}
                {el.status === "open" && (
                  <Button size="sm" variant="secondary" onClick={() => setStatus(el.id, "closed")}>
                    Close & publish
                  </Button>
                )}
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/results/${el.id}`}>Tallies</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
