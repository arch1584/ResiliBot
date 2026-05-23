import { useState, useRef, useEffect } from "react"
 
export type MessageRole = "user" | "agent"
export type AgentStepStatus = "pending" | "running" | "done" | "failed"
 
export interface AgentStep {
  id: string
  label: string                // e.g. "searching GitHub..."
  status: AgentStepStatus
  detail?: string              // optional extra info, e.g. "found 3 commits"
}
 
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string              // final text content
  timestamp: string            // ISO string
  providerUsed?: string        // e.g. "Claude 3.5 Sonnet" — shown as tag
  wasFallback?: boolean        // true = show amber fallback tag instead of green
  steps?: AgentStep[]          // agent thinking trace, shown above final content
}
 
interface RightPanelProps {
  messages?: ChatMessage[]
  isThinking?: boolean         // true while agent is mid-task
  onSendPrompt: (prompt: string) => void
}
 
function StepTrace({ steps }: { steps: AgentStep[] }) {
  const statusIcon: Record<AgentStepStatus, string> = {
    pending: "text-zinc-500",
    running: "text-blue-400 animate-pulse",
    done:    "text-emerald-400",
    failed:  "text-red-400",
  }
  const statusSymbol: Record<AgentStepStatus, string> = {
    pending: "○",
    running: "◎",
    done:    "✓",
    failed:  "✗",
  }
  return (
    <div className="mb-2 flex flex-col gap-0.5">
      {steps.map(step => (
        <div key={step.id} className="flex items-start gap-1.5 text-xs">
          <span className={`font-mono mt-0.5 ${statusIcon[step.status]}`}>
            {statusSymbol[step.status]}
          </span>
          <span className="text-zinc-400">{step.label}</span>
          {step.detail && (
            <span className="text-zinc-600 ml-1">{step.detail}</span>
          )}
        </div>
      ))}
    </div>
  )
}
 
function Message({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user"
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0
        ${isUser ? "bg-blue-900 text-blue-300" : "bg-emerald-900 text-emerald-300"}`}>
        {isUser ? "U" : "R"}
      </div>
 
      <div className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        {/* agent thinking trace */}
        {!isUser && msg.steps && msg.steps.length > 0 && (
          <StepTrace steps={msg.steps} />
        )}
 
        {/* bubble */}
        <div className={`text-sm px-3 py-2 rounded-xl leading-relaxed
          ${isUser
            ? "bg-blue-900 text-blue-100 rounded-br-sm"
            : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
          }`}>
          {msg.content}
        </div>
 
        {/* provider tag */}
        {!isUser && msg.providerUsed && (
          <div className={`flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full
            ${msg.wasFallback
              ? "bg-amber-900 text-amber-300"
              : "bg-emerald-900 text-emerald-300"
            }`}>
            <span>{msg.wasFallback ? "↩ fallback · " : "✓ "}{msg.providerUsed}</span>
          </div>
        )}
      </div>
    </div>
  )
}
 
const defaultMessages: ChatMessage[] = [
  {
    id: "1",
    role: "agent",
    content: "Hello! I'm ResiliBot. Give me a task and I'll get it done — even if my infrastructure fights back.",
    timestamp: new Date().toISOString(),
    providerUsed: "Claude 3.5 Sonnet",
    wasFallback: false,
    steps: [],
  }
]
 
export default function RightPanel({
  messages = defaultMessages,
  isThinking = false,
  onSendPrompt,
}: RightPanelProps) {
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
 
  // auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])
 
  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed) return
    onSendPrompt(trimmed)
    setInput("")
  }
 
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
 
  return (
    <div className="bg-zinc-700 border border-zinc-600 rounded-md flex flex-col h-full">
 
      {/* messages area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {messages.map(msg => (
          <Message key={msg.id} msg={msg} />
        ))}
 
        {/* thinking indicator */}
        {isThinking && (
          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-xs shrink-0">
              R
            </div>
            <div className="text-zinc-500 text-sm animate-pulse">thinking...</div>
          </div>
        )}
 
        <div ref={bottomRef} />
      </div>
 
      {/* input bar — pinned to bottom */}
      <div className="shrink-0 p-2 border-t border-zinc-600 grid grid-cols-5 gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Give the agent a task..."
          disabled={isThinking}
          className="col-span-4 border border-zinc-600 p-2 rounded-lg text-sm text-white bg-zinc-800 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isThinking || !input.trim()}
          className="border border-zinc-600 rounded-lg text-sm text-white bg-zinc-800 hover:bg-zinc-600 transition-colors disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  )
}