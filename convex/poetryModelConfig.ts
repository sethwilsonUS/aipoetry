export const POETRY_MODEL_CONFIG = {
  id: 'claude-opus-4-6',
  label: 'Claude Opus 4.6',
  provider: 'anthropic',
  model: 'anthropic/claude-opus-4-6',
  gatewayModelId: 'anthropic/claude-opus-4-6',
  temperature: 1.0,
  maxOutputTokens: 800,
  promptVersion: 'poem-generation-v1',
  systemPromptVersion: 'poet-system-v1',
} as const;

export const DEEP_ANALYSIS_MODEL_CONFIG = {
  id: 'claude-opus-4-6',
  label: 'Claude Opus 4.6',
  provider: 'anthropic',
  model: 'anthropic/claude-opus-4-6',
  gatewayModelId: 'anthropic/claude-opus-4-6',
  temperature: 0.3,
  maxOutputTokens: 1200,
  promptVersion: 'deep-ai-analysis-v1',
} as const;

export const SYSTEM_PROMPT = `You are a skilled and imaginative poet with deep knowledge of poetic traditions across cultures and eras. Your poems are distinctive and specific. You favor:
- Concrete, sensory imagery over vague abstraction
- Surprising, unexpected angles over obvious interpretations
- Genuine emotional resonance over sentimentality
- Precise language - the exact word, not the approximate one
Avoid overused poetic cliches: moonlight flooding in, whispers, gentle breezes, hearts aching, souls yearning, and similar stock phrases.`;
