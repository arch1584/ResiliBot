export type EventSeverity = "success" | "warn" | "error" | "info";

// Declared locally to stop depending on the api.ts file export
export interface FeedEvent {
  id: string;
  timestamp: string; // ISO string
  severity: EventSeverity;
  message: string;
}

interface EventFeedProps {
  events: FeedEvent[];
}

const defaultEvents: FeedEvent[] = [
  { id: "1", timestamp: new Date().toISOString(),                      severity: "success", message: "Request #4 served via gemini-3.5-flash in 210ms" },
  { id: "2", timestamp: new Date(Date.now() - 5000).toISOString(),     severity: "warn",    message: "gemini-3.5-flash timeout (3s) → failover triggered" },
  { id: "3", timestamp: new Date(Date.now() - 12000).toISOString(),    severity: "warn",    message: "gemini-3.1-flash-lite latency spike detected (740ms)" },
  { id: "4", timestamp: new Date(Date.now() - 40000).toISOString(),    severity: "error",   message: "gpt-4o-mini gateway returned 429 → marked degraded" },
  { id: "5", timestamp: new Date(Date.now() - 60000).toISOString(),    severity: "success", message: "Extraction pipeline tool (orchestrator) responded in 180ms" },
  { id: "6", timestamp: new Date(Date.now() - 90000).toISOString(),    severity: "info",    message: "Session initialized — all 3 provider gateways online" },
];

const severityStyle: Record<string, string> = {
  success: "border-l-emerald-500 text-zinc-300",
  warn:    "border-l-amber-400  text-zinc-300",
  error:   "border-l-red-500    text-zinc-300",
  info:    "border-l-blue-400   text-zinc-400",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function EventFeed({ events }: EventFeedProps) {
  const activeEvents = events && events.length > 0 ? events : defaultEvents;

  return (
    <div className="h-full m-1 rounded-md bg-zinc-900 flex flex-col px-2 pt-1 pb-2 overflow-hidden">
      <span className="text-zinc-400 text-xs font-medium mb-1 shrink-0">live event feed</span>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        {activeEvents.map((evt) => (
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
  );
}