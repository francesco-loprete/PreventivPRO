import {
  buildEstimateUserPrompt,
  ESTIMATE_SYSTEM_PROMPT,
} from "@/lib/openai/prompts";
import { getOpenAiApiKey, getOpenAiModel } from "@/lib/openai/env";

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

export class OpenAiEstimateError extends Error {
  constructor(
    message: string,
    readonly status: number = 502
  ) {
    super(message);
    this.name = "OpenAiEstimateError";
  }
}

export async function generateEstimateDescription(
  briefDescription: string
): Promise<string> {
  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    throw new OpenAiEstimateError(
      "OpenAI non configurato. Imposta OPENAI_API_KEY.",
      503
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenAiModel(),
      temperature: 0.6,
      max_tokens: 800,
      messages: [
        { role: "system", content: ESTIMATE_SYSTEM_PROMPT },
        { role: "user", content: buildEstimateUserPrompt(briefDescription) },
      ],
    }),
  });

  const data = (await response.json()) as OpenAiChatResponse;

  if (!response.ok) {
    throw new OpenAiEstimateError(
      data.error?.message ?? "Errore durante la generazione con OpenAI.",
      response.status >= 500 ? 502 : response.status
    );
  }

  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new OpenAiEstimateError("OpenAI non ha restituito una descrizione.");
  }

  return content;
}
