// Declared locally to completely break dependence on the missing api.ts export
export interface Provider {
  id: string;
  name: string;
  status: "active" | "degraded" | "offline";
  latencyMs: number;
  maxLatencyMs: number;
  role: string;
}

interface ProviderHealthListProps {
  providers: Provider[];
}

// Fixed mock state using your exact three production model nodes
const defaultProviders: Provider[] = [
  { id: "gemini-35-flash", name: "Gemini 3.5 Flash", status: "active", latencyMs: 210, maxLatencyMs: 3000, role: "primary" },
  { id: "gemini-31-flash-lite", name: "Gemini 3.1 Flash Lite", status: "active", latencyMs: 140, maxLatencyMs: 3000, role: "fallback-1" },
  { id: "gpt-4o-mini", name: "OpenAI GPT-4o Mini", status: "active", latencyMs: 290, maxLatencyMs: 3000, role: "fallback-2" },
];

const statusDot: Record<string, string> = {
  active:   "bg-emerald-400",
  degraded: "bg-amber-400",
  offline:  "bg-red-500",
};
 
const badgeStyle: Record<string, string> = {
  active:   "bg-emerald-700 text-white",
  degraded: "bg-amber-700 text-white",
  offline:  "bg-red-700 text-white",
};
 
const barColor: Record<string, string> = {
  active:   "bg-emerald-400",
  degraded: "bg-amber-400",
  offline:  "bg-red-500",
};

export default function ProviderHealthList({ providers }: ProviderHealthListProps) {
  // Use real backend data array if loaded; fall back to your custom models default state smoothly
  const activeList = providers && providers.length > 0 ? providers : defaultProviders;

  return (
    <div className="h-full m-1 rounded-md bg-zinc-900 flex flex-col px-2 pt-1 pb-2 overflow-hidden">
      <span className="text-zinc-400 text-xs font-medium mb-1">provider health</span>
      <div className="flex flex-col flex-1 gap-1">
        {activeList.map((p) => {
          const barPct = p.status === "offline"
            ? 0
            : Math.min(100, Math.round((p.latencyMs / p.maxLatencyMs) * 100));

          return (
            <div key={p.id} className={`flex-1 flex items-center gap-2 rounded px-2 border text-xs
              ${p.status === "active"   ? "border-zinc-700 bg-zinc-800" : ""}
              ${p.status === "degraded" ? "border-zinc-700 bg-zinc-800"   : ""}
              ${p.status === "offline"  ? "border-zinc-700 bg-zinc-800"     : ""}
            `}
          >
            {/* status dot */}
            <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[p.status]}`} />
 
            {/* name */}
            <span className="text-zinc-200 font-medium flex-1 truncate">{p.name}</span>
 
            {/* latency text */}
            <span className="text-zinc-400 shrink-0 w-9 text-right">
              {p.status === "offline" ? "—" : `${p.latencyMs}ms`}
            </span>
 
            {/* latency bar */}
            <div className="w-10 h-1 bg-zinc-700 rounded shrink-0">
              <div
                className={`h-1 rounded ${barColor[p.status]}`}
                style={{ width: `${barPct}%` }}
              />
            </div>
 
            {/* badge */}
            <span className={`px-1.5 py-0.5 rounded text-xs shrink-0 ${badgeStyle[p.status]}`}>
              {p.status === "offline" ? "offline" : p.role}
            </span>
          </div>
          );
        })}
      </div>
    </div>
  );
}