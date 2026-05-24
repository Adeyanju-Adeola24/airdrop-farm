const { ethers } = require('ethers');
const fs = require('fs');

const WALLET_COUNT = 20;
const TX_PER_WALLET = 5;
const TX_DELAY_MS = 8000;
const WALLET_DELAY_MS = 20000;

function generateWallets(count) {
  const wallets = [];
  for (let i = 0; i < count; i++) {
    const wallet = ethers.Wallet.createRandom();
    wallets.push({ address: wallet.address, privateKey: wallet.privateKey });
  }
  return wallets;
}

function loadOrCreateWallets(walletFile, count) {
  if (fs.existsSync(walletFile)) {
    const data = JSON.parse(fs.readFileSync(walletFile, 'utf8'));
    if (data.length >= count) {
      console.log(`  Loaded ${data.length} existing wallets.`);
      return data;
    }
  }
  console.log(`  Generating ${count} wallets...`);
  const wallets = generateWallets(count);
  const dir = walletFile.substring(0, walletFile.lastIndexOf('/'));
  if (dir) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(walletFile, JSON.stringify(wallets, null, 2));
  console.log(`  Saved to ${walletFile}`);
  return wallets;
}

async function requestFaucet(address, faucetUrl) {
  if (!faucetUrl) {
    console.log('  No faucet URL configured — skipping faucet request.');
    return false;
  }
  try {
    const response = await fetch(faucetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });
    const ok = response.ok;
    console.log(`  Faucet response: ${ok ? 'OK' : 'FAIL'} (${response.status})`);
    return ok;
  } catch (e) {
    console.log(`  Faucet error: ${e.message}`);
    return false;
  }
}

async function farmNetwork(config) {
  console.log(`\n========== FARMING ${config.name.toUpperCase()} ==========\n`);

  const provider = new ethers.JsonRpcProvider(config.rpcUrl, config.chainId, { staticNetwork: true });
  const wallets = loadOrCreateWallets(config.walletFile, WALLET_COUNT);

  for (let i = 0; i < wallets.length; i++) {
    const walletData = wallets[i];
    const wallet = new ethers.Wallet(walletData.privateKey, provider);
    console.log(`\nWallet ${i + 1}/${wallets.length}: ${wallet.address}`);

    await requestFaucet(wallet.address, config.faucetUrl);
    console.log('  Waiting 15s for faucet funds...');
    await new Promise(r => setTimeout(r, 15000));

    let balance;
    try {
      balance = await provider.getBalance(wallet.address);
      console.log(`  Balance: ${ethers.formatEther(balance)} ETH`);
    } catch (e) {
      console.log(`  Balance check failed: ${e.message}`);
      balance = 0n;
    }

    if (balance === 0n) {
      console.log('  No funds — waiting 30s then retrying...');
      await new Promise(r => setTimeout(r, 30000));
      try {
        balance = await provider.getBalance(wallet.address);
        console.log(`  Balance: ${ethers.formatEther(balance)} ETH`);
      } catch (e) {
        console.log('  Balance still 0, continuing anyway...');
      }
    }

    for (let t = 0; t < TX_PER_WALLET; t++) {
      console.log(`  Tx ${t + 1}/${TX_PER_WALLET}`);
      try {
        const tx = await wallet.sendTransaction({
          to: wallet.address,
          value: ethers.parseEther('0.0001'),
        });
        await tx.wait();
        console.log(`    OK: ${tx.hash.slice(0, 10)}...`);
      } catch (e) {
        console.log(`    FAIL: ${e.message}`);
      }
      if (t < TX_PER_WALLET - 1) {
        await new Promise(r => setTimeout(r, TX_DELAY_MS));
      }
    }

    if (i < wallets.length - 1) {
      console.log(`  Waiting ${WALLET_DELAY_MS / 1000}s before next wallet...`);
      await new Promise(r => setTimeout(r, WALLET_DELAY_MS));
    }
  }

  console.log(`\n===== ${config.name} FARMING COMPLETE =====\n`);
}

module.exports = { farmNetwork };
