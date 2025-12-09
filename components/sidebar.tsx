"use client";

import { ConversationItem } from "@/components/conversation-item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsEnglish } from "@/hooks/use-is-english";
import { Conversation } from "@/types/chat";
import {
  MoreVertical,
  PanelLeftOpen,
  Plus,
  Star,
  Trash2
} from "lucide-react";
import { useState } from "react";

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onStarConversation: (id: string, starred: boolean) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDuplicateConversation: (id: string) => void;
  onExportConversation: (id: string) => void;
  onClearAllConversations: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  getConversationStats: () => any;
}

export function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onStarConversation,
  onRenameConversation,
  onDuplicateConversation,
  onExportConversation,
  onClearAllConversations,
  collapsed,
  onToggleCollapse,
  getConversationStats
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const [clearHistoryDialogOpen, setClearHistoryDialogOpen] = useState(false);

  const stats = getConversationStats();
  const isEnglish = useIsEnglish();

  const handleNewConversation = () => {
    onCreateConversation();
  };

  const handleConversationClick = (conversationId: string) => {
    onSelectConversation(conversationId);
  };

  const handleRename = (conversationId: string, newTitle: string) => {
    onRenameConversation(conversationId, newTitle);
  };

  const handleStar = (conversationId: string, starred: boolean) => {
    onStarConversation(conversationId, starred);
  };

  const handleDuplicate = (conversationId: string) => {
    onDuplicateConversation(conversationId);
  };

  const handleExport = (conversationId: string) => {
    onExportConversation(conversationId);
  };

  const handleDeleteClick = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete);
    }
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  const handleClearHistoryClick = () => {
    setClearHistoryDialogOpen(true);
  };

  const handleConfirmClearHistory = () => {
    onClearAllConversations();
    setClearHistoryDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-screen z-50">
      {/* Delete Conversation Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEnglish ? "Delete conversation?" : "确认删除对话？"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isEnglish
                ? "This action cannot be undone. This will permanently delete the conversation."
                : "此操作无法撤销。对话将被永久删除。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-none">
              {isEnglish ? "Cancel" : "取消"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isEnglish ? "Delete" : "删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear History Confirmation Dialog */}
      <AlertDialog
        open={clearHistoryDialogOpen}
        onOpenChange={setClearHistoryDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEnglish ? "Clear all conversations?" : "确认清空所有对话？"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isEnglish
                ? "This will permanently delete all your conversations and cannot be undone."
                : "此操作将永久删除所有对话记录且无法恢复。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-none">
              {isEnglish ? "Cancel" : "取消"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClearHistory}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isEnglish ? "Clear All" : "清空全部"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="border-b border-border">
        <div className="px-4 pt-4 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold cursor-pointer">
              {"BioHunter".split("").map((char, i) =>
                i === 3 ? (
                  <span key={i} className="border-b-3 border-primary">
                    {char}
                  </span>
                ) : (
                  char
                )
              )}
            </h2>
            <div className="flex items-center gap-1">
              {/* Hide Sidebar Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                title={isEnglish ? "Hide Sidebar" : "隐藏侧边栏"}
              >
                <PanelLeftOpen className="h-4 w-4 transform rotate-180 scale-120 text-gray-600 hover:text-gray-700" />
              </Button>
            </div>
          </div>
        </div>

        <div className="px-3 space-y-2 mt-4">
          <Button
            onClick={handleNewConversation}
            type="button"
            aria-label={isEnglish ? "New Chat" : "新建对话"}
            className="
              bg-primary/10 text-primary hover:bg-primary/10 cursor-pointer
              group w-full inline-flex items-center justify-start gap-2 
              rounded-lg py-2 font-medium
              backdrop-blur-md
              border border-primary/10 ring-1 ring-primary/5
              hover:ring-primary/10
              shadow-[0_2px_10px_-2px_rgba(0,0,0,.15)] hover:shadow-[0_10px_24px_-12px_rgba(0,0,0,.25)]
              transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400
              dark:text-white dark:bg-white/10 dark:border-white/15 dark:hover:bg-white/15
            "
            variant="secondary"
          >
            <Plus className="h-4 w-4 opacity-80 transition-all duration-200 group-hover:opacity-100" />
            {isEnglish ? "New Chat" : "新建对话"}
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center p-4 gap-4 mt-3 text-xs text-muted-foreground py-2 justify-between">
          <div className="flex items-center gap-4 ">
            <span className="text-sm">
              {isEnglish ? "Historical dialogue" : "历史对话"}
            </span>
            {stats.starred > 0 && (
              <span>
                {isEnglish ? "Starred" : "收藏"}: {stats.starred}
              </span>
            )}
          </div>
          <div className="border-none">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowStarredOnly(!showStarredOnly)}
                  disabled={!(conversations && conversations.length > 0)}
                >
                  <Star
                    className={`h-4 w-4 mr-2 ${
                      showStarredOnly ? "fill-current" : ""
                    }`}
                  />
                  {showStarredOnly
                    ? isEnglish
                      ? "Show All"
                      : "显示全部"
                    : isEnglish
                    ? "Starred Only"
                    : "只看收藏"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleClearHistoryClick}
                  className="text-destructive"
                  disabled={!(conversations && conversations.length > 0)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isEnglish ? "Clear History" : "清空历史"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Conversations list */}
      <div className="min-h-96 overflow-auto z-50">
        <div className="p-2 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">
                {searchQuery || showStarredOnly
                  ? isEnglish
                    ? "No matching conversations found"
                    : "没有找到匹配的对话"
                  : isEnglish
                  ? "No conversations yet"
                  : "还没有对话记录"}
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentConversationId}
                onClick={() => handleConversationClick(conversation.id)}
                onRename={(newTitle) => handleRename(conversation.id, newTitle)}
                onStar={(starred) => handleStar(conversation.id, starred)}
                onExport={() => handleExport(conversation.id)}
                onDelete={() => handleDeleteClick(conversation.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}