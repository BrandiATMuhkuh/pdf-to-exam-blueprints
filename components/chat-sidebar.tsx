"use client";
import * as React from "react";

import { ChatPanel } from "@/components/chat-panel";
import { Sidebar } from "@/components/ui/sidebar";

export function ChatSidebar({ style, ...props }: React.ComponentProps<typeof Sidebar>) {
    return <ChatPanel />;
}
