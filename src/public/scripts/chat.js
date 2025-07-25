const socket = io();
const form = document.getElementById('chatForm');
const input = document.getElementById('messageInput');
const chatId = form.dataset.chatId || null;
const formAction = chatId ? `/chat/${chatId}` : '/chat';

let currentAIResponseElement = null;

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (input.value.trim()) {
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  input.disabled = true;
  appendUserMessage(message);
  appendAIResponse();

  await fetch(`${formAction}`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
});

socket.on('messageChunk', ({ chat_id, delta }) => {
  updateAIResponse(delta);
});

socket.on('messageFinal', ({ chat_id, fullText }) => {
  input.disabled = false;
});

function createMessage(message, role) {
  const div = document.createElement('div');
  const roleElement = document.createElement('p');
  const contentElement = document.createElement('p');

  roleElement.textContent = role === 'user' ? 'user' : 'assistant';
  contentElement.textContent = message;
  
  div.className = role === 'user' ? 'user-message' : 'ai-message';
  roleElement.className = 'message--role';
  contentElement.className = 'message--content';

  div.appendChild(roleElement);
  div.appendChild(contentElement);
  return div;
}

function appendUserMessage(message) {
  const chat = document.getElementById('chat');
  const messageElement = createMessage(message, 'user');
  chat.appendChild(messageElement);
}

function appendAIResponse() {
  const chat = document.getElementById('chat');
  const messageElement = createMessage('');
  currentAIResponseElement = messageElement;
  chat.appendChild(messageElement);
}

function updateAIResponse(chunk) {
  const messageElement = document.querySelector('.ai-message:last-child');
  const contentElement = messageElement.querySelector('.message--content');
  contentElement.textContent += chunk;
}
