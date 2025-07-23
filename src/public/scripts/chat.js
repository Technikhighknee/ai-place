const socket = io();
const form = document.getElementById('chatForm');
const input = document.getElementById('messageInput');
const chatId = form.dataset.chatId || null;
const formAction = chatId ? `/chat/${chatId}` : '/chat';

let currentAIResponseElement = null;

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
  const outerElement = document.createElement('div');
  const innerElement = document.createElement('p');

  innerElement.textContent = message;
  innerElement.className = 'text-base text-gray-100';
  outerElement.className = role === 'user'
    ? 'p-4 rounded-md bg-gray-800 shadow-inner message--user'
    : 'p-4 rounded-md bg-gray-700 message--ai';

  outerElement.appendChild(innerElement);
  return outerElement;
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
  const messageElement = document.querySelector('.message--ai:last-child');
  const innerElement = messageElement.querySelector('p');
  innerElement.textContent += chunk;
}