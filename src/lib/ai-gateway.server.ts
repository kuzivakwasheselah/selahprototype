import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Connects the AI SDK to the Lovable AI Gateway. Server-only — the
 * LOVABLE_API_KEY must never reach the browser.
 */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}
