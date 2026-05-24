const { farmNetwork } = require('./farm-engine');
const configs = require('./config');

farmNetwork(configs.berachain).catch(err => {
  console.error('Berachain farming failed:', err);
  process.exit(1);
});
