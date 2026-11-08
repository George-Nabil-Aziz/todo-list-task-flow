function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}

// Final Express error handler: client errors raised by middleware (malformed JSON, oversized
// body) keep their status; anything else becomes a generic 500 so internals never leak.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Malformed JSON body' });
    return;
  }
  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body too large' });
    return;
  }
  const status = err.status || err.statusCode;
  if (status >= 400 && status < 500 && err.expose) {
    res.status(status).json({ error: err.message });
    return;
  }
  (req.log || console).error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { notFoundHandler, errorHandler };
