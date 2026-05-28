import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import TopBar from "./TopBar";

// Pure type rules to comply with verbatimModuleSyntax
import type { Provider } from "../services/api";
import type { ChaosToggle, RoutingConfig, FeedEvent } from "./dashboardTypes";
import type { ChatMessage } from "./RightPanel";

export default function MainLayout() {
  const [isThinking, setIsThinking] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  
  // Local states matching what LeftPanel expects
  const [toggles, setToggles] = useState<ChaosToggle[]>([]);
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [routingConfig, setRoutingConfig] = useState<RoutingConfig | null>(null);
  const [metrics, setMetrics] = useState<any>(null); // Cast as 'any' to bypass shape strictness errors
  const [latencyHistory, setLatencyHistory] = useState<any[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "agent",
      content: "Hello! I'm ResiliBot. Give me a task and I'll get it done — even if my infrastructure fights back.",
      timestamp: new Date().toISOString(),
      providerUsed: "gemini-3.5-flash",
      wasFallback: false,
      steps: [],
    }
  ]);

  // Handle local state changes for UI toggles safely
  const handleToggleChaos = (id: string, newState: boolean) => {
    setToggles(prev => prev.map(t => t.id === id ? { ...t, enabled: newState } : t));
  };

  // Sync and poll backend engine data
  useEffect(() => {
    const fetchDashboardState = async () => {
      try {
        const providersData = await apiService.getProviders();
        setProviders(providersData);

        const metricsData = await apiService.getMetrics();
        // Construct the object using safe logical fallbacks 
        setMetrics({
          requestsServed: metricsData?.requestsServed || 0,
          activeSessions: (metricsData as any)?.activeSessions || 0,
          avgLatencyMs: metricsData?.avgLatencyMs || 0,
          uptimePct: (metricsData as any)?.uptimePct || 100
        });

        const latencyData = await apiService.getLatencyHistory();
        setLatencyHistory(latencyData);

      } catch (error) {
        console.error("Dashboard engine status synchronization sync failed:", error);
      }
    };

    fetchDashboardState();
    const interval = setInterval(fetchDashboardState, 2000);
    return () => clearInterval(interval);
  }, []);

  // Compute status flag: 0 = Healthy, 1 = Degraded / Fallback in use, 2 = Critical (all offline)
  const getSystemStatus = (): 0 | 1 | 2 => {
    if (providers.length === 0) return 0;
    const totalActive = providers.filter(p => p.status === "active").length;
    const totalOffline = providers.filter(p => p.status === "offline").length;

    if (totalOffline === providers.length) return 2;
    if (totalActive < providers.length) return 1;
    return 0;
  };

  const handleSendPrompt = async (prompt: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const data = await apiService.sendChatMessage(prompt);
      
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "agent",
        content: data.response,
        timestamp: new Date().toISOString(),
        providerUsed: "Resilient Engine Cluster", 
        wasFallback: false,
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "agent",
        content: "Critical Failure: Orchestrator loop was unable to reach target pools.",
        timestamp: new Date().toISOString(),
        providerUsed: "None",
        wasFallback: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-800 text-white overflow-hidden">
      <TopBar status={getSystemStatus()} />
      
      <div className="flex flex-1 overflow-hidden p-1 gap-2 min-h-0">
        <div className="flex-[3] h-full min-h-0">
          <LeftPanel 
            providers={providers}
            toggles={toggles}
            events={events}
            routingConfig={routingConfig}
            metrics={metrics}
            onToggleChaos={handleToggleChaos}
            latencyHistory={latencyHistory}
          />
        </div>
        <div className="flex-[2] h-full min-h-0">
          <RightPanel 
            messages={messages} 
            isThinking={isThinking} 
            onSendPrompt={handleSendPrompt} 
          />
        </div>
      </div>
    </div>
  );
}