import React from "react";

// Declared locally to completely break dependence on the missing api.ts export
export interface RoutingConfig {
  strategy: string;
  timeoutSeconds: number;
  maxRetries: number;
  cacheHits: number;
  totalRequests: number;
}
 
interface RoutingPolicyProps {
  config: RoutingConfig | null;
}
 
const defaultConfig: RoutingConfig = {
  strategy: "priority fallback",
  timeoutSeconds: 3,
  maxRetries: 3,
  cacheHits: 0,
  totalRequests: 0,
};
 
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b py-1 border-zinc-800 last:border-0">
      <span className="text-zinc-500 text-xs">{label}</span>
      <span className="text-zinc-200 text-xs font-medium">{value}</span>
    </div>
  );
}
 
export default function RoutingPolicy({ config }: RoutingPolicyProps) {
  const activeConfig = config || defaultConfig;
 
  const cacheHitPct = activeConfig.totalRequests > 0
    ? Math.round((activeConfig.cacheHits / activeConfig.totalRequests) * 100)
    : 0;
 
  return (
    <div className="h-full m-1 rounded-md bg-zinc-900 px-2 pt-1 pb-2 flex flex-col">
      <span className="text-zinc-400 text-xs font-medium block">
        active routing policy
      </span>
      <div className="flex flex-col flex-1 justify-between">
        <Row label="strategy"       value={activeConfig.strategy} />
        <Row label="timeout"        value={`${activeConfig.timeoutSeconds}s`} />
        <Row label="max retries"    value={String(activeConfig.maxRetries)} />
        <Row label="cache hits"     value={`${activeConfig.cacheHits} (${cacheHitPct}%)`} />
      </div>
    </div>
  );
}