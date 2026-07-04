import { useMemo } from "react";
import {
  sampleDomeBoundary,
  pointsToPath,
  meridianPath,
  parallelPaths,
  boundsOf,
  evenLevels,
} from "./heartMath";

const MERIDIAN_ANGLES = [-1.4, -1.15, -0.85, -0.55, -0.25, 0.25, 0.55, 0.85, 1.15, 1.4];
const CABLE_COLORS = [
  "#ff279e",
  "#bd93f9",
  "#76c6d7",
  "#e2a9f1",
  "#ff3131",
  "#f5d76e",
  "#7ee787",
];

export default function WireframeGlobe({ size = 420, className = "" }) {
  const boundary = useMemo(() => sampleDomeBoundary(), []);
  const bounds = useMemo(() => boundsOf(boundary), [boundary]);
  const outline = useMemo(() => pointsToPath(boundary), [boundary]);
  const meridians = useMemo(
    () => MERIDIAN_ANGLES.map((phi) => meridianPath(boundary, phi)),
    [boundary]
  );
  const parallels = useMemo(() => {
    const levels = evenLevels(bounds.minY, 0, 6);
    return parallelPaths(boundary, levels, 0.8);
  }, [boundary, bounds]);

  // Decorative "cables" fanning from the apex down across the dome, suggesting
  // the leaked data spreading out across the network.
  const cables = useMemo(() => {
    const apex = [0, bounds.minY];
    return CABLE_COLORS.map((c, i) => {
      const spread = (i / (CABLE_COLORS.length - 1)) * 2 - 1; // -1..1
      const targetX = spread * bounds.maxX * 0.95;
      const targetY = -2 + Math.random() * 2;
      const midX = targetX * 0.5;
      const midY = bounds.minY * 0.4;
      return {
        color: c,
        d: `M${apex[0]},${apex[1]} Q${midX.toFixed(2)},${midY.toFixed(2)} ${targetX.toFixed(2)},${targetY.toFixed(2)}`,
      };
    });
  }, [bounds]);

  const pad = 1;
  const viewBox = `${bounds.minX - pad} ${bounds.minY - pad} ${
    bounds.maxX - bounds.minX + pad * 2
  } ${0 - bounds.minY + pad * 2}`;

  return (
    <svg viewBox={viewBox} width={size} height={size / 2} className={`overflow-visible ${className}`}>
      <g fill="none" strokeLinecap="round" opacity={0.85}>
        {cables.map((cable, i) => (
          <path key={i} d={cable.d} stroke={cable.color} strokeWidth={0.18} opacity={0.55} />
        ))}
      </g>
      <g fill="none" stroke="#76c6d7" strokeLinecap="round">
        {meridians.map((d, i) => (
          <path key={`m-${i}`} d={d} strokeWidth={0.22} opacity={0.4} />
        ))}
        {parallels.map((d, i) => (
          <path key={`p-${i}`} d={d} strokeWidth={0.22} opacity={0.4} />
        ))}
        <path d={outline} strokeWidth={0.5} opacity={0.9} />
      </g>
    </svg>
  );
}
