"use client"

import { useState, useCallback } from "react"
import type { Agent, AgentWorkflow, AgentMessage } from "@/types/agent"

const AGENT_CONFIGS = {
  scheduler: { name: "调度Agent", type: "scheduler" as const },
  knowledge: { name: "知识提取Agent", type: "knowledge" as const },
  scrna: { name: "scRNA数据处理Agent", type: "scrna" as const },
  filter: { name: "数据过滤Agent", type: "filter" as const },
  summary: { name: "总结Agent", type: "summary" as const },
}

export function useAgentManager() {
  const [workflows, setWorkflows] = useState<AgentWorkflow[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([])

  const createAgent = useCallback((type: keyof typeof AGENT_CONFIGS): Agent => {
    const config = AGENT_CONFIGS[type]
    return {
      id: `${type}-${Date.now()}`,
      name: config.name,
      type: config.type,
      status: "idle",
      progress: 0,
    }
  }, [])

  const startWorkflow = useCallback(
    (agentTypes: (keyof typeof AGENT_CONFIGS)[]) => {
      const workflowAgents = agentTypes.map((type) => createAgent(type))

      const workflow: AgentWorkflow = {
        id: `workflow-${Date.now()}`,
        agents: workflowAgents,
        currentAgentIndex: 0,
        status: "pending",
        startTime: new Date(),
      }

      setWorkflows((prev) => [...prev, workflow])
      setAgents((prev) => [...prev, ...workflowAgents])

      // Start the first agent
      if (workflowAgents.length > 0) {
        updateAgentStatus(workflowAgents[0].id, "running")
        workflow.status = "running"
      }

      return workflow
    },
    [createAgent],
  )

  const updateAgentStatus = useCallback(
    (agentId: string, status: Agent["status"], progress?: number, error?: string) => {
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === agentId
            ? {
                ...agent,
                status,
                progress: progress ?? agent.progress,
                error,
                endTime: status === "completed" || status === "error" ? new Date() : agent.endTime,
                startTime: status === "running" && !agent.startTime ? new Date() : agent.startTime,
              }
            : agent,
        ),
      )

      // Update workflow status
      setWorkflows((prev) =>
        prev.map((workflow) => {
          const agentIndex = workflow.agents.findIndex((a) => a.id === agentId)
          if (agentIndex === -1) return workflow

          const updatedAgents = [...workflow.agents]
          updatedAgents[agentIndex] = {
            ...updatedAgents[agentIndex],
            status,
            progress: progress ?? updatedAgents[agentIndex].progress,
            error,
          }

          let newWorkflowStatus = workflow.status
          let newCurrentIndex = workflow.currentAgentIndex

          if (status === "completed" && agentIndex === workflow.currentAgentIndex) {
            // Move to next agent
            if (agentIndex < workflow.agents.length - 1) {
              newCurrentIndex = agentIndex + 1
              // Start next agent
              setTimeout(() => {
                updateAgentStatus(updatedAgents[newCurrentIndex].id, "running")
              }, 1000)
            } else {
              // All agents completed
              newWorkflowStatus = "completed"
            }
          } else if (status === "error") {
            newWorkflowStatus = "error"
          }

          return {
            ...workflow,
            agents: updatedAgents,
            currentAgentIndex: newCurrentIndex,
            status: newWorkflowStatus,
            endTime: newWorkflowStatus === "completed" || newWorkflowStatus === "error" ? new Date() : workflow.endTime,
          }
        }),
      )
    },
    [],
  )

  const addAgentMessage = useCallback(
    (agentId: string, content: string, type: AgentMessage["type"] = "progress", metadata?: Record<string, any>) => {
      const message: AgentMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        agentId,
        content,
        type,
        timestamp: new Date(),
        metadata,
      }

      setAgentMessages((prev) => [...prev, message])
      return message
    },
    [],
  )

  const getActiveWorkflow = useCallback(() => {
    return workflows.find((w) => w.status === "running" || w.status === "pending")
  }, [workflows])

  const getAgentById = useCallback(
    (agentId: string) => {
      return agents.find((a) => a.id === agentId)
    },
    [agents],
  )

  const getMessagesByAgent = useCallback(
    (agentId: string) => {
      return agentMessages.filter((m) => m.agentId === agentId)
    },
    [agentMessages],
  )

  return {
    workflows,
    agents,
    agentMessages,
    startWorkflow,
    updateAgentStatus,
    addAgentMessage,
    getActiveWorkflow,
    getAgentById,
    getMessagesByAgent,
    createAgent,
  }
}
