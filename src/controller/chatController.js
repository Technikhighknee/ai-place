import db from '../DB/index.js';
import { callLanguageModel } from '../AI/index.js';
import { emit } from '../io.js';

function createChat(request) {
  const title = request.body.title?.trim() || null;
  const chat_id = db.chats.createChat(title);
  request.chat_id = chat_id;
  return chat_id;
}

export async function handleChatMessage(request, response) {
  const model = request.body.model || db.settings.get('model');
  const message = request.body.message.trim();
  let chat_id = request.params.chat_id || null;

  if (!(message.length > 0)) {
    response.status(400).json({ error: 'Message can not be empty.' });
    return;
  }

  if (!chat_id) {
    chat_id = createChat(request);
  } else if (!db.chats.exists(chat_id)) {
    response.status(400).json({
      error: 'chat_id does not exist'
    });
    return;
  }

  const messages = buildMessagesArray(chat_id, message);
  
  response.setHeader('Content-Type', 'application/json');
  response.status(200).json({ message: 'Message received.' });
  
  const stream = await callLanguageModel({
    messages, model,
    provider: 'ollama', stream: true
  });
  
  let fullAIResponse = '';
  for await (const chunk of stream) {
    if (chunk.type === 'response.output_text.delta') {
      fullAIResponse += chunk.delta;
      emit(request.session.id, 'messageChunk', { delta: chunk.delta, chat_id });
    }
  }
  
  db.chats.saveMessage(chat_id, 'user', message);
  db.chats.saveMessage(chat_id, 'assistant', fullAIResponse);
  emit(request.session.id, 'messageFinal', { fullText: fullAIResponse, chat_id });
}

function buildMessagesArray(chat_id, message) {
  const messages = [];
  const systemPrompt = db.settings.get('systemPrompt');

  messages.push({ role: 'system', content: systemPrompt });

  db.chats.getMessages(chat_id)
    .forEach(message => {
      messages.push({
        role: message.role,
        content: message.content,
      });
    })

  messages.push({
    role: 'user',
    content: message.trim()
  });
  
  return messages;
}