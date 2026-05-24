// =========================================
// CLAIM SCRIPT — adapt when airdrop launches
// =========================================
// Usage: node claim.js <network> <dest-address> [options]
//   network: scroll | base | monad
//   dest-address: where to send claimed tokens
//   options: --check-only (just check balances, don't claim)
//            --collect-eth (send all ETH to destination)
//
// Example: node claim.js scroll 0xYourAddressHere --check-only
//
// When an airdrop launches:
// 1. Run with --check-only to see balances
// 2. Update CLAIM_CONFIG with the contract details
// 3. Run again without --check-only to claim

const fs = require('fs');
const { ethers } = require('ethers');

// ========== UPDATE THIS WHEN AIRDROP LAUNCHES ==========
const CLAIM_CONFIG = {
  // Example: Scroll airdrop
  scroll: {
    contractAddress: null,  // e.g., '0x123...'
    abi: null,              // e.g., ['function claim(bytes32[] proof, address to)']
    claimMethod: 'claim',   // e.g., 'claim'
    claimArgs: [],          // e.g., [proofArray, walletAddress]
    tokenAddress: null,     // Address of the claimed token
    tokenSymbol: 'SCR',     // Token symbol for display
  },
  base: {
    contractAddress: null,
    abi: null,
    claimMethod: 'claim',
    claimArgs: [],
    tokenAddress: null,
    tokenSymbol: 'BASE',
  },
  monad: {
    contractAddress: null,
    abi: null,
    claimMethod: 'claim',
    claimArgs: [],
    tokenAddress: null,
    tokenSymbol: 'MON',
  },
};
// =======================================================

const networkName = process.argv[2];
const destAddress = process.argv[3];
const options = process.argv.slice(4);

if (!networkName || !destAddress) {
  console.error('Usage: node claim.js <network> <dest-address> [--check-only] [--collect-eth]');
  console.error('  network: scroll, base, or monad');
  console.error('  --check-only: Check balances without claiming');
  console.error('  --collect-eth: Send all ETH to destination');
  process.exit(1);
}

if (!ethers.isAddress(destAddress)) {
  console.error('Invalid destination address.');
  process.exit(1);
}

const checkOnly = options.includes('--check-only');
const collectEth = options.includes('--collect-eth');

const walletFile = `./wallets/${networkName}-wallets.json`;
if (!fs.existsSync(walletFile)) {
  console.error(`No wallets file found: ${walletFile}`);
  console.error('Run the farm script first to generate wallets.');
  process.exit(1);
}

const wallets = JSON.parse(fs.readFileSync(walletFile, 'utf8'));
console.log(`\nLoaded ${wallets.length} wallets from ${walletFile}`);
console.log(`Destination: ${destAddress}`);
console.log(`Mode: ${checkOnly ? 'CHECK ONLY' : 'CLAIM'}`);
console.log('');

const configs = require('./config');
const network = configs[networkName];
if (!network) {
  console.error(`Unknown network: ${networkName}`);
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(network.rpcUrl, network.chainId, {
  staticNetwork: true,
  fetchOptions: { timeout: 15000 },
});

async function getTokenBalance(tokenAddr, walletAddr, provider) {
  if (!tokenAddr) return null;
  const erc20Abi = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'];
  const token = new ethers.Contract(tokenAddr, erc20Abi, provider);
  try {
    const [bal, dec] = await Promise.all([token.balanceOf(walletAddr), token.decimals()]);
    return ethers.formatUnits(bal, dec);
  } catch { return null; }
}

async function main() {
  let totalEth = 0n;
  let totalTokens = 0n;
  let claimed = 0;

  for (let i = 0; i < wallets.length; i++) {
    const wallet = new ethers.Wallet(wallets[i].privateKey, provider);
    const addr = wallet.address;

    try {
      const balance = await provider.getBalance(addr);
      totalEth += balance;
      const ethStr = ethers.formatEther(balance);

      let tokenStr = '';
      const claimCfg = CLAIM_CONFIG[networkName];

      // Check token balance if configured
      if (claimCfg?.tokenAddress) {
        const tBal = await getTokenBalance(claimCfg.tokenAddress, addr, provider);
        tokenStr = tBal ? ` | ${tBal} ${claimCfg.tokenSymbol}` : '';
      }

      console.log(`[${String(i+1).padStart(2)}] ${addr.slice(0,6)}...${addr.slice(-4)} | ${parseFloat(ethStr).toFixed(6)} ETH${tokenStr}`);

      // Claim if configured and not check-only
      if (!checkOnly && claimCfg?.contractAddress && claimCfg?.abi) {
        // TODO: Add claim logic here when airdrop launches
        // const contract = new ethers.Contract(claimCfg.contractAddress, claimCfg.abi, wallet);
        // const args = claimCfg.claimArgs.map(a => a === '$wallet' ? addr : a);
        // const tx = await contract[claimCfg.claimMethod](...args);
        // await tx.wait();
        // claimed++;
        // console.log(`  -> Claimed! Tx: ${tx.hash.slice(0,10)}...`);
      }

      // Collect ETH
      if (collectEth && balance > 0n) {
        const gasPrice = await provider.getFeeData();
        const gasCost = gasPrice.gasPrice * 21000n;
        const toSend = balance - gasCost;
        if (toSend > 0n) {
          const tx = await wallet.sendTransaction({ to: destAddress, value: toSend });
          await tx.wait();
          console.log(`  -> ETH sent! Tx: ${tx.hash.slice(0,10)}...`);
        }
      }
    } catch (e) {
      console.log(`[${String(i+1).padStart(2)}] ${wallets[i].address.slice(0,6)}... | ERROR: ${e.message.slice(0,60)}`);
    }
  }

  console.log('\n===== SUMMARY =====');
  console.log(`Total ETH: ${ethers.formatEther(totalEth)}`);
  if (checkOnly) {
    console.log('\nReady to claim. Remove --check-only to execute claims.');
  }
  if (collectEth) {
    console.log(`ETH collected to: ${destAddress}`);
  }
  console.log('===================');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
