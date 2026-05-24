const { farmNetwork } = require('./farm-engine');
const configs = require('./config');

farmNetwork(configs.base).catch(err => {
  console.error('Base farming failed:', err);
  process.exit(1);
});
