/**
 * HeartbleedTimeline.jsx
 *
 * Placeholder for the Heartbleed (CVE-2014-0160) historical timeline
 * (bug introduced -> discovered -> disclosed/patched -> aftermath).
 *
 * TODO: replace placeholder events with real dates/sources and add
 * interactivity (e.g. scroll-driven or clickable markers).
 */

const PLACEHOLDER_EVENTS = [
  { date: "2012", label: "TODO: vulnerable code introduced into OpenSSL" },
  { date: "2014-04-01", label: "TODO: bug discovered / privately reported" },
  { date: "2014-04-07", label: "TODO: public disclosure + patched release" },
  { date: "2014+", label: "TODO: aftermath — affected services, fallout" },
];

export default function HeartbleedTimeline({ events = PLACEHOLDER_EVENTS }) {
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
