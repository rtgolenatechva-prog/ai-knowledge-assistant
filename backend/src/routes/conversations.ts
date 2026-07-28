import { Router } from "express";
import { prisma } from "../lib/prisma";
import { getAiReply } from "../lib/openrouter";
import { AuthedRequest, requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(conversations);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const { title } = req.body as { title?: string };
    const conversation = await prisma.conversation.create({
      data: {
        userId: req.userId as string,
        title: title?.trim() || "New conversation",
      },
    });
    res.status(201).json(conversation);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conversation) {
      return res.status(404).json({ error: "conversation not found" });
    }
    res.json(conversation);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!conversation) {
      return res.status(404).json({ error: "conversation not found" });
    }
    await prisma.conversation.delete({ where: { id: conversation.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post("/:id/messages", async (req: AuthedRequest, res, next) => {
  try {
    const { content } = req.body as { content?: string };
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "content is required" });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conversation) {
      return res.status(404).json({ error: "conversation not found" });
    }

    const userMessage = await prisma.message.create({
      data: { conversationId: conversation.id, role: "user", content },
    });

    const history = [
      ...conversation.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content },
    ];

    let aiContent: string;
    try {
      aiContent = await getAiReply(history);
    } catch (aiErr) {
      const message = aiErr instanceof Error ? aiErr.message : "AI request failed";
      return res.status(502).json({ error: `AI service error: ${message}` });
    }

    const assistantMessage = await prisma.message.create({
      data: { conversationId: conversation.id, role: "assistant", content: aiContent },
    });

    res.status(201).json({ userMessage, assistantMessage });
  } catch (err) {
    next(err);
  }
});

export default router;
