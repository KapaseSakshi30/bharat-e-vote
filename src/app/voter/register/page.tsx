"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { repo } from "@/lib/data/repository";

export default function VoterRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    voterId: "",
    constituency: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await repo.registerVoter(form);
      router.push("/voter/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-12 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Register as a voter</CardTitle>
          <CardDescription>
            Link your EPIC number so officers can verify you against the roll.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voterId">EPIC / voter ID</Label>
              <Input
                id="voterId"
                value={form.voterId}
                onChange={(e) => update("voterId", e.target.value)}
                placeholder="e.g. ABC1234567"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="constituency">Constituency</Label>
              <Input
                id="constituency"
                value={form.constituency}
                onChange={(e) => update("constituency", e.target.value)}
                placeholder="e.g. Pune Central"
                required
              />
            </div>
            {error && (
              <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800 sm:col-span-2" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="sm:col-span-2" disabled={loading}>
              {loading ? "Creating account…" : "Create voter account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-ink/60">
            Already registered?{" "}
            <Link href="/voter/login" className="font-semibold text-leaf hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
