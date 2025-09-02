"use client";

import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from "@/components/conversation";
import { Loader } from "@/components/loader";
import { Message, MessageContent } from "@/components/message";
import {
    PromptInput,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
} from "@/components/prompt-input";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/reasoning";
import { Response } from "@/components/response";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/tool";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
export const ChatPanel = () => {
    const [input, setInput] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { messages, sendMessage, status } = useChat();
    const params = useParams<{ id?: string | string[] }>();
    const blueprintId = Array.isArray(params?.id) ? params?.id?.[0] : params?.id;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage(
                { text: input },
                {
                    body: {
                        blueprintId: blueprintId,
                    },
                }
            );
            setInput("");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div
            className={cn(
                "bg-card text-card-foreground flex h-full min-h-0 w-full flex-col rounded-b-sm border shadow-sm"
            )}
        >
            {" "}
            <div className="flex flex-col h-full">
                <Conversation className="h-full">
                    <ConversationContent>
                        {messages.map((message) => (
                            <div key={message.id}>
                                <Message from={message.role} key={message.id}>
                                    <MessageContent>
                                        {message.parts.map((part, i) => {
                                            switch (part.type) {
                                                case "tool-addEdge":
                                                    return (
                                                        <Tool
                                                            defaultOpen={false}
                                                            key={`${message.id}-${i}`}
                                                        >
                                                            <ToolHeader
                                                                type="tool-addEdge"
                                                                state={part.state}
                                                            />
                                                            <ToolContent>
                                                                <ToolInput input={part.input} />
                                                                <ToolOutput
                                                                    output={
                                                                        <Response>
                                                                            {part.output as string}
                                                                        </Response>
                                                                    }
                                                                    errorText={part.errorText}
                                                                />
                                                            </ToolContent>
                                                        </Tool>
                                                    );
                                                case "tool-updateEdge":
                                                    return (
                                                        <Tool
                                                            defaultOpen={false}
                                                            key={`${message.id}-${i}`}
                                                        >
                                                            <ToolHeader
                                                                type="tool-updateEdge"
                                                                state={part.state}
                                                            />
                                                            <ToolContent>
                                                                <ToolInput input={part.input} />
                                                                <ToolOutput
                                                                    output={
                                                                        <Response>
                                                                            {part.output as string}
                                                                        </Response>
                                                                    }
                                                                    errorText={part.errorText}
                                                                />
                                                            </ToolContent>
                                                        </Tool>
                                                    );
                                                case "text":
                                                    return (
                                                        <Response
                                                            key={`${message.id}-${i}`}
                                                            parseIncompleteMarkdown
                                                        >
                                                            {part.text}
                                                        </Response>
                                                    );
                                                case "reasoning":
                                                    return (
                                                        <Reasoning
                                                            key={`${message.id}-${i}`}
                                                            className="w-full"
                                                            isStreaming={status === "streaming"}
                                                        >
                                                            <ReasoningTrigger />
                                                            <ReasoningContent>
                                                                {part.text}
                                                            </ReasoningContent>
                                                        </Reasoning>
                                                    );
                                                case "file":
                                                    return (
                                                        <a
                                                            key={`${message.id}-${i}`}
                                                            href={part.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="underline"
                                                        >
                                                            {part.filename ?? part.url}
                                                        </a>
                                                    );
                                                default:
                                                    return null;
                                            }
                                        })}
                                    </MessageContent>
                                </Message>
                            </div>
                        ))}
                        {status === "submitted" && <Loader />}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>

                <PromptInput onSubmit={handleSubmit} className="mt-4">
                    <PromptInputTextarea onChange={(e) => setInput(e.target.value)} value={input} />
                    <PromptInputToolbar>
                        <PromptInputTools></PromptInputTools>
                        <PromptInputSubmit disabled={!input} status={status} />
                    </PromptInputToolbar>
                </PromptInput>
            </div>
        </div>
    );
};

export default ChatPanel;
