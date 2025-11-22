"use client";

import { useEffect, useState } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, Plus } from "lucide-react";
import { useIsEnglish } from "@/hooks/use-is-english";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useConversationHistory } from "@/hooks/use-conversation-history";
import { APP_CONFIG } from "@/config";
import { OAuth2PasswordRequestForm, UserCredential } from '@/types/auth';
import { signIn } from "@/service/auth";

export default function HomePage() {
  const isEnglish = useIsEnglish();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const {
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
    loadDemoData, // Export the new loadDemoData function
  } = useConversationHistory();

  useEffect(() => {
    const authStorage = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH);
    if (authStorage === null || authStorage === undefined) {
      FingerprintJS.load()
        .then((fp) => fp.get())
        .then((result) => {
          const fingerprint = result.visitorId;
          const loginData: OAuth2PasswordRequestForm = {
            username: fingerprint,
            password: ""
          }
          signIn(loginData).then(res => localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH, res.access_token))
        })
        .catch((error) => {
          console.error("Failed to get fingerprint:", error);
        });
    }
  }, []);

  useEffect(() => {
    const conversationId = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CONCERSATION_ID);
    if (conversationId === null || conversationId === undefined) {
      
    }
  })

  return (
    <div className="flex h-screen bg-background">
      {!sidebarOpen && (
        <div className="fixed top-4 left-4 z-50 flex flex-col gap-3 h-screen">
          {/* Website Logo */}
          <div
            className="flex items-center justify-center cursor-pointer hover:bg-gray-100 scale-120 text-gray-600 hover:text-gray-700 p-1"
            onClick={handleToggleSidebar}
          >
            <img src="/favicon.ico" alt="Logo" className="h-6 w-6" />
          </div>

          {/* Unhide Sidebar Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleSidebar}
            className="bg-background/80 backdrop-blur-sm cursor-pointer border-none scale-120  text-gray-600 hover:text-gray-700"
            title={isEnglish ? "Show Sidebar" : "显示侧边栏"}
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>

          {/* New Conversation Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={createConversation}
            className="bg-background/80 backdrop-blur-sm cursor-pointer border-none scale-120 text-gray-600 hover:text-gray-700"
            title={isEnglish ? "New Conversation" : "新建会话"}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
        ${sidebarOpen ? "w-80" : "w-0"}
        h-full bg-card border-r border-border
        transition-all duration-300 ease-in-out
        overflow-hidden
      `}
      >
        {sidebarOpen && (
          <Sidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={setCurrentConversationId}
            onCreateConversation={createConversation}
            onDeleteConversation={deleteConversation}
            onStarConversation={starConversation}
            onRenameConversation={renameConversation}
            onExportConversation={exportConversation}
            onClearAllConversations={clearAllConversations}
            onToggleCollapse={handleToggleSidebar}
            collapsed={sidebarOpen}
            getConversationStats={getConversationStats}
          />
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="h-12 fixed top-0 mb-2 w-full z-10 bg-white"></div>
        <ChatInterface
          conversation={getCurrentConversation}
          onAddMessage={addMessageToConversation}
          onCreateConversation={createConversation}
        />
      </div>
    </div>
  );
}
