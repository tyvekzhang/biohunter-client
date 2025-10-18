"use client";

import { FileUpload } from "@/components/file-upload";
import type React from "react";

import { QuickStartTemplates } from "@/components/quick-start-templates";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAgentManager } from "@/hooks/use-agent-manager";
import { useConversationHistory } from "@/hooks/use-conversation-history";
import { useIsEnglish } from "@/hooks/use-is-english";
import { useSSEStream } from "@/hooks/use-sse-stream";
import type { Conversation } from "@/types/chat";
import {
  Bot,
  Globe,
  Loader2,
  Paperclip,
  Send,
  Square,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import workflowData from "@/data/example-workflow.json";

import { Message } from "@/types/chat";
import { AgentWorkflowDisplay } from "./agent-workflow-display";

interface ChatMainProps {
  conversation: Conversation | undefined;
  onAddMessage: (conversationId: string, message: Message) => void;
  onCreateConversation: () => string;
}

export function ChatInterface({
  conversation,
  onAddMessage,
  onCreateConversation,
}: ChatMainProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { workflows, getActiveWorkflow } = useAgentManager();
  const {
    isStreaming,
    streamingMessages,
    error,
    startStream,
    stopStream,
    clearMessages,
  } = useSSEStream();
  const {
    currentConversationId,
    getCurrentConversation,
    createConversation,
    addMessageToConversation,
  } = useConversationHistory();

  const hasMessages = messages.length > 0 || streamingMessages.length > 0;
  const activeWorkflow = getActiveWorkflow();
  const currentConversation = getCurrentConversation();

  const isEnglish = useIsEnglish();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, streamingMessages]);

  const handleTemplateSelect = (template: string) => {
    setInput(template);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    if (isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    };

    // Create new conversation if none exists
    let conversationId = currentConversationId;
    if (!conversationId) {
      const conversation = createConversation(undefined, {
        id: userMessage.id,
        type: userMessage.type,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
        files: userMessage.files,
      });
      conversationId = conversation.id;
    } else {
      // Add message to existing conversation
      addMessageToConversation(conversationId, {
        id: userMessage.id,
        type: userMessage.type,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
        files: userMessage.files,
      });
    }

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = input;
    setInput("");
    setUploadedFiles([]);

    try {
      await startStream(messageContent, uploadedFiles, webSearchEnabled);
    } catch (error) {
      console.error("Failed to start stream:", error);
    }
  };

  useEffect(() => {
    streamingMessages.forEach((streamMsg) => {
      if (!streamMsg.isStreaming && currentConversationId) {
        const existingMessage = messages.find(
          (msg) => msg.id === `stream-${streamMsg.id}`
        );
        if (!existingMessage) {
          const agentMessage: ConversationMessage = {
            id: `stream-${streamMsg.id}`,
            type: "agent",
            content: streamMsg.content,
            agent: streamMsg.agent,
            timestamp: streamMsg.timestamp,
          };

          addMessageToConversation(currentConversationId, agentMessage);

          setMessages((prev) => [
            ...prev,
            {
              ...agentMessage,
              files: undefined,
            },
          ]);
        }
      }
    });
  }, [
    streamingMessages,
    currentConversationId,
    messages,
    addMessageToConversation,
  ]);

  const handleStop = () => {
    stopStream();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isStreaming) {
        handleStop();
      } else {
        handleSend();
      }
    }
  };

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
    setShowFileUpload(false);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const [mockMessages, setMockMessages] = useState<Message[]>([
    {
      id: "1",
      type: "user",
      content:
        "I need to discover CAR-T targets for triple-negative breast cancer. Please help me analyze relevant single-cell data, identify tumor-specific surface antigens, and evaluate target safety and efficacy.",
      timestamp: new Date(),
    },
  ]);
  return (
    <div className="flex flex-col min-h-screen max-h-screen relative">
      {/* Welcome state - centered input */}
      {!hasMessages && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-4xl space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">
                {isEnglish ? "BioHunter" : "BioHunter"}
              </h1>
              <p className="text-lg text-muted-foreground">
                {isEnglish
                  ? "A multi-agent collaborative AI assistant specialized in cancer target identification and discovery"
                  : "专注于癌症靶点识别与发现的多智能体协作AI助手"}
              </p>
            </div>

            <div className="space-y-4">
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? "Uploaded files:" : "已上传文件:"}
                  </p>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted p-2 rounded"
                    >
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="cursor-pointer"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    isEnglish
                      ? "Enter your question or request..."
                      : "请输入您的问题或需求..."
                  }
                  className="h-[120px] pr-20 pb-12 resize-none overflow-y-auto"
                  disabled={isStreaming}
                />

                {/* Left bottom corner - Search */}
                <Button
                  variant={webSearchEnabled ? "default" : "ghost"}
                  size="sm"
                  className={`absolute bottom-2 left-2 flex items-center gap-1 px-2 py-2 cursor-pointer ${
                    isStreaming ? "cursor-not-allowed opacity-50" : ""
                  } ${
                    webSearchEnabled &&
                    "bg-primary/10 text-primary hover:bg-primary/10"
                  }`}
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  disabled={isStreaming}
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs">
                    {isEnglish ? "Search" : "搜索"}
                  </span>
                </Button>

                {/* Right bottom corner - File upload and Send */}
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`cursor-pointer ${
                      isStreaming ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    onClick={() => setShowFileUpload(true)}
                    disabled={isStreaming}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleSend}
                          disabled={
                            isStreaming ||
                            (!input.trim() && uploadedFiles.length === 0)
                          }
                          size="sm"
                          className="cursor-pointer"
                        >
                          {isStreaming ? (
                            <Loader2 className="h-4 w-4 animate-spin bg-primary" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {isEnglish ? "Send" : "发送"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            <QuickStartTemplates onTemplateSelect={handleTemplateSelect} />
          </div>
        </div>
      )}

      {/* Chat state - messages + bottom input */}
      {hasMessages && (
        <>
          {/* Messages area */}
          {/* <ScrollArea
            ref={scrollAreaRef}
            className="flex-1 max-h-6/7 overflow-auto max-w-4xl min-w-4xl mx-auto mt-14"
          >
            <AgentWorkflowDisplay workflowData={workflowData} />
            <div className="h-2 mt-[100px]"></div>
          </ScrollArea> */}
          <ScrollArea
            ref={scrollAreaRef}
            className="flex-1 max-h-6/7 overflow-auto max-w-4xl min-w-4xl mx-auto mt-14 px-2"
          >
            <div className="space-y-6 pr-4">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 ${
                      message.type === "user"
                        ? "bg-primary/10 text-gray-900"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>

                  {message.type === "user" && (
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarFallback className="bg-primary/10">
                        <User className="w-4 h-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div className="flex">
                <Avatar className="w-8 h-8 mt-1 mr-6">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="w-4 h-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <AgentWorkflowDisplay workflowData={workflowData} />
              </div>
              <div className="h-2 mt-[100px]"></div>
            </div>
          </ScrollArea>

          {/* Bottom input */}
          <div className="mt-4 px-12 bg-white w-full mx-auto absolute bottom-0">
            <div className="max-w-4xl mx-auto py-4">
              {uploadedFiles.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? "Uploaded files:" : "已上传文件:"}
                  </p>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted p-2 rounded"
                    >
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="cursor-pointer"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    isStreaming
                      ? isEnglish
                        ? "Responding..."
                        : "响应中..."
                      : isEnglish
                      ? "Continue conversation..."
                      : "继续对话..."
                  }
                  className="h-[100px] pr-20 pb-12 resize-none overflow-y-auto"
                />

                {/* Left bottom corner - Search */}
                <Button
                  variant={webSearchEnabled ? "default" : "ghost"}
                  size="sm"
                  className={`absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 cursor-pointer ${
                    isStreaming ? "cursor-not-allowed" : ""
                  } ${
                    webSearchEnabled &&
                    "bg-primary/10 text-primary hover:bg-primary/10"
                  }`}
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs">
                    {isEnglish ? "Search" : "搜索"}
                  </span>
                </Button>

                {/* Right bottom corner - File upload and Send/Stop */}
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFileUpload(true)}
                    disabled={isStreaming}
                    className={`${
                      isStreaming ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>

                  {isStreaming ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleStop}
                            variant="destructive"
                            size="sm"
                            className="cursor-pointer bg-primary hover:bg-primary"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {isEnglish ? "Stop" : "停止"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleSend}
                            disabled={
                              !input.trim() && uploadedFiles.length === 0
                            }
                            size="sm"
                            className={"cursor-pointer"}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {isEnglish ? "Send" : "发送"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* File upload modal */}
      {showFileUpload && (
        <FileUpload
          onUpload={handleFileUpload}
          onClose={() => setShowFileUpload(false)}
        />
      )}
    </div>
  );
}
