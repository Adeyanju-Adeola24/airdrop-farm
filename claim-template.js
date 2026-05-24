// =========================================
// CLAIM SCRIPT — adapt when airdrop launches
// =========================================
// Usage: node claim-template.js <testnet-name> <destination-address>
// Example: node claim-template.js scroll 0xYourAddressHere
//
// This is a TEMPLATE. When an airdrop is announced,
// update the claim function below with the actual contract ABI and logic.

const fs = require('fs');
const { ethers } = require('ethers');

const testnet = process.argv[2];
const destAddress = process.argv[3];

if (!testnet || !destAddress) {
  console.error('Usage: node claim-template.js <testnet> <destination-address>');
  process.exit(1);
}

if (!ethers.isAddress(destAddress)) {
  console.error('Invalid destination address.');
  process.exit(1);
}

const walletFile = `./wallets/${testnet}-wallets.json`;
if (!fs.existsSync(walletFile)) {
  console.error(`No wallets file found: ${walletFile}`);
  process.exit(1);
}

const wallets = JSON.parse(fs.readFileSync(walletFile, 'utf8'));
console.log(`Loaded ${wallets.length} wallets from ${walletFile}`);
console.log(`Destination: ${destAddress}`);
console.log('');

const configs = require('./config');
const network = configs[testnet];
if (!network) {
  console.error(`Unknown network: ${testnet}`);
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(network.rpcUrl, network.chainId, { staticNetwork: true });

async function main() {
  for (let i = 0; i < wallets.length; i++) {
    const wallet = new ethers.Wallet(wallets[i].privateKey, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log(`Wallet ${i + 1}: ${wallet.address} — ${ethers.formatEther(balance)} ETH`);

    // ---- CLAIM LOGIC GOES HERE ----
    // This is where you'll add:
    // 1. Contract ABI for the airdrop claim
    // 2. Contract address
    // 3. Claim function call
    // 4. Token transfer to destination address
    // Example:
    // const contract = new ethers.Contract(contractAddress, abi, wallet);
    // const tx = await contract.claim();
    // await tx.wait();
    // await wallet.sendTransaction({ to: destAddress, value: balance });
    // --------------------------------
  }

  console.log('\nDone. Update this script with actual claim logic when the airdrop launches.');
}

main().catch(err => {
  console.error('Claim failed:', err);
  process.exit(1);
});
