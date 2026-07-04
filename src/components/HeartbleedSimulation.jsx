/**
 * HeartbleedSimulation.jsx
 *
 * Interactive Heartbleed (CVE-2014-0160) simulation. Renders one of three
 * stages depending on the `stage` prop:
 *   - "healthy"   Stage 1: a normal heartbeat request/response
 *   - "attack"    Stage 2: a malformed heartbeat leaking server memory
 *   - "aftermath" Stage 3: the fallout across the wider web
 */

import { useState } from "react";
import HeartWireframe from "./heartbleed/HeartWireframe";
import WireframeGlobe from "./heartbleed/WireframeGlobe";

function InfoCallout({ title, accent = "primary", className = "", children }) {
  const accentClass = {
    primary: "border-hb-primary text-hb-primary",
    cyan: "border-hb-cyan text-hb-cyan",
    secondary: "border-hb-secondary text-hb-secondary",
  }[accent];

  return (
    <div
      className={`w-56 rounded-md border bg-hb-bg/95 font-body text-xs shadow-lg shadow-black/40 ${accentClass} ${className}`}
    >
      <div
        className={`flex items-center gap-1.5 border-b px-3 py-1.5 font-heading text-[10px] uppercase tracking-wide ${accentClass}`}
      >
        <span aria-hidden="true">✕</span>
        {title}
      </div>
      <div className="px-3 py-2 leading-relaxed text-white/85">{children}</div>
    </div>
  );
}

function LeakDrip({ active, count = 16, colorClass = "text-hb-red" }) {
  if (!active) return null;
  const drops = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.round((i / count) * 100 + ((i % 3) - 1) * 3),
    delay: ((i * 0.37) % 2).toFixed(2),
    duration: (1.6 + ((i * 0.53) % 1.4)).toFixed(2),
    char: i % 2 === 0 ? "1" : "0",
  }));

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden"
      aria-hidden="true"
    >
      {drops.map((d) => (
        <span
          key={d.id}
          className={`animate-drip absolute top-0 font-heading text-xs ${colorClass}`}
          style={{
            left: `${d.left}%`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        >
          {d.char}
        </span>
      ))}
    </div>
  );
}

