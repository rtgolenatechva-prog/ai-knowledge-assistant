const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export const api = {
  register: (email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  listConversations: (token: string) =>
    request<Conversation[]>("/conversations", { token }),

  createConversation: (token: string, title?: string) =>
    request<Conversation>("/conversations", {
      method: "POST",
      token,
      body: JSON.stringify({ title }),
    }),

  getConversation: (token: string, id: string) =>
    request<ConversationDetail>(`/conversations/${id}`, { token }),

  deleteConversation: (token: string, id: string) =>
    request<void>(`/conversations/${id}`, { method: "DELETE", token }),

  sendMessage: (token: string, conversationId: string, content: string) =>
    request<{ userMessage: Message; assistantMessage: Message }>(
      `/conversations/${conversationId}/messages`,
      { method: "POST", token, body: JSON.stringify({ content }) }
    ),
};
