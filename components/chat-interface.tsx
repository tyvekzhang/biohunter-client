"use client"

import { FileUpload } from "@/components/file-upload"
import { File } from 'lucide-react'
import { SteppedFileUpload } from "@/components/stepped-file-upload"
import type React from "react"
import type { ConversationMessage } from "@/types/chat"

import { QuickStartTemplates } from "@/components/quick-start-templates"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAgentManager } from "@/hooks/use-agent-manager"
import { useConversationHistory } from "@/hooks/use-conversation-history"
import { useIsEnglish } from "@/hooks/use-is-english"
import { useSSEStream } from "@/hooks/use-sse-stream"
import type { Conversation } from "@/types/chat"
import { Bot, Loader2, Paperclip, Send, Square, User, Zap, Shield, Target, CheckCircle2 } from 'lucide-react'
import { useEffect, useRef, useState } from "react"
import workflowData from "@/data/example-workflow.json"

import type { Message } from "@/types/chat"
import { AgentWorkflowDisplay } from "./agent-workflow-display"

const PUBMED_QUERY = `(
(
"drug target*"[Title/Abstract] OR
"therapeutic target*"[Title/Abstract] OR
"molecular target*"[Title/Abstract] OR
"targetable molecule*"[Title/Abstract] OR
"target identification"[Title/Abstract]
)
OR
(
"CAR-T"[Title/Abstract] OR
"chimeric antigen receptor"[Title/Abstract]
)
)
AND
(
"surface"[Title/Abstract] OR
"membrane"[Title/Abstract] OR
"cell surface"[Title/Abstract] OR
"transmembrane"[Title/Abstract] OR
"surface protein*"[Title/Abstract] OR
"surface antigen*"[Title/Abstract] OR
"membrane protein*"[Title/Abstract] OR
"membrane antigen*"[Title/Abstract] OR
"CD"[Title/Abstract]
)
NOT
(
"intracellular"[Title/Abstract] OR
"cytoplasmic"[Title/Abstract]
)`

interface ChatMainProps {
  conversation: Conversation | undefined
  onAddMessage: (conversationId: string, message: Message) => void
  onCreateConversation: () => string
}

