"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Message } from "@/lib/api";
import styles from "./ChatWindow.module.css";

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
      <div className={styles.chat}>
        <div className={styles.empty}>
          Select a conversation or start a new one to begin chatting.
        </div>
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
    <div className={styles.chat}>
      <div className={styles.messages}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`${styles.bubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant}`}
          >
            {m.content}
          </div>
        ))}
        {sending && <div className={styles.bubbleAssistant + " " + styles.bubble}>Thinking...</div>}
        {error && <div className={styles.error}>{error}</div>}
        <div ref={bottomRef} />
      </div>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <textarea
          className={styles.input}
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
        <button type="submit" className={styles.sendButton} disabled={sending || !draft.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
