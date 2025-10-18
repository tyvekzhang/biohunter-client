export interface Agent {
  id: string
  name: string
  type: "scheduler" | "knowledge" | "scrna" | "filter" | "summary"
  status: "idle" | "running" | "completed" | "error"
  progress?: number
  startTime?: Date
  endTime?: Date
  error?: string
}

export interface AgentWorkflow {
  id: string
  agents: Agent[]
  currentAgentIndex: number
  status: "pending" | "running" | "completed" | "error"
  startTime: Date
  endTime?: Date
}

export interface AgentMessage {
  id: string
  agentId: string
  content: string
  type: "progress" | "result" | "error"
  timestamp: Date
  metadata?: Record<string, any>
}
