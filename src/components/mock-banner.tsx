"use client";

import { usingMock } from "@/lib/data/repository";
import { useEffect, useState } from "react";

export function MockBanner() {
  const [mock, setMock] = useState(false);
  useEffect(() => {
    setMock(usingMock());
  }, []);
  if (!mock) return null;
  return (
    <div className="border-b border-amber-700/20 bg-amber-100 px-4 py-2 text-center text-sm text-amber-950">
      Running in <strong>local mock mode</strong> — add{" "}
      <code className="rounded bg-amber-200/80 px-1">NEXT_PUBLIC_FIREBASE_*</code>{" "}
      keys to connect Firebase. Demo voter:{" "}
      <code className="rounded bg-amber-200/80 px-1">voter@demo.in</code> /{" "}
      <code className="rounded bg-amber-200/80 px-1">voter123</code> · Admin:{" "}
      <code className="rounded bg-amber-200/80 px-1">admin@demo.in</code> /{" "}
      <code className="rounded bg-amber-200/80 px-1">admin123</code>
    </div>
  );
}