export function ChatInterface({ conversation, onAddMessage, onCreateConversation }: ChatMainProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showSteppedUpload, setShowSteppedUpload] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [webSearchEnabled, setWebSearchEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState("pubmed")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [toggledOptions, setToggledOptions] = useState<{
    cellSurface: boolean
    tcellCompat: boolean
    offtarget: boolean
    fdaSafety: boolean
  }>({
    cellSurface: true,
    tcellCompat: true,
    offtarget: true,
    fdaSafety: true,
  })

  const { workflows, getActiveWorkflow } = useAgentManager()
  const { isStreaming, streamingMessages, error, startStream, stopStream, clearMessages } = useSSEStream()
  const { currentConversationId, getCurrentConversation, createConversation, addMessageToConversation } =
    useConversationHistory()

  const hasMessages = messages.length > 0 || streamingMessages.length > 0
  const activeWorkflow = getActiveWorkflow()
  const currentConversation = getCurrentConversation()

  const isEnglish = useIsEnglish()

  useEffect(() => {
    if (activeTab === "pubmed") {
      setInput(PUBMED_QUERY)
    } else {
      setInput("")
    }
  }, [activeTab])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, streamingMessages])

  const handleTemplateSelect = (template: string) => {
    setInput(template)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return
    if (isStreaming) return

    const tabLabel = activeTab === "pubmed" ? "通过pubmed指令提取" : "单细胞数据提取"
    const fullContent = `[${tabLabel}] ${input}`

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: fullContent,
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    }

    // Create new conversation if none exists
    let conversationId = currentConversationId
    if (!conversationId) {
      const conversation = createConversation(undefined, {
        id: userMessage.id,
        type: userMessage.type,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
        files: userMessage.files,
      })
      conversationId = conversation.id
    } else {
      // Add message to existing conversation
      addMessageToConversation(conversationId, {
        id: userMessage.id,
        type: userMessage.type,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
        files: userMessage.files,
      })
    }

    setMessages((prev) => [...prev, userMessage])
    const messageContent = input
    setInput("")
    setUploadedFiles([])

    try {
      await startStream(messageContent, uploadedFiles, webSearchEnabled)
    } catch (error) {
      console.error("Failed to start stream:", error)
    }
  }

  useEffect(() => {
    streamingMessages.forEach((streamMsg) => {
      if (!streamMsg.isStreaming && currentConversationId) {
        const existingMessage = messages.find((msg) => msg.id === `stream-${streamMsg.id}`)
        if (!existingMessage) {
          const agentMessage: ConversationMessage = {
            id: `stream-${streamMsg.id}`,
            type: "agent",
            content: streamMsg.content,
            agent: streamMsg.agent,
            timestamp: streamMsg.timestamp,
          }

          addMessageToConversation(currentConversationId, agentMessage)

          setMessages((prev) => [
            ...prev,
            {
              ...agentMessage,
              files: undefined,
            },
          ])
        }
      }
    })
  }, [streamingMessages, currentConversationId, messages, addMessageToConversation])

  const handleStop = () => {
    stopStream()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (isStreaming) {
        handleStop()
      } else {
        handleSend()
      }
    }
  }

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
    setShowFileUpload(false)
  }

  const handleSteppedUploadComplete = (negativeFile: File, positiveFile: File, cellType: string) => {
    setUploadedFiles([negativeFile, positiveFile])
    // Automatically set input with cell type information
    setInput(`Target cell type: ${cellType}`)
    setShowSteppedUpload(false)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleToggleOption = (option: string) => {
    setToggledOptions((prev) => ({
      ...prev,
      [option as keyof typeof prev]: !prev[option as keyof typeof prev],
    }))
  }

  const [mockMessages, setMockMessages] = useState<Message[]>([
    {
      id: "1",
      type: "user",
      content:
        "I need to discover CAR-T targets for triple-negative breast cancer. Please help me analyze relevant single-cell data, identify tumor-specific surface antigens, and evaluate target safety and efficacy.",
      timestamp: new Date(),
    },
  ])

  const InputSection = ({ showOptionsButtons = false }: { showOptionsButtons?: boolean }) => (
    <div className="space-y-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className="cursor-pointer" value="pubmed">
            {isEnglish ? "PubMed Extraction" : "通过pubmed指令提取"}
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="single-cell">
            {isEnglish ? "Single-Cell Data" : "单细胞数据提取"}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-muted py-1 px-2 rounded">
              <File className="w-4 h-4 text-muted-foreground px-2" />
              <span className="text-sm">{file.name}</span>
              <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="cursor-pointer">
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
          placeholder={isEnglish ? "Enter your question or request..." : "请输入您的问题或需求..."}
          className="h-[120px] pr-20 pb-12 resize-none hide-scrollbar"
          disabled={isStreaming}
        />

        {activeTab === "single-cell" && showOptionsButtons && (
          <div className="absolute bottom-2 left-2 flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={toggledOptions.cellSurface ? "default" : "outline"}
                    size="sm"
                    className={`cursor-pointer h-8 px-3 text-xs hover:bg-primary/20 hover:text-blue-600 ${toggledOptions.cellSurface ? "bg-primary/10 text-blue-500" : "text-gray-500"}`}
                    onClick={() => handleToggleOption("cellSurface")}
                    disabled={isStreaming}
                  >
                    <Target className="h-3.5 w-3.5 mr-1" />
                    {isEnglish ? "Cell Surface" : "细胞表面基因"}
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={toggledOptions.tcellCompat ? "default" : "outline"}
                    size="sm"
                    className={`cursor-pointer h-8 px-3 text-xs hover:bg-primary/20 hover:text-blue-600 ${toggledOptions.tcellCompat ? "bg-primary/10 text-blue-500" : "text-gray-500"}`}
                    onClick={() => handleToggleOption("tcellCompat")}
                    disabled={isStreaming}
                  >
                    <Shield className="h-3.5 w-3.5 mr-1" />
                    {isEnglish ? "T Cell" : "T细胞兼容"}
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={toggledOptions.offtarget ? "default" : "outline"}
                    size="sm"
                    className={`cursor-pointer h-8 px-3 text-xs hover:bg-primary/20 hover:text-blue-600 ${toggledOptions.offtarget ? "bg-primary/10 text-blue-500" : "text-gray-500"}`}
                    onClick={() => handleToggleOption("offtarget")}
                    disabled={isStreaming}
                  >
                    <Zap className="h-3.5 w-3.5 mr-1" />
                    {isEnglish ? "Off-target" : "脱靶规避"}
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={toggledOptions.fdaSafety ? "default" : "outline"}
                    size="sm"
                    className={`cursor-pointer h-8 px-3 text-xs hover:bg-primary/20 hover:text-blue-600 ${toggledOptions.fdaSafety ? "bg-primary/10 text-blue-500" : "text-gray-500"}`}
                    onClick={() => handleToggleOption("fdaSafety")}
                    disabled={isStreaming}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    {isEnglish ? "FDA" : "FDA安全"}
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex gap-2">
          {activeTab === "single-cell" && (
            <Button
              variant="ghost"
              size="icon"
              className={`cursor-pointer ${isStreaming ? "cursor-not-allowed opacity-50" : ""}`}
              onClick={() => {
                if (activeTab === "single-cell") {
                  setShowSteppedUpload(true)
                } else {
                  setShowFileUpload(true)
                }
              }}
              disabled={isStreaming}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={isStreaming ? handleStop : handleSend}
                  disabled={!isStreaming && !input.trim() && uploadedFiles.length === 0}
                  size="sm"
                  variant={isStreaming ? "destructive" : "default"}
                  className="cursor-pointer"
                >
                  {isStreaming ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isStreaming ? (isEnglish ? "Stop" : "停止") : isEnglish ? "Send" : "发送"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen max-h-screen relative">
      {/* Welcome state - centered input */}
      {!hasMessages && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-4xl space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">
                {"BioHunter".split("").map((char, i) =>
                  i === 3 ? (
                    <span key={i} className="border-b-3 border-primary">
                      {char}
                    </span>
                  ) : (
                    char
                  ),
                )}
              </h1>
              <p className="text-lg text-muted-foreground">
                {isEnglish
                  ? "A multi-agent collaborative AI assistant specialized in cancer target identification and discovery"
                  : "专注于癌症靶点识别与发现的多智能体协作AI助手"}
              </p>
            </div>

            <InputSection showOptionsButtons={true} />
            <QuickStartTemplates onTemplateSelect={handleTemplateSelect} />
          </div>
        </div>
      )}

      {/* Chat state - messages + bottom input */}
      {hasMessages && (
        <>
          {/* Messages area */}
          <ScrollArea
            ref={scrollAreaRef}
            className="flex-1 max-h-6/7 overflow-auto max-w-4xl min-w-4xl mx-auto mt-14 px-2"
          >
            <div className="space-y-6 pr-4">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 ${
                      message.type === "user" ? "bg-primary/10 text-gray-900" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
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

          {/* Bottom input - fixed position */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
            <div className="max-w-4xl mx-auto px-12 py-4">
              <InputSection showOptionsButtons={true} />
            </div>
          </div>
        </>
      )}

      {/* File upload modal */}
      {showFileUpload && <FileUpload onUpload={handleFileUpload} onClose={() => setShowFileUpload(false)} />}

      {showSteppedUpload && (
        <SteppedFileUpload onComplete={handleSteppedUploadComplete} onClose={() => setShowSteppedUpload(false)} />
      )}
    </div>
  )
}
