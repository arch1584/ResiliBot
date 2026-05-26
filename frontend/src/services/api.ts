const BASE_URL = "http://127.0.0.1:8000/api";

export interface Provider {
  id: string;
  name: string;
  status: 'active' | 'degraded' | 'offline';
  latencyMs: number;
  maxLatencyMs: number;
  role: string;
}

export interface Metrics {
  requestsServed: number;
  fallbacksTriggered: number;
  avgLatencyMs: number;
  uptimePercent: number;
  strategy: string;
  timeoutSeconds: number;
  maxRetries: number;
  cacheHits: number;
}

export interface LogEvent {
  id: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export const apiService = {
  sendChatMessage: async (message: string): Promise<{ response: string }> => {
    const res = await fetch(`${BASE_URL}/test-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("Chat request failed");
    return res.json();
  },

  getMetrics: async (): Promise<Metrics> => {
    const res = await fetch(`${BASE_URL}/metrics`);
    if (!res.ok) throw new Error("Failed to fetch metrics");
    return res.json();
  },

  getProviders: async (): Promise<Provider[]> => {
    const res = await fetch(`${BASE_URL}/providers`);
    if (!res.ok) throw new Error("Failed to fetch providers");
    return res.json();
  },

  getLatencyHistory: async (): Promise<any[]> => {
    const res = await fetch(`${BASE_URL}/latency-history`);
    if (!res.ok) throw new Error("Failed to fetch latency history");
    return res.json();
  },

  getEvents: async (): Promise<LogEvent[]> => {
    const res = await fetch(`${BASE_URL}/events`);
    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
  }
};