"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Message } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  conversationId: string | null;
  messages: Message[];
  onSend: (content: string) => Promise<void>;
  sending: boolean;
  error: string | null;
}

export function ChatWindow({ conversationId, messages, onSend, sending, error }: ChatWindowProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversationId) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-muted-foreground">
        Select a conversation or start a new one to begin chatting.
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setDraft("");
    await onSend(content);
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[70%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm leading-relaxed",
                m.role === "user"
                  ? "self-end bg-primary text-primary-foreground"
                  : "self-start bg-muted"
              )}
            >
              {m.content}
            </div>
          ))}
          {sending && (
            <div className="max-w-[70%] self-start rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
              Thinking...
            </div>
          )}
          {error && <p className="self-start text-sm text-destructive">{error}</p>}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form className="flex gap-2 border-t p-4" onSubmit={handleSubmit}>
        <Textarea
          className="min-h-0 flex-1 resize-none"
          rows={1}
          placeholder="Type a message..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" disabled={sending || !draft.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
