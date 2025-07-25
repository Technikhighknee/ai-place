import db from '../DB/index.js';
const DEFAULT_MODEL = db.settings.get('model');
const DEFAULT_PROVIDER = db.settings.get('provider');

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
