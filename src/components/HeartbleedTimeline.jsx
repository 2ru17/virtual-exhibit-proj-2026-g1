/**
 * HeartbleedTimeline.jsx
 *
 * Placeholder for the Heartbleed (CVE-2014-0160) historical timeline
 * (bug introduced -> discovered -> disclosed/patched -> aftermath).
 *
 * TODO: replace placeholder events with real dates/sources and add
 * interactivity (e.g. scroll-driven or clickable markers).
 */

const TIMELINE_EVENTS = [
  { date: "2011-12", label: "A developer commits the heartbeat extension code to OpenSSL, quietly introducing the missing bounds check." },
  { date: "2014-04-01", label: "Researchers at Codenomicon and Google independently discover the bug and privately notify the OpenSSL team." },
  { date: "2014-04-07", label: "CVE-2014-0160 is publicly disclosed alongside a patched OpenSSL release; administrators worldwide race to patch." },
  { date: "2014-04", label: "The Core Infrastructure Initiative is formed, with major tech companies pledging millions to fund critical open-source security." },
  { date: "2015", label: "OpenSSL adopts more rigorous testing and review processes in Heartbleed's aftermath." },
  { date: "2015+", label: "The bug becomes a wake-up call for memory-safe languages, and TLS 1.3 is developed with stronger security properties." },
];
export default function HeartbleedTimeline({ events = TIMELINE_EVENTS }) {
  return (
    <div className="font-body text-white bg-hb-bg border border-hb-secondary/40 rounded-lg p-8">
      <p className="font-heading text-hb-secondary text-sm tracking-widest uppercase mb-4">
        Historical Timeline
      </p>

      <ol className="space-y-3">
        {events.map((event) => (
          <li
            key={event.date}
            className="flex gap-4 border-l-2 border-hb-primary/60 pl-4"
          >
            <span className="font-heading text-hb-cyan shrink-0">{event.date}</span>
            <span className="text-white/80">{event.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
