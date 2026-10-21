import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Smartphone, Building2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
      <section className="relative overflow-hidden rounded-3xl border border-ink/10 bg-ink text-mist shadow-xl">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(232,106,26,0.45), transparent 40%), radial-gradient(circle at 80% 0%, rgba(15,118,110,0.4), transparent 35%)",
          }}
        />
        <div className="relative grid gap-10 px-6 py-14 sm:px-12 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="animate-fade font-display text-4xl tracking-tight text-saffron sm:text-6xl">
              Bharat E Vote
            </p>
            <h1 className="animate-rise mt-4 max-w-xl text-2xl font-medium leading-snug text-mist sm:text-3xl">
              Android ballots for voters. Web portal for officers.
            </h1>
            <p className="animate-rise-delay mt-4 max-w-lg text-base text-mist/75">
              Electors cast votes in the Kotlin voter app. Election officers manage polls,
              candidates, and tallies here — both share one Firebase project.
            </p>
            <div className="animate-rise-delay mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/admin/login">Open officer portal</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-mist/30 text-mist hover:bg-mist/10"
              >
                <Link href="/voter/login">Web voter demo</Link>
              </Button>
            </div>
          </div>
          <div className="animate-fade relative hidden min-h-[220px] lg:block">
            <div className="absolute inset-0 rounded-2xl border border-mist/15 bg-gradient-to-br from-leaf/30 via-transparent to-saffron/25" />
            <div className="absolute bottom-6 left-6 right-6 space-y-3">
              <div className="rounded-lg border border-mist/20 bg-ink/50 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-mist/50">Voter client</p>
                <p className="mt-1 font-display text-lg text-mist">
                  Kotlin · Compose · Firebase
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg border border-mist/15 bg-mist/10 px-3 py-2 text-xs text-mist/80">
                  Open <code className="text-saffron">android/</code> in Android Studio
                </div>
                <div className="flex-1 rounded-lg border border-mist/15 bg-mist/10 px-3 py-2 text-xs text-mist/80">
                  Officers use this portal
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-8 sm:grid-cols-3">
        {[
          {
            icon: Smartphone,
            title: "Android voter app",
            body: "Login, register with EPIC ID, open ballots, cast one vote, and view results — under android/ in the repo.",
          },
          {
            icon: Building2,
            title: "Officer portal",
            body: "Create elections, add candidates, open or close voting, review voters, and watch tallies update.",
          },
          {
            icon: ShieldCheck,
            title: "Shared Firebase",
            body: "One Auth + Firestore project for both clients, with mock fallbacks until google-services.json / env keys are set.",
          },
        ].map((item) => (
          <div key={item.title} className="space-y-3">
            <item.icon className="h-7 w-7 text-leaf" aria-hidden />
            <h2 className="font-display text-xl text-ink">{item.title}</h2>
            <p className="text-sm leading-relaxed text-ink/65">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
