let app;
let config;
try {
  ({ config } = require('./config'));
  app = require('./app');
} catch (err) {
  console.error(`Failed to start todo-server: ${err.message}`);
  process.exit(1);
}

app.listen(config.port, () => {
  console.log(`todo-server listening on port ${config.port} (${config.nodeEnv})`);
});
