export interface ConversationMessage {
  id: string
  type: "user" | "agent"
  content: string
  agent?: string
  timestamp: Date
  files?: File[]
}

export interface Conversation {
  id: string
  title: string
  messages: ConversationMessage[]
  createdAt: Date
  updatedAt: Date
  preview: string
  tags?: string[]
  isStarred?: boolean
}

export interface ConversationFilter {
  search?: string
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  starred?: boolean
}