function StageHealthy() {
  const [pulseKey, setPulseKey] = useState(0);
  const send = () => setPulseKey((k) => k + 1);
  const sent = pulseKey > 0;

  return (
    <div className="relative rounded-lg border border-hb-primary/30 bg-hb-bg p-6 font-body text-white sm:p-10">
      <p className="mb-6 font-heading text-xs uppercase tracking-widest text-hb-secondary">
        Stage 01 — Healthy Server
      </p>

      <button
        type="button"
        onClick={send}
        className="absolute right-4 top-4 flex items-center gap-2 rounded-md border border-hb-primary px-3 py-1.5 font-heading text-xs text-hb-primary transition-colors hover:bg-hb-primary/10 sm:right-6 sm:top-6"
      >
        <span aria-hidden="true">♡</span> Send Heartbeat
      </button>

      <div className="flex justify-center py-6">
        <HeartWireframe key={pulseKey} color="#ff279e" pulse="normal" />
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 font-heading text-xs sm:flex-row sm:gap-6 sm:text-sm">
        <div className="text-center">
          <div className="text-hb-cyan">CLIENT →</div>
          <div className="text-white/90">heartbeat(payload=3, &quot;HEY&quot;)</div>
        </div>

        <div className="text-hb-secondary" aria-hidden="true">
          ───────▶
        </div>

        <div className="min-h-[2.5rem] text-center">
          <div className="text-hb-secondary">SERVER →</div>
          {sent ? (
            <div key={pulseKey} className="animate-reveal text-white/90">
              &quot;HEY&quot; ✓ (3 bytes)
            </div>
          ) : (
            <div className="text-white/30">awaiting request…</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StageAttack() {
  const [leaking, setLeaking] = useState(false);
  const trigger = () => setLeaking(true);

  const leaks = [
    { label: "user:admin", delay: "0.1s" },
    { label: "pk: -----BE", delay: "0.5s" },
    { label: "tok:a9f3c...", delay: "0.9s" },
  ];

  return (
    <div className="relative overflow-hidden rounded-lg border border-hb-red/30 bg-hb-bg p-6 font-body text-white sm:p-10">
      <p className="mb-6 font-heading text-xs uppercase tracking-widest text-hb-secondary">
        Stage 02 — Under Attack
      </p>

      <div className="grid gap-6 lg:grid-cols-[14rem_1fr_14rem]">
        <div className="flex flex-col gap-4">
          <InfoCallout title="what went wrong">
            Client claims payload = 64,000 bytes but sends only 3. OpenSSL trusts
            the claimed length.
          </InfoCallout>
          <InfoCallout title="the bleed" accent="secondary">
            Server allocates a 64KB response buffer, copying adjacent process
            memory to fill the gap.
          </InfoCallout>
        </div>

        <div className="relative flex flex-col items-center justify-start">
          <HeartWireframe
            color="#ff3131"
            pulse={leaking ? "fast" : "normal"}
            onClick={trigger}
          />

          <div className="relative mt-2 h-24 w-full">
            <LeakDrip active={leaking} />
            {leaking && (
              <div className="flex flex-col items-center gap-1 pt-6 font-heading text-xs text-hb-red">
                {leaks.map((leak) => (
                  <span
                    key={leak.label}
                    className="animate-reveal"
                    style={{ animationDelay: leak.delay }}
                  >
                    {leak.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:items-end">
          <InfoCallout title="what leaks" accent="cyan" className="lg:text-right">
            session tokens · private keys · passwords · cookies
          </InfoCallout>

          <button
            type="button"
            onClick={trigger}
            className="mt-auto w-56 rounded-md border border-hb-primary px-3 py-2 text-center font-heading text-xs text-hb-primary transition-colors hover:bg-hb-primary/10"
          >
            Click heart to send malformed request ↗
          </button>
        </div>
      </div>
    </div>
  );
}

function StageAftermath() {
  const [selected, setSelected] = useState("yahoo");

  const markers = {
    imgur: {
      label: "Imgur",
      left: "18%",
      detail: "Patched same day OpenSSL 1.0.1g shipped; no confirmed data loss reported.",
    },
    lastpass: {
      label: "LastPass",
      left: "38%",
      detail: "Prompted users to rotate their master passwords as a precaution.",
    },
    yahoo: {
      label: "Yahoo",
      left: "78%",
      detail: "500M+ accounts · patched: Apr 8, 2014",
      warn: true,
    },
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-hb-secondary/30 bg-hb-bg p-6 font-body text-white sm:p-10">
      <p className="mb-6 font-heading text-xs uppercase tracking-widest text-hb-secondary">
        Stage 03 — The Aftermath
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_14rem]">
        <div className="relative">
          <div className="relative flex justify-center pb-4">
            <HeartWireframe color="#ff279e" size={140} pulse="normal" />
            <div className="absolute inset-0">
              <LeakDrip active count={10} colorClass="text-hb-primary" />
            </div>
          </div>

          <div className="relative flex justify-center">
            <WireframeGlobe />

            {Object.entries(markers).map(([key, marker]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                style={{ left: marker.left }}
                className={`absolute top-1/3 flex -translate-x-1/2 flex-col items-center gap-1 font-heading text-[11px] ${
                  marker.warn ? "text-hb-red" : "text-white/70"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full border ${
                    selected === key
                      ? "border-white bg-hb-red"
                      : "border-white/50 bg-black/40"
                  }`}
                  aria-hidden="true"
                />
                {marker.label}
              </button>
            ))}
          </div>

          <div className="mt-4 min-h-[3rem] text-center font-heading text-xs text-hb-red">
            {markers[selected]?.detail}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <InfoCallout title="The patch" accent="primary">
            OpenSSL 1.0.1g, released April 7, 2014, added the missing bounds
            check on the TLS heartbeat extension.
          </InfoCallout>
          <InfoCallout title="Affected OSes" accent="secondary">
            Most major Linux distributions (Ubuntu, Debian, CentOS, RHEL) had
            to patch OpenSSL and reissue TLS certificates.
          </InfoCallout>
          <InfoCallout title="OpenSSL funding" accent="cyan">
            Heartbleed exposed how underfunded OpenSSL was, prompting the
            Linux Foundation's Core Infrastructure Initiative.
          </InfoCallout>
        </div>
      </div>
    </div>
  );
}

export default function HeartbleedSimulation({ stage = "healthy" }) {
  if (stage === "attack") return <StageAttack />;
  if (stage === "aftermath") return <StageAftermath />;
  return <StageHealthy />;
}
