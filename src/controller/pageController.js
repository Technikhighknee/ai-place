import db from "../DB/index.js";

function render(response, target, data = {}) {
  response.render(target, Object.assign(data, { 
    settings: db.settings.getAll(),
    chats: db.chats.listChats(),
  }));
}

export function renderRoot(request, response) {
  render(response, 'chat');
}

export function renderLogin(request, response) {
  const error = request.session.error || null;
  delete request.session.error;
  render(response, 'login', {
    error,
    firstTime: !db.settings.get('passwordHash'),
  });
}

export function renderChat(request, response) {
  const { chat_id } = request.params;
  if (!chat_id) return render(response, 'chat');
  const chat = db.chats.getChat(chat_id);
  render(response, 'chat', { chat });
}

export async function renderSettings(request, response) {
  render(response, 'settings');
}
