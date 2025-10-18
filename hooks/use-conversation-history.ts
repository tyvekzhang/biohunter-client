"use client"

import { useState, useCallback, useEffect } from "react"
import type { Conversation, ConversationMessage, ConversationFilter } from "@/types/conversation"
import { MOCK_CONVERSATIONS } from "@/data/mock-conversations"
import { useIsEnglish } from "@/hooks/use-is-english"

const STORAGE_KEY = "multi-agent-chat-conversations"
const MAX_CONVERSATIONS = 100

export function useConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isEnglish = useIsEnglish()

  // Load conversations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        setConversations(conversationsWithDates)
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
      } catch (error) {
        console.error("Failed to save conversations:", error)
      }
    }
  }, [conversations, isLoading])

  const loadDemoData = useCallback(() => {
    setConversations(MOCK_CONVERSATIONS)
    setCurrentConversationId(null)
  }, [])

  const createConversation = useCallback((title?: string, initialMessage?: ConversationMessage): Conversation => {
    const now = new Date()
    const conversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title || (isEnglish ? "New Conversation" : "新对话"),
      messages: initialMessage ? [initialMessage] : [],
      createdAt: now,
      updatedAt: now,
      preview: initialMessage?.content || (isEnglish ? "Start a new conversation..." : "开始新对话..."),
      tags: [],
      isStarred: false,
    }

    setConversations((prev) => {
      const updated = [conversation, ...prev]
      // Keep only the most recent conversations
      return updated.slice(0, MAX_CONVERSATIONS)
    })

    setCurrentConversationId(conversation.id)
    return conversation
  }, [isEnglish])

  const updateConversation = useCallback((conversationId: string, updates: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === conversationId ? { ...conv, ...updates, updatedAt: new Date() } : conv)),
    )
  }, [])

  const addMessageToConversation = useCallback((conversationId: string, message: ConversationMessage) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const updatedMessages = [...conv.messages, message]
          const preview =
            message.type === "user"
              ? message.content.slice(0, 100) + (message.content.length > 100 ? "..." : "")
              : conv.preview

          return {
            ...conv,
            messages: updatedMessages,
            updatedAt: new Date(),
            preview,
            // Auto-generate title from first user message if still default
            title:
              conv.title === (isEnglish ? "New Conversation" : "新对话") && message.type === "user"
                ? generateTitleFromMessage(message.content)
                : conv.title,
          }
        }
        return conv
      }),
    )
  }, [isEnglish])

  const deleteConversation = useCallback(
    (conversationId: string) => {
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null)
      }
    },
    [currentConversationId],
  )

  const starConversation = useCallback(
    (conversationId: string, starred: boolean) => {
      updateConversation(conversationId, { isStarred: starred })
    },
    [updateConversation],
  )

  const renameConversation = useCallback(
    (conversationId: string, newTitle: string) => {
      updateConversation(conversationId, { title: newTitle })
    },
    [updateConversation],
  )

  const exportConversation = useCallback(
    (conversationId: string) => {
      const conversation = conversations.find((conv) => conv.id === conversationId)
      if (!conversation) return

      const exportData = {
        title: conversation.title,
        createdAt: conversation.createdAt,
        messages: conversation.messages.map((msg) => ({
          type: msg.type,
          content: msg.content,
          agent: msg.agent,
          timestamp: msg.timestamp,
        })),
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${conversation.title.replace(/[^a-z0-9]/gi, "_")}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    [conversations],
  )

  const clearAllConversations = useCallback(() => {
    setConversations([])
    setCurrentConversationId(null)
  }, [])

  const getCurrentConversation = useCallback(() => {
    return conversations.find((conv) => conv.id === currentConversationId) || null
  }, [conversations, currentConversationId])

  const getConversationStats = useCallback(() => {
    const total = conversations.length
    const starred = conversations.filter((conv) => conv.isStarred).length
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0)
    const avgMessagesPerConv = total > 0 ? Math.round(totalMessages / total) : 0

    return { total, starred, totalMessages, avgMessagesPerConv }
  }, [conversations])

  return {
    conversations,
    currentConversationId,
    isLoading,
    createConversation,
    updateConversation,
    addMessageToConversation,
    deleteConversation,
    starConversation,
    renameConversation,
    exportConversation,
    clearAllConversations,
    getCurrentConversation,
    getConversationStats,
    setCurrentConversationId,
    loadDemoData,
  }
}

function generateTitleFromMessage(content: string): string {
  
  // Extract meaningful title from message content
  const words = content.trim().split(/\s+/).slice(0, 6)
  let title = words.join(" ")

  if (title.length > 30) {
    title = title.slice(0, 27) + "..."
  }

  const isEnglish = useIsEnglish()
  let defaultTitle = "新对话"
  if (isEnglish) {
    defaultTitle = "New chat"
  }

  return title || defaultTitle
}