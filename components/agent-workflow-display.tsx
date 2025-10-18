"use client"
import { CheckCircle, Clock, Loader2, ChevronRight, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { useIsEnglish } from "@/hooks/use-is-english"

interface WorkflowData {
  task: string
  overview: {
    requirement: string
    fileContent: string
  }
  taskList: string[]
  agents: Array<{
    name: string
    summary: string
    detail: string[]
  }>
  conclusion: {
    keyFindings: string[]
    nextSteps: string[]
  }
}

interface AgentWorkflowDisplayProps {
  workflowData: WorkflowData
}

type AgentStatus = "idle" | "running" | "completed"

interface AgentState {
  status: AgentStatus
  expanded: boolean
  visible: boolean // Added visibility control for sequential display
}

export function AgentWorkflowDisplay({ workflowData }: AgentWorkflowDisplayProps) {
  const [currentPhase, setCurrentPhase] = useState<"initial" | "loading" | "agents">("initial")
  const [agentStates, setAgentStates] = useState<AgentState[]>(
    workflowData.agents.map((_, index) => ({
      status: "idle",
      expanded: false,
      visible: index === 0,
    })),
  )
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0)
  const isEnglish = useIsEnglish()

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setCurrentPhase("loading")
    }, 1000)

    const timer2 = setTimeout(() => {
      setCurrentPhase("agents")
      setAgentStates((prev) =>
        prev.map((state, index) => (index === 0 ? { ...state, status: "running", visible: true } : state)),
      )
    }, 3000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  useEffect(() => {
    if (currentPhase !== "agents") return

    const currentAgent = agentStates[currentAgentIndex]
    if (!currentAgent || currentAgent.status !== "running") return

    // Auto-complete current agent after 2 seconds
    const timer = setTimeout(() => {
      setAgentStates((prev) =>
        prev.map((state, index) =>
          index === currentAgentIndex ? { ...state, status: "completed", expanded: false } : state,
        ),
      )
    }, 2000)

    // Start next agent after a brief delay
    setTimeout(() => {
      if (currentAgentIndex < workflowData.agents.length - 1) {
        const nextIndex = currentAgentIndex + 1
        setAgentStates((prev) =>
          prev.map((state, index) => (index === nextIndex ? { ...state, status: "running", visible: true } : state)),
        )
        setCurrentAgentIndex(nextIndex)
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [currentAgentIndex, agentStates, currentPhase, workflowData.agents.length])

  const toggleAgentExpansion = (agentIndex: number) => {
    setAgentStates((prev) =>
      prev.map((state, index) => (index === agentIndex ? { ...state, expanded: !state.expanded } : state)),
    )
  }

  if (currentPhase === "initial") {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <p className="text-sm text-gray-700 dark:text-gray-300">{workflowData.overview.requirement}</p>
        </div>
      </div>
    )
  }

  if (currentPhase === "loading") {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <p className="text-sm text-gray-700 dark:text-gray-300">{workflowData.overview.requirement}</p>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Loader2 className="h-5 w-5 text-blue-500" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isEnglish ? "Processing file content and initializing analysis..." : "正在处理文件内容并初始化分析..."}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: "60%" }}></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isEnglish ? "Analyzing single-cell transcriptome data..." : "正在分析单细胞转录组数据..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 py-3 pr-2">
      {/* Initial message */}
      <div className="bg-white dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">{workflowData.overview.requirement}</p>
        </div>
      </div>

      <div className="font-semibold">文件内容</div>
      {/* Metadata message */}
      <div className="bg-white dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">{workflowData.overview.fileContent}</p>
        </div>
      </div>

      {/* Agents display */}
      <div className="space-y-3">
        {workflowData.agents.map((agent, index) => {
          const agentState = agentStates[index]

          if (!agentState.visible) return null

          const StatusIcon =
            agentState.status === "running" ? Loader2 : agentState.status === "completed" ? CheckCircle : Clock
          const ChevronIcon = agentState.expanded ? ChevronDown : ChevronRight

          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border"
            >
              <div
                className={`flex items-center justify-between p-4 ${
                  agentState.status === "completed"
                    ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    : ""
                }`}
                onClick={() => toggleAgentExpansion(index)}
              >
                <div className="flex items-center gap-3">
                  {(agentState.status === "completed" ||
                    agentState.status === "running") && (
                    <ChevronIcon className="h-4 w-4 text-gray-500" />
                  )}

                  <StatusIcon
                    className={`
                    h-5 w-5 
                    ${
                      agentState.status === "running"
                        ? "animate-spin text-blue-500"
                        : agentState.status === "completed"
                        ? "text-green-500"
                        : "text-gray-400"
                    }
                    `}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {agent.summary}
                    </p>
                  </div>
                </div>
              </div>

              {agentState.expanded && (
                <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="pt-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {isEnglish ? "Details:" : "详细信息："}
                    </h4>
                    <ul className="space-y-1">
                      {agent.detail.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                        >
                          <span className="text-gray-400 inline-block w-2 flex-shrink-0 leading-5">
                            •
                          </span>
                          <span className="flex-1">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {agentStates.filter((state) => state.visible).every((state) => state.status === "completed") &&
        agentStates.filter((state) => state.visible).length === workflowData.agents.length && (
          <div className="p-6 rounded-lg border">
            <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
              {isEnglish ? "Analysis Complete" : "分析完成"}
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {isEnglish ? "Key Findings:" : "关键发现："}
                </h4>
                <ul className="space-y-1">
                  {workflowData.conclusion.keyFindings.map((finding, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-green-500 inline-block w-2 flex-shrink-0 leading-5">•</span>
                      <span className="flex-1">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {isEnglish ? "Next Steps:" : "下一步建议："}
                </h4>
                <ul className="space-y-1">
                  {workflowData.conclusion.nextSteps.map((step, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-blue-500 inline-block w-2 flex-shrink-0 leading-5">•</span>
                      <span className="flex-1">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
