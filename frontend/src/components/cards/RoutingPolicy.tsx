export interface RoutingConfig {
  strategy: string           // e.g. "priority fallback"
  timeoutSeconds: number
  maxRetries: number
  cacheHits: number
  totalRequests: number
}
 
interface RoutingPolicyProps {
  config?: RoutingConfig
}
 
const defaultConfig: RoutingConfig = {
  strategy: "priority fallback",
  timeoutSeconds: 5,
  maxRetries: 3,
  cacheHits: 0,
  totalRequests: 0,
}
 
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 justify-between items-center border-b py-1 border-zinc-800 last:border-0">
      <span className="text-zinc-500 text-xs">{label}</span>
      <span className="text-zinc-200 text-xs font-medium">{value}</span>
    </div>
  )
}
 
export default function RoutingPolicy({ config = defaultConfig }: RoutingPolicyProps) {
  const cacheHitPct = config.totalRequests > 0
    ? Math.round((config.cacheHits / config.totalRequests) * 100)
    : 0
 
  return (
    <div className="h-full shrink-0 m-1 rounded-md bg-zinc-900 px-2 pt-1">
      <span className="text-zinc-400 text-xs font-medium block">
        active routing policy
      </span>
      <Row label="strategy"       value={config.strategy} />
      <Row label="timeout"        value={`${config.timeoutSeconds}s`} />
      <Row label="max retries"    value={String(config.maxRetries)} />
      <Row label="cache hits"     value={`${config.cacheHits} (${cacheHitPct}%)`} />
    </div>
  )
}