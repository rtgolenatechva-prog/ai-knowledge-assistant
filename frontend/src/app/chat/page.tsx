"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, Conversation, Message } from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import styles from "./page.module.css";

export default function ChatPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login");
    }
  }, [authLoading, token, router]);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    const list = await api.listConversations(token);
    setConversations(list);
  }, [token]);

  useEffect(() => {
    if (token) loadConversations();
  }, [token, loadConversations]);

  async function selectConversation(id: string) {
    if (!token) return;
    setError(null);
    const detail = await api.getConversation(token, id);
    setActiveId(detail.id);
    setMessages(detail.messages);
  }

  async function createConversation() {
    if (!token) return;
    setCreating(true);
    try {
      const conversation = await api.createConversation(token);
      setConversations((prev) => [conversation, ...prev]);
      setActiveId(conversation.id);
      setMessages([]);
    } finally {
      setCreating(false);
    }
  }

  async function deleteConversation(id: string) {
    if (!token) return;
    await api.deleteConversation(token, id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  }

  async function sendMessage(content: string) {
    if (!token || !activeId) return;
    setSending(true);
    setError(null);
    setMessages((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, role: "user", content, createdAt: new Date().toISOString() },
    ]);
    try {
      const { assistantMessage } = await api.sendMessage(token, activeId, content);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (authLoading || !token) {
    return null;
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onCreate={createConversation}
        onDelete={deleteConversation}
        creating={creating}
      />
      <ChatWindow
        conversationId={activeId}
        messages={messages}
        onSend={sendMessage}
        sending={sending}
        error={error}
      />
    </div>
  );
}
