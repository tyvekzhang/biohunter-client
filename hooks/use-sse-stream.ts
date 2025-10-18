"use client"

import { useState, useCallback, useRef } from "react"

export interface StreamMessage {
  type:
    | "workflow_start"
    | "agent_start"
    | "agent_progress"
    | "agent_message"
    | "agent_content_chunk"
    | "agent_complete"
    | "workflow_complete"
    | "error"
  agent?: { type: string; name: string }
  agents?: { type: string; name: string }[]
  index?: number
  progress?: number
  content?: string
  chunk?: string
  messageType?: "progress" | "result" | "error"
  message?: string
  isComplete?: boolean
}

export interface StreamingMessage {
  id: string
  agent: string
  content: string
  isStreaming: boolean
  timestamp: Date
}

export function useSSEStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessages, setStreamingMessages] = useState<StreamingMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const currentMessageRef = useRef<StreamingMessage | null>(null)

  const startStream = useCallback(
    async (message: string, files?: File[], webSearchEnabled: boolean) => {
      if (isStreaming) return

      setIsStreaming(true)
      setError(null)
      setStreamingMessages([])

      try {
        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, files }),
        })

        if (!response.ok) {
          throw new Error("Failed to start stream")
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error("No reader available")
        }

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data: StreamMessage = JSON.parse(line.slice(6))
                handleStreamMessage(data)
              } catch (e) {
                console.error("Failed to parse SSE message:", e)
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Stream failed")
      } finally {
        setIsStreaming(false)
        if (currentMessageRef.current) {
          setStreamingMessages((prev) =>
            prev.map((msg) => (msg.id === currentMessageRef.current?.id ? { ...msg, isStreaming: false } : msg)),
          )
          currentMessageRef.current = null
        }
      }
    },
    [isStreaming],
  )

  const handleStreamMessage = useCallback((data: StreamMessage) => {
    switch (data.type) {
      case "workflow_start":
        console.log("[v0] Workflow started with agents:", data.agents)
        break

      case "agent_start":
        if (data.agent) {
          console.log("[v0] Agent started:", data.agent.name)
          // Create new streaming message for this agent
          const newMessage: StreamingMessage = {
            id: `${data.agent.type}-${Date.now()}`,
            agent: data.agent.name,
            content: "",
            isStreaming: true,
            timestamp: new Date(),
          }
          currentMessageRef.current = newMessage
          setStreamingMessages((prev) => [...prev, newMessage])
        }
        break

      case "agent_progress":
        console.log("[v0] Agent progress:", data.agent?.name, data.progress + "%")
        break

      case "agent_message":
        if (data.agent && data.content && currentMessageRef.current) {
          console.log("[v0] Agent message:", data.content)
          setStreamingMessages((prev) =>
            prev.map((msg) =>
              msg.id === currentMessageRef.current?.id
                ? { ...msg, content: msg.content + (msg.content ? "\n\n" : "") + data.content }
                : msg,
            ),
          )
        }
        break

      case "agent_content_chunk":
        if (data.agent && data.chunk && currentMessageRef.current) {
          setStreamingMessages((prev) =>
            prev.map((msg) =>
              msg.id === currentMessageRef.current?.id ? { ...msg, content: msg.content + data.chunk } : msg,
            ),
          )
        }
        break

      case "agent_complete":
        if (data.agent && currentMessageRef.current) {
          console.log("[v0] Agent completed:", data.agent.name)
          setStreamingMessages((prev) =>
            prev.map((msg) =>
              msg.id === currentMessageRef.current?.id
                ? { ...msg, isStreaming: false, content: data.content || msg.content }
                : msg,
            ),
          )
          currentMessageRef.current = null
        }
        break

      case "workflow_complete":
        console.log("[v0] Workflow completed")
        break

      case "error":
        setError(data.message || "Unknown error occurred")
        break
    }
  }, [])

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsStreaming(false)
    if (currentMessageRef.current) {
      setStreamingMessages((prev) =>
        prev.map((msg) => (msg.id === currentMessageRef.current?.id ? { ...msg, isStreaming: false } : msg)),
      )
      currentMessageRef.current = null
    }
  }, [])

  const clearMessages = useCallback(() => {
    setStreamingMessages([])
    setError(null)
  }, [])

  return {
    isStreaming,
    streamingMessages,
    error,
    startStream,
    stopStream,
    clearMessages,
  }
}
