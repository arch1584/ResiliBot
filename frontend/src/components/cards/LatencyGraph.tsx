import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts"
import type { Provider } from "./ProviderHealthList"
 
export interface LatencyPoint {
  time: string                        // display label e.g. "14:03:21"
  [providerId: string]: number | null | string  // null = offline at that moment
}
 
interface LatencyGraphProps {
  dataPoints: LatencyPoint[]          // last 30 ticks, oldest first
  providers: Provider[]               // used to get name + color per line
}
 
// one color per provider slot — matches status colors used elsewhere
const providerColors: Record<string, string> = {
  claude:  "#34d399",   // emerald
  gpt4:    "#fbbf24",   // amber
  groq:    "#60a5fa",   // blue
  gemini:  "#f87171",   // red
}
 
// generate dummy rolling data for static preview
function generateDummyData(): LatencyPoint[] {
  const now = Date.now()
  return Array.from({ length: 30 }, (_, i) => {
    const t = new Date(now - (29 - i) * 2000)
    const label = t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    return {
      time:   label,
      claude: Math.round(320 + Math.random() * 120),
      gpt4:   Math.round(900 + Math.random() * 600),
      groq:   Math.round(80  + Math.random() * 60),
      gemini: null,
    }
  })
}
 
const defaultDataPoints = generateDummyData()
 
const defaultProviders: Provider[] = [
  { id: "claude", name: "Claude 3.5 Sonnet", status: "active",   latencyMs: 380,  maxLatencyMs: 3000, role: "primary"    },
  { id: "gpt4",   name: "GPT-4o",            status: "degraded", latencyMs: 1240, maxLatencyMs: 3000, role: "fallback-1" },
  { id: "groq",   name: "Groq / Llama 3",    status: "active",   latencyMs: 95,   maxLatencyMs: 3000, role: "fallback-2" },
  { id: "gemini", name: "Gemini 1.5 Pro",    status: "offline",  latencyMs: 0,    maxLatencyMs: 3000, role: "fallback-3" },
]
 
export default function LatencyGraph({
  dataPoints = defaultDataPoints,
  providers  = defaultProviders,
}: LatencyGraphProps) {
  // only show every 5th tick label to avoid crowding
  const tickFormatter = (_: string, index: number) =>
    index % 5 === 0 ? dataPoints[index]?.time ?? "" : ""
 
  return (
    <div className="h-full flex-1 min-h-0 m-1 rounded-md bg-zinc-900 flex flex-col p-3">
      <span className="text-zinc-400 text-xs font-medium mb-3 shrink-0">
        live latency — rolling 60s
      </span>
 
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dataPoints}
            margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#3f3f46"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tickFormatter={tickFormatter}
              tick={{ fill: "#71717a", fontSize: 10 }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={false}
            />
            <YAxis
              unit="ms"
              tick={{ fill: "#71717a", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#e4e4e7",
              }}
              labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
              formatter={(value: any, name: any) => {
                const p = providers.find((p) => p.id === name)
                return [`${value ?? "—"}ms`, p?.name ?? name]
              }}
            />
            <Legend
              formatter={(value) => {
                const p = providers.find(p => p.id === value)
                return (
                  <span style={{ color: "#a1a1aa", fontSize: "11px" }}>
                    {p?.name ?? value}
                  </span>
                )
              }}
            />
 
            {providers.map(p => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={p.id}
                stroke={providerColors[p.id] ?? "#a1a1aa"}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
                connectNulls={false}          // gap in line when provider is offline
                strokeDasharray={p.status === "offline" ? "4 4" : undefined}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}