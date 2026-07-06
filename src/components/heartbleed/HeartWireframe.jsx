import { useMemo } from "react";
import {
  sampleHeartBoundary,
  pointsToPath,
  meridianPath,
  parallelPaths,
  boundsOf,
  evenLevels,
} from "./heartMath";

const MERIDIAN_ANGLES = [-1.3, -0.95, -0.6, 0.6, 0.95, 1.3];

export default function HeartWireframe({
  color = "#ff279e",
  size = 260,
  pulse = "normal", // "normal" | "fast" | "none"
  onClick,
  className = "",
  children,
}) {
  const boundary = useMemo(() => sampleHeartBoundary(), []);
  const bounds = useMemo(() => boundsOf(boundary), [boundary]);
  const outline = useMemo(() => pointsToPath(boundary), [boundary]);
  const meridians = useMemo(
    () => MERIDIAN_ANGLES.map((phi) => meridianPath(boundary, phi)),
    [boundary]
  );
  const parallels = useMemo(() => {
    const levels = evenLevels(bounds.minY, bounds.maxY, 9);
    return parallelPaths(boundary, levels);
  }, [boundary, bounds]);

  const pad = 2;
  const viewBox = `${bounds.minX - pad} ${bounds.minY - pad} ${
    bounds.maxX - bounds.minX + pad * 2
  } ${bounds.maxY - bounds.minY + pad * 2}`;

  const pulseClass =
    pulse === "fast" ? "animate-heartbeat-fast" : pulse === "none" ? "" : "animate-heartbeat";

  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick(e);
            }
          : undefined
      }
      className={`overflow-visible ${onClick ? "cursor-pointer" : ""} ${pulseClass} ${className}`}
      style={{ transformOrigin: "50% 50%" }}
    >
      <g fill="none" stroke={color} strokeLinecap="round">
        {meridians.map((d, i) => (
          <path key={`m-${i}`} d={d} strokeWidth={0.3} opacity={0.45} />
        ))}
        {parallels.map((d, i) => (
          <path key={`p-${i}`} d={d} strokeWidth={0.3} opacity={0.45} />
        ))}
        <path d={outline} strokeWidth={0.7} opacity={1} />
      </g>
      {children}
    </svg>
  );
  
}
