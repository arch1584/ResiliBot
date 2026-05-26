// Centralized telemetry type safe structures

export interface Provider {
  id: string;
  name: string;
  status: "active" | "degraded" | "offline";
  latencyMs: number;
  maxLatencyMs: number;
  role: string;
}

export interface ChaosToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export type EventSeverity = "success" | "warn" | "error" | "info";

export interface FeedEvent {
  id: string;
  timestamp: string; 
  severity: EventSeverity;
  message: string;
}

export interface RoutingConfig {
  strategy: string;
  timeoutSeconds: number;
  maxRetries: number;
  cacheHits: number;
  totalRequests: number;
}

export interface Metrics {
  requestsServed: number;
  activeSessions: number;
  avgLatencyMs: number;
  uptimePct: number;
}