"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Conversation, ConversationMessage } from "@/types/conversation"
import { MOCK_CONVERSATIONS } from "@/data/mock-conversations"
import { useIsEnglish } from "@/hooks/use-is-english"

const MAX_CONVERSATIONS = 100
const STORAGE_KEY = "multi-agent-chat-conversations"

interface ConversationState {
  // State
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  
  // Actions
  createConversation: (title?: string, initialMessage?: ConversationMessage) => Conversation
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void
  addMessageToConversation: (conversationId: string, message: ConversationMessage) => void
  deleteConversation: (conversationId: string) => void
  starConversation: (conversationId: string, starred: boolean) => void
  renameConversation: (conversationId: string, newTitle: string) => void
  exportConversation: (conversationId: string) => void
  clearAllConversations: () => void
  setCurrentConversationId: (conversationId: string | null) => void
  loadDemoData: () => void
  
  // Getters
  getCurrentConversation: () => Conversation | null
  getConversationStats: () => { 
    total: number; 
    starred: number; 
    totalMessages: number; 
    avgMessagesPerConv: number 
  }
}

// 工具函数移到外部
function generateTitleFromMessage(content: string, isEnglish: boolean): string {
  const words = content.trim().split(/\s+/).slice(0, 6)
  let title = words.join(" ")

  if (title.length > 30) {
    title = title.slice(0, 27) + "..."
  }

  const defaultTitle = isEnglish ? "New chat" : "新对话"
  return title || defaultTitle
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      currentConversationId: null,
      isLoading: false, // Zustand persist 会自动处理加载状态

      // Actions
      createConversation: (title?: string, initialMessage?: ConversationMessage) => {
        const isEnglish = useIsEnglish() // 需要在组件内调用，这里需要调整
        
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

        set((state) => {
          const updatedConversations = [conversation, ...state.conversations].slice(0, MAX_CONVERSATIONS)
          return {
            conversations: updatedConversations,
            currentConversationId: conversation.id
          }
        })

        return conversation
      },

      updateConversation: (conversationId: string, updates: Partial<Conversation>) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId 
              ? { ...conv, ...updates, updatedAt: new Date() } 
              : conv
          )
        }))
      },

      addMessageToConversation: (conversationId: string, message: ConversationMessage) => {
        const isEnglish = useIsEnglish() // 需要在组件内调用
        
        set((state) => ({
          conversations: state.conversations.map((conv) => {
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
                title:
                  conv.title === (isEnglish ? "New Conversation" : "新对话") && message.type === "user"
                    ? generateTitleFromMessage(message.content, isEnglish)
                    : conv.title,
              }
            }
            return conv
          })
        }))
      },

      deleteConversation: (conversationId: string) => {
        set((state) => {
          const shouldClearCurrent = state.currentConversationId === conversationId
          return {
            conversations: state.conversations.filter((conv) => conv.id !== conversationId),
            currentConversationId: shouldClearCurrent ? null : state.currentConversationId
          }
        })
      },

      starConversation: (conversationId: string, starred: boolean) => {
        const { updateConversation } = get()
        updateConversation(conversationId, { isStarred: starred })
      },

      renameConversation: (conversationId: string, newTitle: string) => {
        const { updateConversation } = get()
        updateConversation(conversationId, { title: newTitle })
      },

      exportConversation: (conversationId: string) => {
        const state = get()
        const conversation = state.conversations.find((conv) => conv.id === conversationId)
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

      clearAllConversations: () => {
        set({ conversations: [], currentConversationId: null })
      },

      setCurrentConversationId: (conversationId: string | null) => {
        set({ currentConversationId: conversationId })
      },

      loadDemoData: () => {
        set({ 
          conversations: MOCK_CONVERSATIONS,
          currentConversationId: null
        })
      },

      // Getters
      getCurrentConversation: () => {
        const state = get()
        return state.conversations.find((conv) => conv.id === state.currentConversationId) || null
      },

      getConversationStats: () => {
        const state = get()
        const total = state.conversations.length
        const starred = state.conversations.filter((conv) => conv.isStarred).length
        const totalMessages = state.conversations.reduce((sum, conv) => sum + conv.messages.length, 0)
        const avgMessagesPerConv = total > 0 ? Math.round(totalMessages / total) : 0

        return { total, starred, totalMessages, avgMessagesPerConv }
      },
    }),
    {
      name: STORAGE_KEY,
      // 自定义序列化/反序列化来处理 Date 对象
      serialize: (state) => {
        return JSON.stringify(state)
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str)
        // 恢复 Date 对象
        if (parsed.state?.conversations) {
          parsed.state.conversations = parsed.state.conversations.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
          }))
        }
        return parsed
      },
    }
  )
)