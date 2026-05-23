export interface MetricsData {
  requestsServed: number        // total requests this session
  fallbacksTriggered: number    // how many times gateway fell back
  avgLatencyMs: number          // average latency across all providers
  uptimePercent: number         // user-perceived uptime (should stay 100)
}

interface MetricCardsProps {
  metrics: MetricsData
}

const defaultMetrics: MetricsData = {
  requestsServed: 0,
  fallbacksTriggered: 0,
  avgLatencyMs: 0,
  uptimePercent: 100,
}

function MetricCard({ label, value, sub, valueColor = "text-white" }: {
  label: string
  value: string
  sub: string
  valueColor?: string
}) {
  return (
    <div className="m-1 rounded-md bg-zinc-900 px-3 py-2 flex flex-col justify-between overflow-hidden">
      <span className="text-zinc-400 text-xs truncate">{label}</span>
      <span className={`text-xl font-medium ${valueColor} truncate`}>{value}</span>
      <span className="text-zinc-500 text-xs truncate">{sub}</span>
    </div>
  )
}

export default function MetricCards({ metrics = defaultMetrics }: MetricCardsProps) {
  return (
    <div className="h-full grid grid-cols-4">
      <MetricCard
        label="requests served"
        value={metrics.requestsServed.toLocaleString()}
        sub="this session"
      />
      <MetricCard
        label="fallbacks triggered"
        value={String(metrics.fallbacksTriggered)}
        sub="auto-recovered"
        valueColor={metrics.fallbacksTriggered > 0 ? "text-amber-400" : "text-white"}
      />
      <MetricCard
        label="avg latency"
        value={`${metrics.avgLatencyMs}ms`}
        sub="across providers"
        valueColor={metrics.avgLatencyMs > 2000 ? "text-amber-400" : "text-white"}
      />
      <MetricCard
        label="uptime"
        value={`${metrics.uptimePercent}%`}
        sub="user-perceived"
        valueColor="text-emerald-400"
      />
    </div>
  )
}