import ollama from './providers/ollama.js';
import db from '../DB/index.js';

let { provider } = db.settings.get('AIProvider')
if (!provider) {
  provider = 'ollama';
  db.settings.set('AIProvider', provider);
}


export class AIConnector {
  constructor({ provider }) {
    this._provider = _attachProvider(provider);
  }
  
  async chat(callParameter) {
    return await this._provider.chat(callParameter);
  }
  
  async generate(callParameter) {
    return await this._provider.generate(callParameter);
  }
}

function _attachProvider(provider) {
  switch (provider) {
    case 'ollama': { return ollama };
  }
  throw new Error(`Unknown provider ${provider}`);
}
export default new AIConnector({provider});
