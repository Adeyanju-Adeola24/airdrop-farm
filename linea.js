const { farmNetwork } = require('./farm-engine');
const configs = require('./config');

farmNetwork(configs.linea).catch(err => {
  console.error('Linea farming failed:', err);
  process.exit(1);
});
