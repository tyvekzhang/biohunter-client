export interface ChatRequest {
  user_id: string;
  conversation_id: number;
  file_ids: number[];
  content: string;
}

export interface ConversationItem {
  id: string;
  title: string;
  messages: Message[];
  isStarred?: boolean;
  preview?: string;
}

export interface Message {
  id: string;
  role?: "user" | "assistant";
  content: string;
  timestamp: Date;
  type: "user" | "assistant";
  files?: File[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  isStarred?: boolean;
  preview?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatCompletionRequest {
  messages: Message[];
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
}
