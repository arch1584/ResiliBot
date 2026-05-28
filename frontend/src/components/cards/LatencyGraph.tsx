import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

// Declared locally to completely break dependence on the missing api.ts export
export interface Provider {
  id: string;
  name: string;
  status: "active" | "degraded" | "offline";
  latencyMs: number;
  maxLatencyMs: number;
  role: string;
}

export interface LatencyPoint {
  time: string;
  [providerId: string]: number | null | string;
}

interface LatencyGraphProps {
  dataPoints: LatencyPoint[];
  providers: Provider[];
}

const providerColors: Record<string, string> = {
  "gemini-35-flash":      "#34d399", // Emerald green
  "gemini-31-flash-lite": "#60a5fa", // Blue indicator
  "gpt-4o-mini":          "#fbbf24", // Amber accent
};

function generateDummyData(): LatencyPoint[] {
  const now = Date.now();
  return Array.from({ length: 30 }, (_, i) => {
    const t = new Date(now - (29 - i) * 2000);
    const label = t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    return {
      time: label,
      "gemini-35-flash":      Math.round(180 + Math.random() * 45),
      "gemini-31-flash-lite": Math.round(120 + Math.random() * 30),
      "gpt-4o-mini":          Math.round(260 + Math.random() * 60),
    };
  });
}

const defaultDataPoints = generateDummyData();

const defaultProviders: Provider[] = [
  { id: "gemini-35-flash", name: "Gemini 3.5 Flash", status: "active", latencyMs: 210, maxLatencyMs: 3000, role: "primary" },
  { id: "gemini-31-flash-lite", name: "Gemini 3.1 Flash Lite", status: "active", latencyMs: 140, maxLatencyMs: 3000, role: "fallback-1" },
  { id: "gpt-4o-mini", name: "OpenAI GPT-4o Mini", status: "active", latencyMs: 290, maxLatencyMs: 3000, role: "fallback-2" },
];

export default function LatencyGraph({ dataPoints, providers }: LatencyGraphProps) {
  const activePoints = dataPoints && dataPoints.length > 0 ? dataPoints : defaultDataPoints;
  const activeProviders = providers && providers.length > 0 ? providers : defaultProviders;
  console.log(activePoints[0])
  const tickFormatter = (_: string, index: number) =>
    index % 5 === 0 ? activePoints[index]?.time ?? "" : "";

  return (
    <div className="h-full flex-1 min-h-0 m-1 rounded-md bg-zinc-900 flex flex-col p-3">
      <span className="text-zinc-400 text-xs font-medium mb-3 shrink-0">
        live latency — rolling 60s
      </span>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={activePoints} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
            <XAxis
              dataKey="time"
              tickFormatter={tickFormatter}
              tick={{ fill: "#71717a", fontSize: 10 }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={false}
            />
            <YAxis unit="ms" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} width={56} domain={[0, 400]} tickCount={5} />
            <Tooltip
              itemSorter={(item) => -(item.value as number)}
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "6px", fontSize: "12px", color: "#e4e4e7" }}
              labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
              formatter={(value: any, name: any) => {
                const p = activeProviders.find((p) => p.id === name);
                return [`${value ?? "—"}ms`, p?.name ?? name];
              }}
            />
            
            {activeProviders.map(p => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={p.id}
                stroke={providerColors[p.id] ?? "#a1a1aa"}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
                connectNulls={false}
                strokeDasharray={p.status === "offline" ? "4 4" : undefined}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* custom legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1 shrink-0">
        {activeProviders.map(p => (
          <div key={p.id} className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded inline-block shrink-0"
              style={{ background: providerColors[p.id] ?? "#a1a1aa" }} />
            <span className="text-zinc-400 text-[10px] truncate">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}