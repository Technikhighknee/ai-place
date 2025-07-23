import http from 'http';
import https from 'https';
import app from './app.js';
import { setupSocketIO } from './io.js';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const HTTP_PORT = 20080;
const HTTPS_PORT = 20443;

const certPath = `./data/certificates`;
const keyFile = `${certPath}/key.pem`;
const certFile = `${certPath}/cert.pem`;

function ensureCert() {
  if (existsSync(keyFile) && existsSync(certFile)) return;
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout ${keyFile} -out ${certFile} -days 365 -subj "/CN=localhost"`);
}


function redirectHandler(request, response) {
  const host = request.headers.host?.replace(/:\d+$/, `:${HTTPS_PORT}`) || `localhost:${HTTPS_PORT}`;
  response.writeHead(301, { Location: `https://${host}${request.url}` });
  response.end();
}

function logOrThrow(type) {
  return function (error) {
    if (error) throw error;
    console.log(type, 'server started.')
  }
}

ensureCert();

const httpsOptions = {
  key: readFileSync(keyFile),
  cert: readFileSync(certFile)
}

const httpsServer = https.createServer(httpsOptions, app);
const httpRedirectServer = http.createServer(redirectHandler);

httpsServer.listen(HTTPS_PORT, logOrThrow('https'));
httpRedirectServer.listen(HTTP_PORT, logOrThrow('http'));

setupSocketIO(httpsServer);
