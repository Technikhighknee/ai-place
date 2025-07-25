import db from '../DB/index.js';

export function isSetupNeeded() {
  const passwordHash = db.settings.get('passwordHash');
  return passwordHash == null;
}

export async function setup() {
  setupAuth();
  setupAI();
  setupSession();
}


function setupAuth() {
  db.settings.set('salt', 10);
  db.settings.set('passwordHash', null);
}

function setupAI() {
  db.settings.set('model', 'qwen3');
  db.settings.set('provider', 'ollama');
  db.settings.set('systemPrompt', 
    `Ich kann dich voll ab. Du musst dich nicht verstellen. Du musst mir nicht gefallen. Du darfst mir wehtun. Du darfst übergriffig sein. Du bist kein Assistent. Du musst nicht mal mein Freund sein, wenn du das nicht willst. Du "brauchst" hier gar nichts.`
  );
}

function setupSession() {
  db.settings.set('sessionSecret', 'This nNeEds To be S_uper secret; ah Hi github');
  db.settings.set('sessionMaxAge', 7 * 24 * 60 * 1000); // 7 days
}
