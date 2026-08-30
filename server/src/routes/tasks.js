const express = require('express');
const taskStore = require('../taskStore');

const router = express.Router();

function handleStoreError(err, res) {
  if (err instanceof taskStore.ValidationError) {
    res.status(400).json({ error: err.message });
    return true;
  }
  if (err instanceof taskStore.NotFoundError) {
    res.status(404).json({ error: err.message });
    return true;
  }
  return false;
}

router.get('/', (req, res) => {
  res.status(200).json(taskStore.getAll(req.userId));
});

router.post('/', (req, res) => {
  try {
    const task = taskStore.create(req.body?.title, req.userId, req.body?.priority);
    res.status(201).json(task);
  } catch (err) {
    if (!handleStoreError(err, res)) throw err;
  }
});

router.put('/:id', (req, res) => {
  try {
    const task = taskStore.update(Number(req.params.id), req.body?.title, req.userId);
    res.status(200).json(task);
  } catch (err) {
    if (!handleStoreError(err, res)) throw err;
  }
});

router.delete('/:id', (req, res) => {
  try {
    taskStore.remove(Number(req.params.id), req.userId);
    res.status(204).end();
  } catch (err) {
    if (!handleStoreError(err, res)) throw err;
  }
});

router.patch('/:id/status', (req, res) => {
  try {
    const task = taskStore.setStatus(Number(req.params.id), req.body?.status, req.userId);
    res.status(200).json(task);
  } catch (err) {
    if (!handleStoreError(err, res)) throw err;
  }
});

router.patch('/:id/priority', (req, res) => {
  try {
    const task = taskStore.setPriority(Number(req.params.id), req.body?.priority, req.userId);
    res.status(200).json(task);
  } catch (err) {
    if (!handleStoreError(err, res)) throw err;
  }
});

module.exports = router;
