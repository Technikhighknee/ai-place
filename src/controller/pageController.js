import db from "../DB/index.js";

function render(response, target, data = {}) {
  response.render(target, Object.assign(data, { 
    settings: db.settings.getAll(),
  }));
}

export function renderRoot(request, response) {
  const chats = db.chats.listChats();
  render(response, 'root', { chats });
}

export function renderLogin(request, response) {
  render(response, 'login', { 
    error: request.error || null,
    firstTime: db.settings.get('password')
  });
}

export function renderChat(request, response) {
  const { chat_id } = request.params;
  if (!chat_id) return render(response, 'chat');
  const chat = db.chats.getChatById(chat_id);
  render(response, 'chat', { chat });
}

export async function renderSettings(request, response) {
  render(response, 'settings');
}
