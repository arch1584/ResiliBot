import React from "react";
import ProviderHealthList from "./cards/ProviderHealthList";
import ChaosControls from "./cards/ChaosControls";
import EventFeed from "./cards/EventFeed";
import RoutingPolicy from "./cards/RoutingPolicy";
import MetricCards from "./cards/MetricCards";
import LatencyGraph from "./cards/LatencyGraph";

// Explicitly using 'import type' for strict module parsing rule compliance
import type { Provider, ChaosToggle, FeedEvent, RoutingConfig, Metrics } from "./dashboardTypes";

interface LeftPanelProps {
  providers: Provider[];
  toggles: ChaosToggle[];
  events: FeedEvent[];
  routingConfig: RoutingConfig | null;
  metrics: Metrics | null;
  onToggleChaos: (id: string, newState: boolean) => void;
  latencyHistory: any[];
}

export default function LeftPanel({
  providers,
  toggles,
  events,
  routingConfig,
  metrics,
  onToggleChaos,
  latencyHistory
}: LeftPanelProps) {
  return (
    <div className="bg-zinc-700 border border-zinc-600 rounded-md p-1 flex flex-col h-full min-h-[500px]">
      <MetricCards metrics={metrics} />

      <div className="grid grid-cols-2 flex-1 min-h-0">
        {/* left column */}
        <div className="flex flex-col min-h-0 pb-1 gap-2">
          <div className="flex-1 min-h-0">
            <ProviderHealthList providers={providers} />
          </div>
          
          <div className="flex-1 min-h-0">
            <ChaosControls toggles={toggles} onToggle={onToggleChaos} />
          </div>

          <div className="flex-1 min-h-0">
            <EventFeed events={events} />
          </div>
        </div>

        {/* right column */}
        <div className="flex flex-col min-h-0 pb-1 gap-2">
          <div className="flex-[3] min-h-0">
            <LatencyGraph dataPoints={latencyHistory} providers={providers} />
          </div>

          <div className="h-36 shrink-0">
            <RoutingPolicy config={routingConfig} />
          </div>
        </div>
      </div>
    </div>
  );
}