import ChaosControls from "./cards/ChaosControls";
import EventFeed from "./cards/EventFeed";
import LatencyGraph from "./cards/LatencyGraph";
import MetricCards from "./cards/MetricCards";
import ProviderHealthList from "./cards/ProviderHealthList";
import RoutingPolicy from "./cards/RoutingPolicy";

export default function LeftPanel() {
  
  return (
    <div className="bg-zinc-700 border border-zinc-600 rounded-md p-1 flex flex-col h-full min-h-[500px]">
      
      <div className="h-24 shrink-0">
        <MetricCards />
      </div>

      <div className="grid grid-cols-2 flex-1 min-h-0">
        
        {/* left column */}
        <div className="flex flex-col min-h-0 pb-1 gap-2">
          <div className="flex-1 min-h-0"><ProviderHealthList /></div>
          <div className="flex-1 min-h-0"><EventFeed /></div>
          <div className="flex-1 min-h-0"><ChaosControls /></div>
        </div>

        {/* right column */}
        <div className="flex flex-col min-h-0 pb-1 gap-2">
          <div className="flex-[3] min-h-0"><LatencyGraph /></div>
          <div className="flex-1 min-h-0"><RoutingPolicy /></div>
        </div>

      </div>
    </div>
  )
}