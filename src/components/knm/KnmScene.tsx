import type { KnmVisual } from "@/lib/knm/types";

const paths: Record<Exclude<KnmVisual["kind"], "water">, string> = {
  document: "M18 8h22l10 10v38H18z M40 8v12h10 M25 30h18 M25 38h18 M25 46h12",
  calendar: "M12 16h40v38H12z M12 26h40 M22 10v12 M42 10v12 M22 35h5 M37 35h5 M22 44h5 M37 44h5",
  home: "M8 30L32 10l24 20 M16 25v29h32V25 M27 54V37h10v17",
  care: "M26 10h12v16h16v12H38v16H26V38H10V26h16z",
  message: "M10 14h44v32H30L18 56V46h-8z M20 24h24 M20 34h18",
  government: "M8 22L32 8l24 14z M10 54h44 M16 28v20 M27 28v20 M38 28v20 M49 28v20",
  school: "M8 16q12-6 24 0 12-6 24 0v34q-12-6-24 0-12-6-24 0z M32 16v34 M16 26h8 M40 26h8 M16 35h8 M40 35h8",
};

/** Authored illustrative context; all relevant information is also available as text. */
export function KnmScene({ visual }: { visual: KnmVisual }) {
  return <figure className={`knm-scene knm-scene-${visual.kind}`} dir="ltr" lang="nl" aria-label={visual.description.nl}>
    {visual.kind === "water" ? <svg className="knm-water-scene" viewBox="0 0 480 140" aria-hidden="true" focusable="false">
      <rect width="480" height="140" rx="12" fill="#edf4fa" />
      <path d="M0 80h156v60H0z" fill="#88bdda" />
      <path d="M136 140l64-96h34l64 96z" fill="#669c71" />
      <path d="M260 114h220v26H260z" fill="#c2d5b5" />
      <path d="M330 114V80h38v34 M321 80l28-22 28 22 M404 114V80h38v34 M395 80l28-22 28 22" stroke="#365773" strokeWidth="4" fill="#ffffff" />
      <path d="M18 94q16-10 32 0t32 0t32 0 M24 114q16-10 32 0t32 0t32 0" fill="none" stroke="#365773" strokeWidth="3" />
    </svg> : <svg className="knm-scene-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d={paths[visual.kind]} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    <div className="knm-scene-copy"><strong>{visual.title}</strong><ul>{visual.lines.map((line, index) => <li key={index}>{line}</li>)}</ul></div>
    <figcaption className="sr-only">{visual.description.nl}</figcaption>
  </figure>;
}
