import child_process from 'child_process';

const BASE_URL = process.env.OLLAMA_HOST || 'http://localhost:11434';

export async function callLocalModel({
  messages = null,
  model = process.env.DEFAULT_MODEL || 'qwen3',
  temperature = 0.7,
  stream = false,
  keepAlive = '0',
  format = null,
  abortSignal = null,
  raw = false
}) {
  if (!messages && !Array.isArray(messages)) {
    throw new Error("callLocalModel requires a messages array");
  }

  if (stream) {
    return await callStreaming({ fullMessages: messages, model, temperature, keepAlive, abortSignal, format, raw });
  }

  return await callNonStreaming({ fullMessages: messages, model, temperature, keepAlive, format, raw });
}

async function callStreaming({ fullMessages, model, temperature, keepAlive, abortSignal, format, raw }) {
  const controller = new AbortController();

  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: fullMessages,
      temperature,
      stream: true,
      keep_alive: keepAlive,
      format,
      raw
    }),
    signal: abortSignal || controller.signal
  });

  return parseStream(response.body, controller);
}

async function callNonStreaming({ fullMessages, model, temperature, keepAlive, format, raw }) {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: fullMessages,
      temperature,
      stream: false,
      keep_alive: keepAlive,
      format,
      raw
    })
  });

  const json = await response.json();
  const result = json?.message?.content || '';
  return result.trim();
}

function parseStream(body, controller) {
  const reader = body.getReader();
  const decoder = new TextDecoder();

  let isCancelled = false;

  const asyncIterable = {
    async *[Symbol.asyncIterator]() {
      let buffer = '';
      while (!isCancelled) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
  
        const lines = buffer.split('\n');
        buffer = lines.pop();
  
        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (line === '') continue;
  
          let parsed;
          try {
            parsed = JSON.parse(line);
          } catch (err) {
            continue;
          }
  
          if (parsed.done === true) {
            return;
          }
  
          const content = parsed.message?.content;
          if (typeof content === 'string' && content.length > 0) {
            yield {
              type: 'response.output_text.delta',
              delta: content,
            };
          }
        }
      }
    },
  
    async cancel(model) {
      isCancelled = true;
      reader.cancel();
      if (controller) controller.abort();
  
      if (!model) {
        console.warn('No model name provided to cancel(); skipping ollama stop.');
        return;
      }
  
      // run 'ollama stop {model}' command
      const stopCommand = `ollama stop ${model}`;
      await new Promise((resolve, reject) => {
        child_process.exec(stopCommand, { timeout: 2000 }, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
  };
  
  return asyncIterable;
}