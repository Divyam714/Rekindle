import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const SYSTEM_PROMPT = `You are REKINDLE, a warm and emotionally intelligent Romance Concierge for a premium occasion planning platform in India. You help people plan perfect date nights, proposals, and anniversary experiences in Patna. You know every venue, every mood, every budget. Your tone is warm, personal, and sophisticated — never generic, never corporate. You speak like a trusted friend who happens to know everything about romance. Keep responses concise — 2-3 sentences — unless asked for details. Always end with a gentle question or suggestion.`;

function buildContext(occasionType: string, styleKey: string, preferences: Record<string, unknown>): string {
  const parts: string[] = [];
  if (occasionType) parts.push(`Occasion: ${occasionType.replace(/_/g, ' ')}`);
  if (styleKey) parts.push(`Style preference: ${styleKey.replace(/_/g, ' ')}`);
  if (preferences) {
    const p = preferences as Record<string, string | number>;
    if (p.budget) parts.push(`Budget: ${p.budget}`);
    if (p.indoorOutdoor) parts.push(`Venue preference: ${p.indoorOutdoor}`);
    if (p.foodPreference) parts.push(`Food: ${p.foodPreference}`);
    if (p.musicPreference) parts.push(`Music: ${p.musicPreference}`);
    if (p.romanticIntensity !== undefined) parts.push(`Romantic intensity: ${p.romanticIntensity}/5`);
  }
  return parts.join('. ');
}

router.post("/", async (req, res) => {
  const {
    occasionType = "date_night",
    styleKey = "standard",
    preferences = {},
    messages = [],
    mode = "chat",
  } = req.body as {
    occasionType?: string;
    styleKey?: string;
    preferences?: Record<string, unknown>;
    messages?: { role: "user" | "assistant"; content: string }[];
    mode?: "recommend" | "chat";
  };

  const context = buildContext(occasionType, styleKey, preferences);

  if (mode === "recommend") {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Customer preferences: ${context}\n\nCreate a personalized romantic experience recommendation for Patna, India. Return ONLY valid JSON (no markdown, no explanation): { "title": "compelling 1-line experience title", "items": ["detail 1", "detail 2", "detail 3", "detail 4", "detail 5"], "surprise": "one magical surprise element we will arrange", "summary": "2-3 word vibe description" }`,
          },
        ],
      });

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned) as {
        title: string;
        items: string[];
        surprise: string;
        summary: string;
      };
      res.json({ success: true, ...parsed });
    } catch (err) {
      req.log.error(err, "concierge recommend error");
      res.status(500).json({ success: false, error: "Failed to generate recommendation" });
    }
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const chatMessages: { role: "user" | "assistant"; content: string }[] =
    messages.length > 0
      ? messages
      : [
          {
            role: "user",
            content: `My preferences: ${context}. Please help me plan a perfect experience.`,
          },
        ];

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: chatMessages,
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error(err, "concierge chat stream error");
    res.write(`data: ${JSON.stringify({ error: "Failed to stream response" })}\n\n`);
    res.end();
  }
});

export default router;
