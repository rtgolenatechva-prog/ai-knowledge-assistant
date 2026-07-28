"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Paperclip, Plus, Send, Sparkles } from "lucide-react";
import { Message } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatWindowProps {
  conversationId: string | null;
  messages: Message[];
  onSend: (content: string) => Promise<void>;
  onNewConversation: () => void;
  sending: boolean;
  error: string | null;
}

export function ChatWindow({
  conversationId,
  messages,
  onSend,
  onNewConversation,
  sending,
  error,
}: ChatWindowProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [draft]);

  if (!conversationId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-6" />
        </div>
        <p className="max-w-xs text-sm text-muted-foreground">
          Select a conversation or start a new one to begin chatting with your AI assistant.
        </p>
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
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[75%] rounded-3xl bg-secondary px-4 py-2.5 text-sm leading-relaxed text-secondary-foreground">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={m.id} className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground prose-p:my-1.5 prose-pre:bg-muted prose-pre:text-foreground prose-code:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
              </div>
            )
          )}

          {sending && (
            <span className="inline-flex gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </span>
          )}

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="p-4">
        <form
          className="mx-auto flex w-full max-w-2xl items-center gap-0.5 rounded-full border bg-card py-1 pl-1.5 pr-1.5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Start a new conversation"
            title="Start a new conversation"
            className="rounded-full text-muted-foreground"
            onClick={onNewConversation}
          >
            <Plus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Attach a file"
            title="File attachments coming soon"
            disabled
            className="rounded-full text-muted-foreground"
          >
            <Paperclip className="size-4" />
          </Button>
          <Textarea
            ref={textareaRef}
            className="max-h-[160px] min-h-7 flex-1 resize-none border-none bg-transparent py-1 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
            rows={1}
            placeholder="Ask anything"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon-sm"
            aria-label="Send message"
            className="rounded-full"
            disabled={sending || !draft.trim()}
          >
            <Send className="size-4" />
          </Button>
        </form>
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for a new line.
        </p>
      </div>
    </div>
  );
}
