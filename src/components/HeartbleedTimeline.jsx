const DEFAULT_EVENTS = [
    {
        date: "Dec 2011",
        title: "Vulnerable Heartbeat Logic Introduced",
        description: "A missing bounds check entered production OpenSSL code.",
        significance: "Bug seeded",
    },
    {
        date: "Apr 2014",
        title: "Discovery and Public Disclosure",
        description:
            "The vulnerability was disclosed and rapidly patched in 1.0.1g.",
        significance: "Emergency response",
    },
];

export default function HeartbleedTimeline({ events = DEFAULT_EVENTS }) {
    return (
        <section className="hb-timeline mt-6 rounded-xl border border-hb-secondary/35 bg-hb-bg px-5 py-6 font-body text-white shadow-[0_10px_24px_rgba(23,14,61,0.32)] sm:px-8 sm:py-8">
            <header className="mb-6 border-b border-hb-primary/25 pb-4">
                <p className="font-heading text-xs uppercase tracking-[0.22em] text-hb-secondary">
                    Timeline View
                </p>
                <h3 className="mt-2 font-heading text-xl text-hb-primary sm:text-2xl">
                    Heartbleed Key Events
                </h3>
            </header>

            <ol
                className="space-y-4"
                aria-label="Heartbleed historical timeline"
            >
                {events.map((event, idx) => (
                    <li
                        key={`${event.date}-${event.title}`}
                        className="group relative rounded-lg border border-hb-primary/25 bg-[linear-gradient(135deg,rgba(255,39,158,0.10),rgba(118,198,215,0.08))] p-4 sm:p-5"
                    >
                        <div
                            className="pointer-events-none absolute left-0 top-0 h-full w-1 rounded-l-lg bg-hb-primary/70 transition-colors group-hover:bg-hb-red"
                            aria-hidden="true"
                        />

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-5">
                            <div className="shrink-0">
                                <p className="font-heading text-sm tracking-wide text-hb-cyan sm:text-base">
                                    {event.date}
                                </p>
                                <p className="font-heading text-[0.68rem] uppercase tracking-[0.15em] text-hb-secondary/90">
                                    Event {idx + 1}
                                </p>
                            </div>

                            <div className="min-w-0">
                                <h4 className="font-heading text-base text-white sm:text-lg">
                                    {event.title}
                                </h4>
                                <p className="mt-1 text-sm leading-7 text-white/85 sm:text-[0.98rem]">
                                    {event.description}
                                </p>
                                <p className="mt-2 inline-flex rounded-full border border-hb-cyan/35 bg-hb-cyan/10 px-2.5 py-0.5 font-heading text-[0.68rem] uppercase tracking-[0.13em] text-hb-cyan">
                                    {event.significance}
                                </p>
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
