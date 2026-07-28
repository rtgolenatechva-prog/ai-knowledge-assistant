import { Conversation } from "./api";

export interface ConversationGroup {
  label: string;
  items: Conversation[];
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function groupConversationsByDate(conversations: Conversation[]): ConversationGroup[] {
  const today = startOfDay(new Date());
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;

  const buckets = {
    Today: [] as Conversation[],
    Yesterday: [] as Conversation[],
    "Previous 7 days": [] as Conversation[],
    Older: [] as Conversation[],
  };

  for (const c of conversations) {
    const day = startOfDay(new Date(c.createdAt));
    if (day === today) buckets.Today.push(c);
    else if (day === yesterday) buckets.Yesterday.push(c);
    else if (day >= weekAgo) buckets["Previous 7 days"].push(c);
    else buckets.Older.push(c);
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}
