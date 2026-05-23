export type EventSeverity = "success" | "warn" | "error" | "info"
 
export interface FeedEvent {
  id: string               // unique key, e.g. uuid or incrementing int as string
  timestamp: string        // ISO string — component formats it for display
  severity: EventSeverity
  message: string
}
 
interface EventFeedProps {
  events: FeedEvent[]
}
 
const defaultEvents: FeedEvent[] = [
  { id: "1", timestamp: new Date().toISOString(),                      severity: "success", message: "Request #1 served via Claude 3.5 in 380ms" },
  { id: "2", timestamp: new Date(Date.now() - 5000).toISOString(),     severity: "warn",    message: "Claude 3.5 timeout (5s) → failover to GPT-4o" },
  { id: "3", timestamp: new Date(Date.now() - 12000).toISOString(),    severity: "warn",    message: "GPT-4o latency spike detected (1240ms)" },
  { id: "4", timestamp: new Date(Date.now() - 40000).toISOString(),    severity: "error",   message: "Gemini 1.5 Pro returned 503 — marked offline" },
  { id: "5", timestamp: new Date(Date.now() - 60000).toISOString(),    severity: "success", message: "MCP tool (web-search) responded in 210ms" },
  { id: "6", timestamp: new Date(Date.now() - 90000).toISOString(),    severity: "info",    message: "Session started — 3 providers online" },
]
 
const severityStyle: Record<EventSeverity, string> = {
  success: "border-l-emerald-500 text-zinc-300",
  warn:    "border-l-amber-400  text-zinc-300",
  error:   "border-l-red-500    text-zinc-300",
  info:    "border-l-blue-400   text-zinc-400",
}
 
function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}
 
export default function EventFeed({ events = defaultEvents}: EventFeedProps) {
  return (
    <div className="h-full m-1 rounded-md bg-zinc-900 flex flex-col px-2 pt-1 pb-2 overflow-hidden">
      <span className="text-zinc-400 text-xs font-medium mb-1 shrink-0">live event feed</span>
 
      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        {events.map((evt) => (
          <div
            key={evt.id}
            className={`border-l-2 pl-2 py-1 bg-zinc-800 rounded-r text-xs ${severityStyle[evt.severity]}`}
          >
            <span className="text-zinc-500 mr-2 font-mono">{formatTime(evt.timestamp)}</span>
            {evt.message}
          </div>
        ))}
      </div>
    </div>
  )
}
 