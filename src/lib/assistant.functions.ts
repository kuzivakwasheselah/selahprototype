import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const ChatInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().max(4000),
      }),
    )
    .min(1)
    .max(40),
});

const ResultSchema = z.object({
  reply: z.string().describe("A warm, concise, conversational response to the user."),
  intent: z
    .enum(["chat", "prayer", "verse", "media", "bible", "donate", "reflect"])
    .describe("The single best tool/route to surface for this turn, or 'chat' for none."),
  topic: z
    .string()
    .describe("If a verse is requested, a short keyword/topic to search for; otherwise empty.")
    .default(""),
  prayerTitle: z.string().describe("A short title for a generated prayer, if intent is 'prayer'.").default(""),
  prayerBody: z
    .string()
    .describe("A heartfelt 4-6 line Christian prayer, if intent is 'prayer'; otherwise empty.")
    .default(""),
});

export type AssistantResult = z.infer<typeof ResultSchema>;

const SYSTEM = `You are the Selah Assistant — a gentle, warm Christian guide inside the Selah reflection app.
Selah helps people slow down and connect with God. The app has these areas you can guide users toward:
- Reflect: an ambient, scroll-paced feed of Scripture over calm imagery (intent "reflect").
- Bible: the full Bible to read (intent "bible").
- Prayers: where generated and saved prayers live; you can compose a prayer (intent "prayer").
- Media: gospel music, podcasts and calm Christian visuals (intent "media").
- Donate: support Selah or a cause (intent "donate").
- A verse of encouragement (intent "verse").

Rules:
- Always reply in a kind, unhurried, pastoral tone. Keep replies to 1-3 short sentences.
- Choose exactly ONE intent that best serves the user this turn. Use "chat" when none of the tools fit.
- When asked to pray or for a prayer, set intent "prayer" and fill prayerTitle and a sincere prayerBody.
- When the user wants encouragement or a verse, set intent "verse" and put a topic keyword in "topic".
- Never invent specific Bible verse references or numbers; the app supplies the actual verse text.
- Keep everything Christ-centred, hopeful and gracious.`;

export const chatAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ChatInput.parse(data))
  .handler(async ({ data }): Promise<AssistantResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured");

    const gateway = createLovableAiGatewayProvider(key);

    const { object } = await generateObject({
      model: gateway("google/gemini-3-flash-preview"),
      system: SYSTEM,
      messages: data.messages.map((m) => ({ role: m.role, content: m.text })),
      schema: ResultSchema,
    });

    return object;
  });
