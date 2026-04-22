import { Link } from "wouter";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  LibraryBig,
} from "lucide-react";

const features = [
  {
    title: "Protect your momentum",
    description:
      "Set a realistic daily page goal and keep leisure reading visible even when classes get demanding.",
    icon: CalendarDays,
  },
  {
    title: "Log in seconds",
    description:
      "Use Quick Log for a fast daily update or Detailed Log when you want to capture more context.",
    icon: Clock,
  },
  {
    title: "See what is moving",
    description:
      "Track pages read, current streak, active books, completed books, and estimated finish dates.",
    icon: BarChart3,
  },
];

const steps = [
  "Add the books you are currently reading.",
  "Log the pages you finish each day.",
  "Use your goals table to see when each book is likely to be completed.",
];

export default function Landing() {
  return (
    <div className="min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <BookOpen size={22} />
          </span>
          <span className="font-serif text-2xl font-semibold tracking-tight">
            Reading Buddy
          </span>
        </Link>
        <Link
          href="/app"
          className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          Open app
        </Link>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-10 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:pb-28 md:pt-16">
          <div className="absolute left-[-10rem] top-14 h-80 w-80 rounded-full bg-secondary/25 blur-3xl" />
          <div className="absolute bottom-6 right-[-8rem] h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-center">
            <p className="mb-5 w-fit rounded-full border border-card-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm">
              Built for college reading lives
            </p>
            <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Keep your leisure reading alive during busy semesters.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              Reading Buddy helps students set daily page goals, log reading
              sessions, organize books, and understand their progress without
              turning reading into another stressful assignment.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/app"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Launch Reading Buddy
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-7 py-4 font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="relative z-10">
            <div className="rounded-[2rem] border border-card-border bg-card p-5 shadow-xl">
              <div className="rounded-[1.5rem] bg-muted/50 p-5">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Today&apos;s goal
                    </p>
                    <h2 className="mt-1 text-3xl font-semibold">25 pages</h2>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <LibraryBig size={26} />
                  </div>
                </div>

                <div className="mt-6 rounded-[1.35rem] bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-serif text-xl font-semibold">
                        Tomorrow, and Tomorrow, and Tomorrow
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        148 of 416 pages complete
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary/25 px-3 py-1 text-xs font-semibold text-foreground">
                      Active
                    </span>
                  </div>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[36%] rounded-full bg-primary" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Estimated finish: May 3
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-[1.25rem] bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Pages today</p>
                    <p className="mt-2 text-3xl font-semibold">48</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Streak</p>
                    <p className="mt-2 text-3xl font-semibold">3 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card/45">
          <div className="mx-auto grid max-w-6xl gap-5 px-5 py-14 md:grid-cols-3 md:px-10">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-[1.75rem] border border-card-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/30 text-foreground">
                    <Icon size={23} />
                  </div>
                  <h3 className="text-2xl font-semibold">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[0.85fr_1.15fr] md:px-10"
        >
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              How it works
            </p>
            <h2 className="max-w-xl text-4xl font-semibold leading-tight md:text-5xl">
              A simple reading routine that fits between lectures, labs, and
              life.
            </h2>
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex gap-4 rounded-[1.5rem] border border-card-border bg-card p-5 shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {index + 1}
                </span>
                <div>
                  <p className="text-lg font-semibold">{step}</p>
                  <p className="mt-2 text-muted-foreground">
                    The app keeps the structure light, so the focus stays on
                    getting back to the next chapter.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 md:px-10">
          <div className="rounded-[2rem] border border-card-border bg-primary p-8 text-primary-foreground shadow-xl md:p-12">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <CheckCircle2 size={24} />
                </div>
                <h2 className="text-4xl font-semibold">
                  Ready to log today&apos;s pages?
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-primary-foreground/85">
                  Open the product to add books, record reading sessions, view
                  goals, and check progress stats.
                </p>
              </div>
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-semibold text-primary shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Run the product
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}