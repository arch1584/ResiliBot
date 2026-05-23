export type ProviderStatus = "active" | "degraded" | "offline"

export interface Provider {
  id: string
  name: string
  status: ProviderStatus
  latencyMs: number          // 0 if offline
  maxLatencyMs: number       // used to scale the latency bar, e.g. 3000
  role: "primary" | "fallback-1" | "fallback-2" | "fallback-3"
}

interface ProviderHealthListProps {
  providers: Provider[]
}

const defaultProviders: Provider[] = [
  { id: "claude",  name: "Claude 3.5 Sonnet", status: "active",   latencyMs: 380,  maxLatencyMs: 3000, role: "primary"    },
  { id: "gpt4",    name: "GPT-4o",            status: "degraded", latencyMs: 1240, maxLatencyMs: 3000, role: "fallback-1" },
  { id: "groq",    name: "Groq / Llama 3",    status: "active",   latencyMs: 95,   maxLatencyMs: 3000, role: "fallback-2" },
  { id: "gemini",  name: "Gemini 1.5 Pro",    status: "offline",  latencyMs: 0,    maxLatencyMs: 3000, role: "fallback-3" },
]

const statusDot: Record<ProviderStatus, string> = {
  active:   "bg-emerald-400",
  degraded: "bg-amber-400",
  offline:  "bg-red-500",
}
 
const badgeStyle: Record<ProviderStatus, string> = {
  active:   "bg-emerald-700 text-white",
  degraded: "bg-amber-700 text-white",
  offline:  "bg-red-700 text-white",
}
 
const barColor: Record<ProviderStatus, string> = {
  active:   "bg-emerald-400",
  degraded: "bg-amber-400",
  offline:  "bg-red-500",
}

export default function ProviderHealthList({ providers = defaultProviders }: ProviderHealthListProps) {
  return (
    <div className="h-full m-1 rounded-md bg-zinc-900 flex flex-col px-2 pt-1 pb-2 overflow-hidden">
    <span className="text-zinc-400 text-xs font-medium mb-1">provider health</span>
    <div className="flex flex-col flex-1 gap-1">
        {providers.map((p) => {
          const barPct = p.status === "offline"
            ? 0
            : Math.min(100, Math.round((p.latencyMs / p.maxLatencyMs) * 100))

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
        )
      })}
      </div>
    </div>
  )
}
 