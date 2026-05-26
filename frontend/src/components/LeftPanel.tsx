import React from "react";
import ProviderHealthList from "./cards/ProviderHealthList";
import ChaosControls from "./cards/ChaosControls";
import EventFeed from "./cards/EventFeed";
import RoutingPolicy from "./cards/RoutingPolicy";
import MetricCards from "./cards/MetricCards";

// Explicitly using 'import type' for strict module parsing rule compliance
import type { Provider, ChaosToggle, FeedEvent, RoutingConfig, Metrics } from "./dashboardTypes";

interface LeftPanelProps {
  providers: Provider[];
  toggles: ChaosToggle[];
  events: FeedEvent[];
  routingConfig: RoutingConfig | null;
  metrics: Metrics | null;
  onToggleChaos: (id: string, newState: boolean) => void;
}

export default function LeftPanel({
  providers,
  toggles,
  events,
  routingConfig,
  metrics,
  onToggleChaos,
}: LeftPanelProps) {
  return (
    <div className="w-96 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full overflow-hidden select-none shrink-0">
      <MetricCards metrics={metrics} />

      <hr className="border-zinc-800 mx-2" />

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col p-1 gap-1">
        <div className="h-44 shrink-0">
          <ProviderHealthList providers={providers} />
        </div>
        
        <div className="h-44 shrink-0">
          <ChaosControls toggles={toggles} onToggle={onToggleChaos} />
        </div>

        <div className="h-40 shrink-0">
          <RoutingPolicy config={routingConfig} />
        </div>

        <div className="flex-1 min-h-[200px]">
          <EventFeed events={events} />
        </div>
      </div>
    </div>
  );
}