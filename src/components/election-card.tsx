import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Election } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const statusVariant = {
  open: "open",
  draft: "draft",
  closed: "closed",
} as const;

export function ElectionCard({
  election,
  href,
  actionLabel,
}: {
  election: Election;
  href: string;
  actionLabel: string;
}) {
  return (
    <Card className="transition-transform duration-300 hover:-translate-y-0.5">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{election.title}</CardTitle>
          <Badge variant={statusVariant[election.status]}>
            {election.status}
          </Badge>
        </div>
        <CardDescription>{election.constituency}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-ink/70">{election.description}</p>
        <p className="text-xs text-ink/45">
          {formatDate(election.startAt)} → {formatDate(election.endAt)}
        </p>
        <Button asChild size="sm">
          <Link href={href}>{actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
