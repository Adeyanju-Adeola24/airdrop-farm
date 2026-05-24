const configs = {
  scroll: {
    name: 'Scroll',
    rpcUrl: 'https://sepolia-rpc.scroll.io',
    chainId: 534351,
    faucetUrl: null,
    walletFile: './wallets/scroll-wallets.json',
  },
  base: {
    name: 'Base',
    rpcUrl: 'https://sepolia.base.org',
    chainId: 84532,
    faucetUrl: null,
    walletFile: './wallets/base-wallets.json',
  },
  monad: {
    name: 'Monad',
    rpcUrl: 'https://testnet-rpc.monad.xyz',
    chainId: 10143,
    faucetUrl: null,
    walletFile: './wallets/monad-wallets.json',
  },
  linea: {
    name: 'Linea',
    rpcUrl: 'https://rpc.sepolia.linea.build',
    chainId: 59141,
    faucetUrl: null,
    walletFile: './wallets/linea-wallets.json',
  },
  berachain: {
    name: 'Berachain',
    rpcUrl: 'https://bartio.rpc.berachain.com',
    chainId: 80084,
    faucetUrl: null,
    walletFile: './wallets/berachain-wallets.json',
  },
};

module.exports = configs;
