"use client"

import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/conversation"
import { Message, MessageAvatar, MessageContent } from "@/components/message"
import { PromptInput, PromptInputButton, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar, PromptInputTools } from "@/components/prompt-input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import * as React from "react"

type ChatMessage = {
  readonly id: string
  readonly role: "user" | "assistant"
  readonly content: string
}

export type ChatPanelProps = React.ComponentProps<"div">

/**
 * ChatPanel renders a self-contained chat UI suitable for docking on the right side.
 * It is intentionally client-only and local-state driven for demo purposes.
 */
export function ChatPanel({ className, ...props }: ChatPanelProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { id: "m1", role: "assistant", content: "Hi! Ask me anything about your blueprints." },
  ])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const text = String(formData.get("message") ?? "").trim()
    if (!text) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    }
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Echo: ${text}`,
    }
    setMessages((prev) => [...prev, userMsg, assistantMsg])
    event.currentTarget.reset()
  }

  return (
    <div
      className={cn(
        "bg-card text-card-foreground flex h-full min-h-0 w-full flex-col rounded-xl border shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <p className="font-medium">Chat</p>
      </div>
      <Separator />

      <Conversation className="min-h-0 flex-1">
        <ConversationContent>
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageAvatar src={m.role === "user" ? "/vercel.svg" : "/next.svg"} name={m.role} />
              <MessageContent>{m.content}</MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t p-2">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea aria-label="Message" />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputButton variant="ghost">+
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit aria-label="Send" />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  )
}


