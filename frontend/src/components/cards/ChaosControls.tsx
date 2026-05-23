export interface ChaosToggle {
  id: string
  label: string
  description: string
  enabled: boolean         // true = chaos active (bad), false = normal
}
 
interface ChaosControlsProps {
  toggles: ChaosToggle[]
  onToggle: (id: string, newState: boolean) => void
}
 
const defaultToggles: ChaosToggle[] = [
  { id: "kill-claude",     label: "kill Claude 3.5",     description: "forces failover to next provider",  enabled: false },
  { id: "throttle-gpt4",  label: "throttle GPT-4o",     description: "adds 3s artificial delay",          enabled: false },
  { id: "drop-mcp",       label: "drop MCP server",     description: "web-search tool returns 503",       enabled: false },
  { id: "rate-limit",     label: "simulate rate limit", description: "429 on primary provider",           enabled: false },
]
 
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
  )
}
 
export default function ChaosControls({ toggles = defaultToggles, onToggle }: ChaosControlsProps) {
  // local state used when no onToggle prop provided (static/demo mode)
  const [localToggles, setLocalToggles] = React.useState<ChaosToggle[]>(toggles)
 
  // sync if parent passes new toggles (e.g. backend resets them)
  React.useEffect(() => { setLocalToggles(toggles) }, [toggles])
 
  function handleToggle(id: string) {
    const updated = localToggles.map(t =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    )
    setLocalToggles(updated)
    const toggled = updated.find(t => t.id === id)!
    onToggle?.(id, toggled.enabled)
  }
 
  const anyActive = localToggles.some(t => t.enabled)
 
  return (
    <div className="h-full m-1 rounded-md bg-zinc-900 flex flex-col px-2 pt-1 pb-2 overflow-hidden">
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <span className="text-zinc-400 text-xs font-medium">chaos controls</span>
        {anyActive && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-red-900 text-red-300">
            demo mode
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
 
      <p className="text-zinc-600 text-xs mt-1 shrink-0">
        toggle to inject real failures into the agent pipeline
      </p>
    </div>
  )
}
 
import React from "react"