import db from '../DB/index.js';
import ai from '../AI/index.js';

function createChat(request) {
  const title = request.body.title?.trim() || null;
  const chat_id = db.chats.createChat(title);
  request.body.chat_id = chat_id;
}

export async function handleChatMessage(request, response) {
  const message = request.body.message.trim();
  let chat_id = request.params.chat_id || null;
  let model;

  if (!db.settings.exists('model')) {
    model = 'deepseek-r1';
    db.settings.set('model', model);
  } else db.settings.get('model').model;

  if (!(message.length > 0)) {
    response.status(400).json({ error: 'Message can not be empty.' });
    return;
  }

  if (!chat_id) createChat(request);
  else if (!(db.chats.doesExist(chat_id))) {
    response.status(400).json({
      error: 'chat_id does not exist'
    });
    return;
  }
  else request.chat_id = chat_id;

  response.setHeader('Content-Type', 'text/event-stream');
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Connection', 'keep-alive');

  const messages = db.chats.getMessages(request.chat_id).map(({ role, content }) => { role, content });
  let fullResponse = '';

  const stream = ai.chat({
    stream: true,
    model, messages: [...messages, { role: 'user', content: message }]
  });

  for await (const chunk of stream) {
    fullResponse += chunk.message.content;
    response.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }

  response.write('event: end\ndata: [DONE]\n\n');
  response.end();
}
