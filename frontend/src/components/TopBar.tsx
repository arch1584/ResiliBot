interface TopBarProps {
  status: 0 | 1 | 2
}
 
const statusConfig = {
  0: { label: "all systems resilient", dot: "bg-emerald-400", text: "text-emerald-400" },
  1: { label: "degraded — fallback active", dot: "bg-amber-400",  text: "text-amber-400"  },
  2: { label: "critical — no providers",   dot: "bg-red-500",    text: "text-red-500"    },
}
 
export default function TopBar({ status = 0 }: TopBarProps) {
  const cfg = statusConfig[status]
 
  return (
    <div className="bg-zinc-800 h-10 mb-1 border-b border-zinc-700 flex items-center px-3">
      {/* logo */}
      <span className="font-bold text-emerald-300 tracking-tight text-sm select-none">
        ResiliBot
      </span>
      <span className="ml-2 text-zinc-500 text-xs hidden sm:block">
        · AI Mission Control
      </span>
 
      <div className="grow" />
 
      {/* gateway label */}
      <span className="text-zinc-500 text-xs mr-3 hidden md:block">
        via TrueFoundry AI Gateway
      </span>
 
      {/* status pill */}
      <div className="flex items-center gap-2 border border-zinc-600 rounded-full px-3 py-1">
        <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
        <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
      </div>
    </div>
  )
}