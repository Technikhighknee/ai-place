import bcrypt from 'bcryptjs';
import db from '../DB/index.js';

export function isAuthenticated(request, response, next) {
  request.session.isAuthenticated
    ? next()
    : response.redirect('/auth/login');
}

export function isNotAuthenticated(request, response, next) {
  request.session.isAuthenticated
    ? response.redirect('/')
    : next();
}

export async function handleLogin(request, response) {
  const { password } = request.body;
  const passwordHash = getPasswordHash();
  
  if (!password) {
    request.session.error = 'Password can not be empty.';
    request.session.save();
    response.redirect('/auth/login');
    return;
  }

  if (passwordHash == null) {
    request.body.newPassword = password;
    handleSetPassword(request, response);
    return;
  }

  const doesMatch = await bcrypt.compare(password, passwordHash);

  if (!doesMatch) {
    request.session.error = 'Password does not match.';
    request.session.save();
    response.redirect('/auth/login');
    return;
  }

  delete request.session.error;
  request.session.isAuthenticated = true;
  request.session.save();
  response.redirect('/');
  return;
}

export function handleLogout(request, response) {
  request.session.isAuthenticated = false;
  request.session.save();
  response.redirect('/auth/login');
}

export async function handleSetPassword(request, response) {
  const { oldPassword, newPassword } = request.body;
  const passwordHash = getPasswordHash();

  if (!passwordHash) {
    await setPassword(newPassword);
    request.session.error = null;
    request.session.isAuthenticated = true;
    request.session.save();
    response.redirect('/');
    return;
  }

  const doesMatch = await bcrypt.compare(oldPassword, passwordHash);
  if (!doesMatch) return; // not sure how to handle settings yet; will come back to this

  await setPassword(newPassword);
}

function getPasswordHash() {
  return db.settings.get('passwordHash');
}

async function setPassword(password) {
  const salt = db.settings.get('salt');
  db.settings.set('passwordHash', await bcrypt.hash(password, salt));
}
