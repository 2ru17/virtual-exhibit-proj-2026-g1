/**
 * HeartbleedSimulation.jsx
 *
 * Interactive Heartbleed (CVE-2014-0160) simulation. Renders one of three
 * stages depending on the `stage` prop:
 *   - "healthy"   Stage 1: a normal heartbeat request/response
 *   - "attack"    Stage 2: a malformed heartbeat leaking server memory
 *   - "aftermath" Stage 3: the fallout across the wider web
 */

import { useMemo, useRef, useState } from "react";
import HeartWireframe from "./heartbleed/HeartWireframe";
import WireframeGlobe from "./heartbleed/WireframeGlobe";
import DraggablePopup from "./heartbleed/PopupBoxes";

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

function DigitBurst({ triggerKey }) {
  const digits = useMemo(() => {
    const count = 10;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const distance = 30 + Math.random() * 20;
      return {
        id: i,
        char: Math.random() < 0.5 ? "0" : "1",
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        delay: (Math.random() * 0.15).toFixed(2),
      };
    });
  }, [triggerKey]);

  if (triggerKey === 0) return null;

  return (
    <g key={triggerKey}>
      <style>{`
        @keyframes digit-burst {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.6); }
        }
        .digit-burst {
          animation: digit-burst 0.7s ease-out forwards;
        }
      `}</style>
      {digits.map((d) => (
        <text
          key={d.id}
          x="0"
          y="0"
          fontSize="6"
          fill="#ff3131"
          textAnchor="middle"
          className="digit-burst"
          style={{
            "--tx": `${d.tx}px`,
            "--ty": `${d.ty}px`,
            animationDelay: `${d.delay}s`,
          }}
        >
          {d.char}
        </text>
      ))}
    </g>
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
  const [clickCount, setClickCount] = useState(0);
  const [popups, setPopups] = useState([]);
  const nextZ = useRef(1);

  const boxPool = [
    {
      title: "what went wrong",
      accent: "primary",
      text: "Client claims payload = 64,000 bytes but sends only 3. OpenSSL trusts the claimed length.",
    },
    {
      title: "the bleed",
      accent: "secondary",
      text: "Server allocates a 64KB response buffer, copying adjacent process memory to fill the gap.",
    },
    {
      title: "what leaks",
      accent: "cyan",
      text: "session tokens · private keys · passwords · cookies",
    },
  ];

  const trigger = () => {
    setClickCount((c) => c + 1);

    const template = boxPool[Math.floor(Math.random() * boxPool.length)];
    const id = Date.now() + Math.random();

    const step = 32;
    const cols = 4;
    const index = popups.length;
    const cascadeX = index % cols;
    const cascadeY = Math.floor(index / cols) % cols;

    const x = 30 + cascadeX * step * 2.4;
    const y = 20 + cascadeY * step;

    nextZ.current += 1;

    setPopups((prev) => [...prev, { id, ...template, x, y, z: nextZ.current }]);
  };

  const focusPopup = (id) => {
    nextZ.current += 1;
    setPopups((prev) =>
      prev.map((p) => (p.id === id ? { ...p, z: nextZ.current } : p))
    );
  };

  const movePopup = (id, x, y) => {
    setPopups((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
  };

  const closePopup = (id) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  };

  const leaking = clickCount > 0;

  const leaks = [
    { label: "user:admin", delay: "0.1s" },
    { label: "pk: -----BE", delay: "0.5s" },
    { label: "tok:a9f3c...", delay: "0.9s" },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-hb-red/30 bg-hb-bg p-6 font-body text-white sm:p-10"
      style={{ minHeight: 420 }}
    >
      <style>{`
        @keyframes heart-pop {
          0% { transform: scale(1) translateY(0); }
          35% { transform: scale(1.25) translateY(-10px); }
          60% { transform: scale(0.95) translateY(2px); }
          100% { transform: scale(1) translateY(0); }
        }
        .heart-pop {
          animation: heart-pop 0.45s ease-out;
        }
      `}</style>

      <p className="mb-6 font-heading text-xs uppercase tracking-widest text-hb-secondary">
        Stage 02 — Under Attack
      </p>

      <div className="relative flex flex-col items-center justify-start">
        <div key={clickCount} className={clickCount > 0 ? "heart-pop" : ""}>
          <HeartWireframe color="#ff3131" pulse="normal" onClick={trigger}>
            <DigitBurst triggerKey={clickCount} />
          </HeartWireframe>
        </div>

        <div className="relative mt-2 h-24 w-full">
          <LeakDrip key={clickCount} active={leaking} />
          {leaking && (
            <div
              key={clickCount}
              className="flex flex-col items-center gap-1 pt-6 font-heading text-xs text-hb-red"
            >
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

      {popups.map((p) => (
        <DraggablePopup
          key={p.id}
          id={p.id}
          title={p.title}
          accent={p.accent}
          x={p.x}
          y={p.y}
          zIndex={p.z}
          onFocus={focusPopup}
          onMove={movePopup}
          onClose={closePopup}
        >
          {p.text}
        </DraggablePopup>
      ))}
    </div>
  );
}

function StageAftermath() {
  const [selected, setSelected] = useState(null);
  const [heartClicks, setHeartClicks] = useState(0);
  const [activeInfo, setActiveInfo] = useState(null);

  const markers = {
    imgur: {
      label: "Imgur",
      left: "18%",
      title: "Imgur",
      accent: "primary",
      text: "Patched same day OpenSSL 1.0.1g shipped; no confirmed data loss reported.",
    },
    lastpass: {
      label: "LastPass",
      left: "38%",
      title: "LastPass",
      accent: "secondary",
      text: "Prompted users to rotate their master passwords as a precaution.",
    },
    yahoo: {
      label: "Yahoo",
      left: "78%",
      title: "Yahoo",
      accent: "cyan",
      text: "500M+ accounts · patched: Apr 8, 2014",
      warn: true,
    },
  };

  const triggerHeart = () => {
    setHeartClicks((c) => c + 1);
  };

  const handleMarkerClick = (key) => {
    setSelected(key);
    setActiveInfo(key);
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setActiveInfo(null);
    }, 3000);
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-hb-secondary/30 bg-hb-bg p-6 font-body text-white sm:p-10"
      style={{ minHeight: 500 }}
    >
      <p className="mb-4 font-heading text-xs uppercase tracking-widest text-hb-secondary">
        Stage 03 — The Aftermath
      </p>

      <div className="relative" style={{ height: 400 }}>
        {/* Holo-table floor - fills the container */}
        <div className="absolute inset-0 -m-6 sm:-m-10">
          <WireframeGlobe />
        </div>

        {/* Heart on top - centered above the globe */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div key={heartClicks} className={heartClicks > 0 ? "heart-pop" : ""}>
            <HeartWireframe color="#ff279e" size={120} pulse="normal" onClick={triggerHeart} />
          </div>
        </div>

        {/* Buttons on the globe surface */}
        <div className="absolute bottom-20 left-0 right-0 z-10">
          <div className="relative flex justify-center w-full px-10">
            {Object.entries(markers).map(([key, marker]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleMarkerClick(key)}
                style={{ left: marker.left }}
                className={`absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1 font-heading text-[11px] transition-all ${
                  marker.warn ? "text-hb-red" : "text-white/70"
                } ${selected === key ? "scale-110" : ""}`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full border transition-all ${
                    selected === key
                      ? "border-white bg-hb-red shadow-lg shadow-hb-red/50"
                      : "border-white/50 bg-black/40"
                  }`}
                  aria-hidden="true"
                />
                {marker.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info callout that appears on click - not draggable */}
        {activeInfo && markers[activeInfo] && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 animate-reveal">
            <InfoCallout 
              title={markers[activeInfo].title} 
              accent={markers[activeInfo].accent}
              className="w-64"
            >
              {markers[activeInfo].text}
            </InfoCallout>
          </div>
        )}
      </div>

      <style>{`
        @keyframes heart-pop {
          0% { transform: scale(1) translateY(0); }
          35% { transform: scale(1.25) translateY(-10px); }
          60% { transform: scale(0.95) translateY(2px); }
          100% { transform: scale(1) translateY(0); }
        }
        .heart-pop {
          animation: heart-pop 0.45s ease-out;
        }
        @keyframes reveal {
          0% { opacity: 0; transform: translate(-50%, 10px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-reveal {
          animation: reveal 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function HeartbleedSimulation({ stage = "healthy" }) {
  if (stage === "attack") return <StageAttack />;
  if (stage === "aftermath") return <StageAftermath />;
  return <StageHealthy />;
}