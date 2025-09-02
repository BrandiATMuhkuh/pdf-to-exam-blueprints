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
    PromptInputButton,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
} from "@/components/prompt-input";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/reasoning";
import { Response } from "@/components/response";
import { Source, Sources, SourcesContent, SourcesTrigger } from "@/components/sources";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/tool";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { GlobeIcon, PaperclipIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
export const ChatPanel = () => {
    const [input, setInput] = useState("");
    const [webSearch, setWebSearch] = useState(false);
    const [files, setFiles] = useState<FileList | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { messages, sendMessage, status } = useChat();
    const params = useParams<{ id?: string | string[] }>();
    const blueprintId = Array.isArray(params?.id) ? params?.id?.[0] : params?.id;
    console.log("blueprintId", blueprintId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() || files) {
            sendMessage(
                { text: input, files },
                {
                    body: {
                        webSearch: webSearch,
                        blueprintId: blueprintId,
                    },
                }
            );
            setInput("");
            setFiles(undefined);
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
                                {message.role === "assistant" && (
                                    <Sources>
                                        <SourcesTrigger
                                            count={
                                                message.parts.filter(
                                                    (part) => part.type === "source-url"
                                                ).length
                                            }
                                        />
                                        {message.parts
                                            .filter((part) => part.type === "source-url")
                                            .map((part, i) => (
                                                <SourcesContent key={`${message.id}-${i}`}>
                                                    <Source
                                                        key={`${message.id}-${i}`}
                                                        href={part.url}
                                                        title={part.url}
                                                    />
                                                </SourcesContent>
                                            ))}
                                    </Sources>
                                )}
                                <Message from={message.role} key={message.id}>
                                    <MessageContent>
                                        {message.parts.map((part, i) => {
                                            switch (part.type) {
                                                case "tool-addEdge":
                                                    return (
                                                        <Tool
                                                            defaultOpen={true}
                                                            key={`${message.id}-${i}`}
                                                        >
                                                            <ToolHeader
                                                                type="tool-fetch_weather_data"
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
                                                            defaultOpen={true}
                                                            key={`${message.id}-${i}`}
                                                        >
                                                            <ToolHeader
                                                                type="tool-fetch_weather_data"
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
                        <PromptInputTools>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(event) => {
                                    const inputEl = event.target;
                                    const selected = inputEl.files;
                                    if (!selected) {
                                        setFiles(undefined);
                                        return;
                                    }
                                    const allowedTypes = new Set([
                                        "application/pdf",
                                        "application/msword",
                                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                    ]);
                                    const allowedExts = new Set(["pdf", "doc", "docx"]);
                                    const dataTransfer = new DataTransfer();
                                    Array.from(selected).forEach((file) => {
                                        const ext = file.name.toLowerCase().split(".").pop() ?? "";
                                        if (allowedTypes.has(file.type) || allowedExts.has(ext)) {
                                            dataTransfer.items.add(file);
                                        }
                                    });
                                    const filtered = dataTransfer.files;
                                    inputEl.files = filtered;
                                    setFiles(filtered.length > 0 ? filtered : undefined);
                                }}
                                className="hidden"
                            />
                            <PromptInputButton
                                variant={files ? "default" : "ghost"}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <PaperclipIcon size={16} />
                                <span>Attach</span>
                            </PromptInputButton>
                            <PromptInputButton
                                variant={webSearch ? "default" : "ghost"}
                                onClick={() => setWebSearch(!webSearch)}
                            >
                                <GlobeIcon size={16} />
                                <span>Search</span>
                            </PromptInputButton>
                        </PromptInputTools>
                        <PromptInputSubmit disabled={!input && !files} status={status} />
                    </PromptInputToolbar>
                </PromptInput>
            </div>
        </div>
    );
};

export default ChatPanel;
