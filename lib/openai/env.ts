export const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

export function getOpenAiApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim() || undefined;
}

export function getOpenAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || OPENAI_DEFAULT_MODEL;
}

export function isOpenAiConfigured(): boolean {
  return Boolean(getOpenAiApiKey());
}
