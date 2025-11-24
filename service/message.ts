// SPDX-License-Identifier: MIT
import httpClient, { fetcher } from '@/lib/http';
import { downloadBlob } from '@/service/util';
import { PageResult } from '@/types';
import {
  BatchCreateMessagesRequest,
  BatchDeleteMessagesRequest,
  BatchUpdateMessagesRequest,
  BatchUpdateMessagesResponse,
  CreateMessageRequest,
  ExportMessagesRequest,
  ImportMessagesRequest,
  ImportMessagesResponse,
  ListMessagesRequest,
  Message,
  MessageDetail,
  UpdateMessageRequest,
} from '@/types/message';
import { AxiosResponse } from 'axios';
import useSWR from 'swr';


/**
 * Retrieve message details.
 *
 * @param ID of the message resource.
 * @returns The message object containing all its details.
 */
export function useMessage(id: string) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<MessageDetail>(
    id ? `/messages/${id}` : null,
    fetcher,
  );

  return {
    message: data,
    isLoading,
    isError: error,
    isValidating,
    mutateMenu: mutate,
  };
}

/**
 * List messages with pagination.
 *
 * @param req Request object containing pagination, filter and sort parameters.
 * @returns Paginated list of messages and total count.
 */
export function useMessages(req: Partial<ListMessagesRequest>) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    PageResult<Message>
  >(['/messages', req], ([url, params]) => fetcher(url, params));

  return {
    messages: data?.records,
    total: data?.total,
    isLoading,
    isError: error,
    isValidating,
    mutateMessages: mutate,
  };
}


/**
 * Create a new message.
 *
 * @param req Request object containing message creation data.
 * @returns The message object.
 */
export function createMessage(req: CreateMessageRequest) {
  return httpClient.post<Message>('/messages', req);
}


/**
 * Update an existing message.
 *
 * @param req Request object containing message update data.
 */
export function updateMessage(req: UpdateMessageRequest) {
  return httpClient.put<Message>('/messages', req);
}


/**
 * Delete message by ID
 *
 * @param id The ID of the message to delete.
 */
export function deleteMessage(id: string) {
  return httpClient.delete<void>(`/messages/${id}`);
}


/**
 *  Batch create messages.
 *
 * @param req Request body containing a list of message creation items.
 * @returns Response containing the list of created messages.
 */
export function batchCreateMessages(req: BatchCreateMessagesRequest) {
  return httpClient.post<number[]>('/messages:batchCreate', req);
}


/**
 * Batch updates multiple messages in a single operation.
 *
 * @param req The batch update request data.
 */
export function batchUpdateMessages(req: BatchUpdateMessagesRequest) {
  return httpClient.put<BatchUpdateMessagesResponse>('/message:batchUpdate', req);
}


/**
 * Batch delete messages.
 *
 * @param req Request object containing delete info.
 */
export function batchDeleteMessage(req: BatchDeleteMessagesRequest) {
  return httpClient.delete<void>('/messages:batchDelete', { data: req });
}


/**
 *  Export the Excel template for message import.
 *
 */
export async function exportMessageTemplate() {
  const response = await httpClient.get<AxiosResponse>(
    `/messages:exportTemplate`,
    {},
    {
      responseType: 'blob',
    },
  );
  downloadBlob(response, 'message_import_tpl.xlsx');
}


/**
 * Export message data based on the provided message IDs.
 *
 * @param req Query parameters specifying the messages to export.
 */
export async function exportMessage(req: ExportMessagesRequest) {
  const params = {
    ids: req.ids,
  };
  const response = await httpClient.get<AxiosResponse>(
    `/messages:export`,
    params,
    {
      responseType: 'blob',
    },
  );
  downloadBlob(response, 'message_data_export.xlsx');
}


/**
 * Import messages from an uploaded Excel file.
 *
 * @param req The request with file to import.
 * @returns  List of successfully parsed message data.
 */
export function importMessage(req: ImportMessagesRequest) {
  const formData = new FormData();
  formData.append('file', req.file);
  return httpClient.post<ImportMessagesResponse>('/messages:import', formData);
}