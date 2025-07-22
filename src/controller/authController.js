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
  
  if (!password) {
    request.session.error = 'Password can not be empty.';
    request.session.save();
    response.redirect('/auth/login');
    return;
  }
  
  if (!db.settings.has('password')) {
    request.body.newPassword = password;
    handleSetPassword(request, response);
    return;
  }
  
  const { password: currentPassword } = db.settings.get('password');
  const doesMatch = await bcrypt.compare(password, currentPassword);

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

export async function handleSetPassword(request, response) {
  const { salt, password } = db.settings.get('salt', 'password');
  const { oldPassword, newPassword } = request.body;
  const DEFAULT_SALT = 10;
  let realSalt;

  if (!salt) {
    db.settings.set('salt', DEFAULT_SALT);
    realSalt = DEFAULT_SALT;
  }
  else realSalt = salt;

  if (!password) {
    db.settings.set('password', await bcrypt.hash(newPassword, realSalt));
    request.session.isAuthenticated = true;
    request.session.save();
    response.redirect('/');
    return;
  }

  if (!(await bcrypt.compare(oldPassword, password))) {
    response.status(400).json({ error: 'Old password does not match.' });
    return;
  }

  db.settings.set('password', await bcrypt.hash(newPassword, realSalt));
}
