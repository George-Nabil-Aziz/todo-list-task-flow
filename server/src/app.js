const express = require('express');
const cors = require('cors');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const { requireAuth } = require('./authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/tasks', requireAuth, tasksRouter);

module.exports = app;
