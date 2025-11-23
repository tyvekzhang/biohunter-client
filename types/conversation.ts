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



import { PaginationRequest } from '.';

export interface ListConversationsRequest extends PaginationRequest {

  id: string;

  title: string;

  is_default: number;

  update_at: string;

  created_at: string;

}


export interface ConversationDetail extends Conversation {

}

export interface CreateConversation {
  title: string
}

export interface CreateConversationRequest {
  conversation: CreateConversation;
}

export interface UpdateConversation {

  id: string;

  title: string;

  is_default: number;

  update_at: string;

}

export interface UpdateConversationRequest {
  conversation: UpdateConversation;
}

export interface BatchGetConversationsResponse {
  conversations: ConversationDetail[];
}

export interface BatchCreateConversationsRequest {
  conversations: CreateConversation[];
}

export interface BatchCreateConversationResponse {
  conversations: Conversation[];
}

export interface BatchUpdateConversation {

  title: string;

  is_default: number;

  update_at: string;

}

export interface BatchUpdateConversationsRequest {
  ids: string[];
  conversation: BatchUpdateConversation;
}

export interface BatchPatchConversationsRequest {
  conversations: UpdateConversation[];
}

export interface BatchUpdateConversationsResponse {
  conversations: Conversation[];
}

export interface BatchDeleteConversationsRequest {
  ids: string[];
}

export interface ExportConversation extends Conversation {
}

export interface ExportConversationsRequest {
  ids: string[];
}

export interface ImportConversationsRequest {
  file: File;
}

export interface ImportConversation extends CreateConversation {
  errMsg: string;
}

export interface ImportConversationsResponse {
  conversations: ImportConversation[];
}