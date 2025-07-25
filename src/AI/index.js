// server/src/ai/callLanguageModel.js
const DEFAULT_MODEL = process.env.DEFAULT_LLM_MODEL || 'deepseek-r1';
const DEFAULT_PROVIDER = process.env.DEFAULT_LLM_PROVIDER || 'ollama';

export async function callLanguageModel({
  messages = [],
  model = DEFAULT_MODEL,
  provider = DEFAULT_PROVIDER,
  stream = false,
  format = undefined,
  raw = true,
}) {
  const callParameter = { messages, model, stream, format, raw };

  switch (provider) {
    case 'ollama': {
      const { callLocalModel } = await import('./providers/ollama.js');
      return await callLocalModel(callParameter);
    }
    default: {
      throw new Error(`Unknown LLM provider: ${provider}`);
    }
  }
}
