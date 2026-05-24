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
};

module.exports = configs;
