"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Brain, Database, Filter, FileText } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface AgentMessageProps {
  content: string
  agent: string
  timestamp: Date
}

const agentIcons = {
  调度Agent: Bot,
  知识提取Agent: Brain,
  scRNA数据处理Agent: Database,
  数据过滤Agent: Filter,
  总结Agent: FileText,
}

const agentColors = {
  调度Agent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  知识提取Agent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  scRNA数据处理Agent: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  数据过滤Agent: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  总结Agent: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
}

export function AgentMessage({ content, agent, timestamp }: AgentMessageProps) {
  const IconComponent = agentIcons[agent as keyof typeof agentIcons] || Bot
  const colorClass = agentColors[agent as keyof typeof agentColors] || "bg-gray-100 text-gray-800"

  return (
    <div className="flex justify-start">
      <Card className="max-w-[80%] p-4 bg-card">
        <div className="flex items-center gap-2 mb-3">
          <IconComponent className="h-4 w-4" />
          <Badge variant="secondary" className={colorClass}>
            {agent}
          </Badge>
          <span className="text-xs text-muted-foreground ml-auto">{timestamp.toLocaleTimeString()}</span>
        </div>

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </Card>
    </div>
  )
}
