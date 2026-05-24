const { farmNetwork } = require('./farm-engine');
const configs = require('./config');

farmNetwork(configs.monad).catch(err => {
  console.error('Monad farming failed:', err);
  process.exit(1);
});
