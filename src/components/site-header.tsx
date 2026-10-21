"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { readSession, repo } from "@/lib/data/repository";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/types";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(readSession());
  }, [pathname]);

  async function logout() {
    await repo.signOut();
    setUser(null);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-mist/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-tight text-ink transition-colors group-hover:text-leaf">
            Bharat E Vote
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          {user?.kind === "voter" && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/voter/dashboard">My ballot</Link>
            </Button>
          )}
          {user?.kind === "admin" && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">Portal</Link>
            </Button>
          )}
          {user ? (
            <>
              <span className="hidden text-sm text-ink/60 sm:inline">
                {user.displayName}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/voter/login">Voter</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/admin/login">Admin</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
