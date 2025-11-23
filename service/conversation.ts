// SPDX-License-Identifier: MIT
import httpClient, { fetcher } from '@/lib/http';
import { downloadBlob } from '@/service/util';
import { PageResult } from '@/types';
import {
  BatchCreateConversationsRequest,
  BatchDeleteConversationsRequest,
  BatchUpdateConversationsRequest,
  BatchUpdateConversationsResponse,
  CreateConversationRequest,
  ExportConversationsRequest,
  ImportConversationsRequest,
  ImportConversationsResponse,
  ListConversationsRequest,
  Conversation,
  ConversationDetail,
  UpdateConversationRequest,
} from '@/types/conversation';
import { AxiosResponse } from 'axios';
import useSWR from 'swr';


/**
 * Retrieve conversation details.
 *
 * @param ID of the conversation resource.
 * @returns The conversation object containing all its details.
 */
export function useConversation(id: string) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<ConversationDetail>(
    id ? `/conversations/${id}` : null,
    fetcher,
  );

  return {
    conversation: data,
    isLoading,
    isError: error,
    isValidating,
    mutateMenu: mutate,
  };
}

/**
 * List conversations with pagination.
 *
 * @param req Request object containing pagination, filter and sort parameters.
 * @returns Paginated list of conversations and total count.
 */
export function useConversations(req: Partial<ListConversationsRequest>) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    PageResult<Conversation>
  >(['/conversations', req], ([url, params]) => fetcher(url, params));

  return {
    conversations: data?.records,
    total: data?.total,
    isLoading,
    isError: error,
    isValidating,
    mutateConversations: mutate,
  };
}


/**
 * Create a new conversation.
 *
 * @param req Request object containing conversation creation data.
 * @returns The conversation object.
 */
export function createConversation(req: CreateConversationRequest) {
  return httpClient.post<Conversation>('/conversations', req);
}


/**
 * Update an existing conversation.
 *
 * @param req Request object containing conversation update data.
 */
export function updateConversation(req: UpdateConversationRequest) {
  return httpClient.put<Conversation>('/conversations', req);
}


/**
 * Delete conversation by ID
 *
 * @param id The ID of the conversation to delete.
 */
export function deleteConversation(id: string) {
  return httpClient.delete<void>(`/conversations/${id}`);
}


/**
 *  Batch create conversations.
 *
 * @param req Request body containing a list of conversation creation items.
 * @returns Response containing the list of created conversations.
 */
export function batchCreateConversations(req: BatchCreateConversationsRequest) {
  return httpClient.post<number[]>('/conversations:batchCreate', req);
}


/**
 * Batch updates multiple conversations in a single operation.
 *
 * @param req The batch update request data.
 */
export function batchUpdateConversations(req: BatchUpdateConversationsRequest) {
  return httpClient.put<BatchUpdateConversationsResponse>('/conversation:batchUpdate', req);
}


/**
 * Batch delete conversations.
 *
 * @param req Request object containing delete info.
 */
export function batchDeleteConversation(req: BatchDeleteConversationsRequest) {
  return httpClient.delete<void>('/conversations:batchDelete', { data: req });
}


/**
 *  Export the Excel template for conversation import.
 *
 */
export async function exportConversationTemplate() {
  const response = await httpClient.get<AxiosResponse>(
    `/conversations:exportTemplate`,
    {},
    {
      responseType: 'blob',
    },
  );
  downloadBlob(response, 'conversation_import_tpl.xlsx');
}


/**
 * Export conversation data based on the provided conversation IDs.
 *
 * @param req Query parameters specifying the conversations to export.
 */
export async function exportConversation(req: ExportConversationsRequest) {
  const params = {
    ids: req.ids,
  };
  const response = await httpClient.get<AxiosResponse>(
    `/conversations:export`,
    params,
    {
      responseType: 'blob',
    },
  );
  downloadBlob(response, 'conversation_data_export.xlsx');
}


/**
 * Import conversations from an uploaded Excel file.
 *
 * @param req The request with file to import.
 * @returns  List of successfully parsed conversation data.
 */
export function importConversation(req: ImportConversationsRequest) {
  const formData = new FormData();
  formData.append('file', req.file);
  return httpClient.post<ImportConversationsResponse>('/conversations:import', formData);
}