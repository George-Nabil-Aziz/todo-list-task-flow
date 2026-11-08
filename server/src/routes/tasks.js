const express = require('express');
const taskStore = require('../taskStore');
const { schemas, validate } = require('../validation');

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

router.post('/', validate({ body: schemas.createTask }), (req, res) => {
  try {
    const task = taskStore.create(req.body?.title, req.userId, req.body?.priority);
    res.status(201).json(task);
  } catch (err) {
    if (!handleStoreError(err, res)) throw err;
  }
});

router.put('/:id', validate({ params: schemas.idParams, body: schemas.updateTask }), (req, res) => {
  try {
    const task = taskStore.update(req.params.id, req.body?.title, req.userId);
    res.status(200).json(task);
  } catch (err) {
    if (!handleStoreError(err, res)) throw err;
  }
});

router.delete('/:id', validate({ params: schemas.idParams }), (req, res) => {
  try {
    taskStore.remove(req.params.id, req.userId);
    res.status(204).end();
  } catch (err) {
    if (!handleStoreError(err, res)) throw err;
  }
});

router.patch('/:id/status', validate({ params: schemas.idParams, body: schemas.taskStatus }), (req, res) => {
  try {
    const task = taskStore.setStatus(req.params.id, req.body?.status, req.userId);
    res.status(200).json(task);
  } catch (err) {
    if (!handleStoreError(err, res)) throw err;
  }
});

router.patch('/:id/priority', validate({ params: schemas.idParams, body: schemas.taskPriority }), (req, res) => {
  try {
    const task = taskStore.setPriority(req.params.id, req.body?.priority, req.userId);
    res.status(200).json(task);
  } catch (err) {
    if (!handleStoreError(err, res)) throw err;
  }
});

module.exports = router;
