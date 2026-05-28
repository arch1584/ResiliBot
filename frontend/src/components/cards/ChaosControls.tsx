import React from "react";
// The critical 'type' keyword fix for your project's strict compilation rules
import { type ChaosToggle } from "../dashboardTypes";

interface ChaosControlsProps {
  toggles: ChaosToggle[];
  onToggle: (id: string, newState: boolean) => void;
}

const defaultToggles: ChaosToggle[] = [
  { id: "kill-gemini-35", label: "kill Gemini 3.5 Flash", description: "forces failover to 3.1 flash lite", enabled: false },
  { id: "throttle-gemini-31", label: "throttle Gemini 3.1 Lite", description: "injects a 3-second artificial delay", enabled: false },
  { id: "rate-limit-gpt", label: "rate-limit GPT-4o Mini", description: "simulates a 429 too many requests error", enabled: false },
  { id: "drop-search-tool", label: "drop search tool gateway", description: "forces alternative extraction loops", enabled: false },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 focus:outline-none
        ${checked ? "bg-red-500" : "bg-zinc-600"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all
          ${checked ? "left-4" : "left-0.5"}`}
      />
    </button>
  );
}

export default function ChaosControls({ toggles, onToggle }: ChaosControlsProps) {
  const activeToggles = toggles && toggles.length > 0 ? toggles : defaultToggles;
  const [localToggles, setLocalToggles] = React.useState<ChaosToggle[]>(activeToggles);

  React.useEffect(() => { 
    if (toggles && toggles.length > 0) {
      setLocalToggles(toggles); 
    }
  }, [toggles]);

  function handleToggle(id: string) {
    const updated = localToggles.map(t =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    );
    setLocalToggles(updated);
    const toggled = updated.find(t => t.id === id)!;
    onToggle?.(id, toggled.enabled);
  }

  const anyActive = localToggles.some(t => t.enabled);

  return (
    <div className="h-full m-1 rounded-md bg-zinc-900 flex flex-col px-2 pt-1 pb-2 overflow-hidden">
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <span className="text-zinc-400 text-xs font-medium w-full">chaos controls</span>
        {anyActive && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 animate-pulse font-mono">
            CHAOS ACTIVE
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {localToggles.map((t) => (
          <div key={t.id} className="flex items-start gap-2 bg-zinc-800 rounded px-2 py-1.5">
            <div className="flex-1 min-w-0">
              <p className="text-zinc-200 text-xs font-medium">{t.label}</p>
              <p className="text-zinc-500 text-xs truncate">{t.description}</p>
            </div>
            <Toggle checked={t.enabled} onChange={() => handleToggle(t.id)} />
          </div>
        ))}
      </div>

      <p className="text-zinc-600 text-[10px] mt-1 shrink-0 italic leading-none">
        toggle to inject real failures into your orchestrator pipeline
      </p>
    </div>
  );
}