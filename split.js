const { ethers } = require('ethers');
const fs = require('fs');

const network = process.argv[2];
const fundedPrivateKey = process.argv[3];

if (!network || !fundedPrivateKey) {
  console.error('Usage: node split.js <network> <funded-wallet-private-key>');
  console.error('Example: node split.js scroll 0x123...abc');
  process.exit(1);
}

const configs = require('./config');
const config = configs[network];
if (!config) {
  console.error('Unknown network. Use: scroll, base, or monad');
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(config.rpcUrl, config.chainId, {
  staticNetwork: true,
  fetchOptions: { timeout: 15000 },
});

const fundedWallet = new ethers.Wallet(fundedPrivateKey, provider);
const wallets = JSON.parse(fs.readFileSync(config.walletFile, 'utf8'));

async function main() {
  const balance = await provider.getBalance(fundedWallet.address);
  console.log(`Funded wallet: ${fundedWallet.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} ${network.toUpperCase()} ETH`);
  console.log(`Distributing to ${wallets.length} wallets...\n`);

  // Keep 0.001 ETH for gas, distribute the rest evenly
  const gasReserve = ethers.parseEther('0.001');
  const totalToSend = balance - gasReserve;
  const perWallet = totalToSend / BigInt(wallets.length);

  if (totalToSend <= 0) {
    console.error('Not enough ETH. Get more from faucet first.');
    process.exit(1);
  }

  for (let i = 0; i < wallets.length; i++) {
    try {
      const tx = await fundedWallet.sendTransaction({
        to: wallets[i].address,
        value: perWallet,
      });
      await tx.wait();
      console.log(`${i + 1}/${wallets.length} Sent ${ethers.formatEther(perWallet)} ETH → ${wallets[i].address.slice(0, 6)}...`);
    } catch (e) {
      console.log(`${i + 1}/${wallets.length} FAILED: ${e.message.slice(0, 60)}`);
    }
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log('\nDone! All wallets funded.');
}

main().catch(console.error);
