"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MessageSquare, Star, MoreVertical, Edit2, Download, Trash2, Check, X } from "lucide-react"
import type { Conversation } from "@/types/chat"

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
  onRename: (newTitle: string) => void
  onStar: (starred: boolean) => void
  onExport: () => void
  onDelete: () => void
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
  onRename,
  onStar,
  onExport,
  onDelete,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(conversation.title)

  const formatTime = (date: Date) => {
    // 格式化时间函数实现
  }

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename(editTitle.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditTitle(conversation.title)
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename()
    } else if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  return (
    <Card
      className={`p-3 cursor-pointer transition-colors group ${
        isActive ? "bg-primary/10 border-primary/20" : "hover:bg-accent"
      }`}
      onClick={!isEditing ? onClick : undefined}
    >
      <div className="flex items-start gap-3">
        <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="h-7 text-sm"
                autoFocus
                onBlur={handleRename}
              />
              <Button size="sm" variant="ghost" onClick={handleRename} className="h-7 w-7 p-0">
                <Check className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 w-7 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{conversation.title}</h3>
                {conversation.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-3 w-3 mr-2" />
                    重命名
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStar(!conversation.isStarred)}>
                    <Star className={`h-3 w-3 mr-2 ${conversation.isStarred ? "fill-current" : ""}`} />
                    {conversation.isStarred ? "取消收藏" : "收藏"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="h-3 w-3 mr-2" />
                    导出对话
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="h-3 w-3 mr-2" />
                    删除对话
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 pr-4">{conversation.preview}</p>

        </div>
      </div>
    </Card>
  )
}