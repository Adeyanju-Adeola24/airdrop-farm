const { farmNetwork } = require('./farm-engine');
const configs = require('./config');

farmNetwork(configs.scroll).catch(err => {
  console.error('Scroll farming failed:', err);
  process.exit(1);
});
