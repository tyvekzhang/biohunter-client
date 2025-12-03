import { create } from 'zustand';
import { conversationApi } from './conversationApi';
import {
  Conversation,
  ConversationState,
  ListConversationsRequest,
  CreateConversationRequest,
  UpdateConversationRequest,
  ConversationDetail,
} from './types';

// Store 中的所有操作（Actions）
interface ConversationActions {
  /** 对应 GET /conversations/{id} */
  fetchConversation: (id: number) => Promise<ConversationDetail>;
  /** 对应 GET /conversations */
  fetchConversationList: (req: ListConversationsRequest) => Promise<void>;
  /** 对应 POST /conversations */
  createNewConversation: (req: CreateConversationRequest) => Promise<Conversation>;
  /** 对应 PUT /conversations */
  updateExistingConversation: (req: UpdateConversationRequest) => Promise<Conversation>;
  /** 对应 DELETE /conversations/{id} */
  deleteConversationById: (id: number) => Promise<void>;

  clearCurrentConversation: () => void;
}

// 组合 State 和 Actions
export const useConversationStore = create<ConversationState & ConversationActions>((set, get) => ({
  // --- 状态 (State) 初始化 ---
  currentConversation: null,
  conversationList: [],
  totalConversations: 0,
  isLoading: false,
  error: null,

  // --- 操作 (Actions) 实现 ---

  fetchConversation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const detail = await conversationApi.getConversation(id);
      set({ currentConversation: detail, isLoading: false });
      return detail;
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, isLoading: false });
      throw new Error(`Failed to fetch conversation ${id}: ${errorMessage}`);
    }
  },

  fetchConversationList: async (req) => {
    set({ isLoading: true, error: null });
    try {
      const response = await conversationApi.listConversations(req);
      set({
        conversationList: response.records,
        totalConversations: response.total,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, isLoading: false });
      throw new Error(`Failed to list conversations: ${errorMessage}`);
    }
  },

  createNewConversation: async (req) => {
    set({ isLoading: true, error: null });
    try {
      const newConv = await conversationApi.createConversation(req);
      
      // 更新列表：将新创建的对话添加到列表头部
      set((state) => ({
        conversationList: [newConv, ...state.conversationList],
        totalConversations: state.totalConversations + 1,
        isLoading: false,
      }));

      // 注意：如果需要自动加载新对话的详情，应在组件中调用 fetchConversation(newConv.id)
      
      return newConv;
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, isLoading: false });
      throw new Error(`Failed to create conversation: ${errorMessage}`);
    }
  },

  updateExistingConversation: async (req) => {
    set({ isLoading: true, error: null });
    try {
      const updatedConv = await conversationApi.updateConversation(req);
      
      set((state) => ({
        // 1. 更新列表中的记录
        conversationList: state.conversationList.map(c =>
          c.id === updatedConv.id ? updatedConv : c
        ),
        // 2. 如果当前选中的是它，更新当前选中的对话（合并字段，保持详情）
        currentConversation: state.currentConversation?.id === updatedConv.id
          ? { ...state.currentConversation, ...updatedConv }
          : state.currentConversation,
        isLoading: false,
      }));
      
      return updatedConv;
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, isLoading: false });
      throw new Error(`Failed to update conversation ${req.id}: ${errorMessage}`);
    }
  },

  deleteConversationById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await conversationApi.deleteConversation(id);
      
      set((state) => ({
        // 1. 从列表中移除
        conversationList: state.conversationList.filter(c => c.id !== id),
        totalConversations: state.totalConversations - 1,
        // 2. 如果删除的是当前对话，清空当前对话
        currentConversation: state.currentConversation?.id === id ? null : state.currentConversation,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, isLoading: false });
      throw new Error(`Failed to delete conversation ${id}: ${errorMessage}`);
    }
  },

  clearCurrentConversation: () => {
    set({ currentConversation: null });
  },
}));