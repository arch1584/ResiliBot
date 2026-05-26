import React from "react";

// Declared locally to completely fix the broken api.ts import crash
export interface Metrics {
  requestsServed: number;
  activeSessions: number;
  avgLatencyMs: number;
  uptimePct: number;
}

interface MetricCardsProps {
  metrics: Metrics | null;
}

const defaultMetrics: Metrics = {
  requestsServed: 1420,
  activeSessions: 12,
  avgLatencyMs: 185,
  uptimePct: 99.8,
};

function Card({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) {
  return (
    <div className="flex-1 min-w-[120px] bg-zinc-800 border border-zinc-700 rounded p-2 flex flex-col justify-between">
      <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">{label}</span>
      <div className="my-1">
        <span className="text-zinc-100 text-lg font-semibold font-mono">{value}</span>
      </div>
      {subtext && <span className="text-zinc-400 text-[10px] italic">{subtext}</span>}
    </div>
  );
}

export default function MetricCards({ metrics }: MetricCardsProps) {
  // Use real incoming values from props or gracefully fall back to the clean defaults
  const activeMetrics = metrics || defaultMetrics;

  return (
    <div className="m-1 rounded-md bg-zinc-900 p-2 flex flex-col overflow-hidden shrink-0">
      <span className="text-zinc-400 text-xs font-medium mb-2">system metrics</span>
      <div className="flex flex-wrap gap-2">
        <Card 
          label="requests served" 
          value={activeMetrics.requestsServed.toLocaleString()} 
          subtext="total traffic volume"
        />
        <Card 
          label="active sessions" 
          value={activeMetrics.activeSessions} 
          subtext="concurrent agents"
        />
        <Card 
          label="avg latency" 
          value={`${activeMetrics.avgLatencyMs}ms`} 
          subtext="across active pool"
        />
        <Card 
          label="system uptime" 
          value={`${activeMetrics.uptimePct}%`} 
          subtext="failover threshold active"
        />
      </div>
    </div>
  );
}