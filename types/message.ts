// SPDX-License-Identifier: MIT
import {PaginationRequest} from '.';

export interface ListMessagesRequest extends PaginationRequest {
    
    id: string;
    
    role: string;
    
    content: string;
    
    content_type: string;
    
    token_count: number;
    
    meta_data: string;
    
    created_at: string;
    
}

export interface Message {
    
    id: string;
    
    conversation_id: string;
    
    role: string;
    
    content: string;
    
    content_type: string;
    
    token_count: number;
    
    meta_data: string;
    
    created_at: string;
    
}

export interface MessageDetail extends Message {

}

export interface CreateMessage {
    
    conversation_id: string;
    
    role: string;
    
    content: string;
    
    content_type: string;
    
    token_count: number;
    
    meta_data: string;
    
}

export interface CreateMessageRequest {
message: CreateMessage;
}

export interface UpdateMessage {
    
    id: string;
    
    conversation_id: string;
    
    role: string;
    
    content: string;
    
    content_type: string;
    
    token_count: number;
    
    meta_data: string;
    
}

export interface UpdateMessageRequest {
message: UpdateMessage;
}

export interface BatchGetMessagesResponse {
    messages: MessageDetail[];
}

export interface BatchCreateMessagesRequest {
    messages: CreateMessage[];
}

export interface BatchCreateMessageResponse {
    messages: Message[];
}

export interface BatchUpdateMessage {
    
    conversation_id: string;
    
    role: string;
    
    content: string;
    
    content_type: string;
    
    token_count: number;
    
    meta_data: string;
    
}

export interface BatchUpdateMessagesRequest {
    ids: string[];
    message: BatchUpdateMessage;
}

export interface BatchPatchMessagesRequest {
    messages: UpdateMessage[];
}

export interface BatchUpdateMessagesResponse {
    messages: Message[];
}

export interface BatchDeleteMessagesRequest {
    ids: string[];
}

export interface ExportMessage extends Message {
}

export interface ExportMessagesRequest {
    ids: string[];
}

export interface ImportMessagesRequest {
    file: File;
}

export interface ImportMessage extends CreateMessage {
    errMsg: string;
}

export interface ImportMessagesResponse {
    messages: ImportMessage[];
}