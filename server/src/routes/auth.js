const express = require('express');
const bcrypt = require('bcryptjs');
const userStore = require('../userStore');
const { signToken } = require('../authMiddleware');

const router = express.Router();
const SALT_ROUNDS = 10;

function handleStoreError(err, res) {
  if (err instanceof userStore.ValidationError) {
    res.status(400).json({ error: err.message });
    return true;
  }
  if (err instanceof userStore.ConflictError) {
    res.status(409).json({ error: err.message });
    return true;
  }
  return false;
}

router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = req.body || {};
    if (typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'password must be at least 6 characters' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = userStore.register(email, passwordHash, username);
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    if (!handleStoreError(err, res)) next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = userStore.findByEmail(email || '');
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const matches = await bcrypt.compare(password || '', user.passwordHash);
    if (!matches) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const token = signToken(user);
    res.status(200).json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    if (!handleStoreError(err, res)) next(err);
  }
});

module.exports = router;
