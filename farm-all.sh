#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "============================================"
echo "  Airdrop Testnet Farm - Starting All"
echo "============================================"
echo ""

echo "[1/3] Farming Scroll..."
node scroll.js
echo ""

echo "[2/3] Farming Base..."
node base.js
echo ""

echo "[3/3] Farming Monad..."
node monad.js
echo ""

echo "============================================"
echo "  All done! Wallets saved to ./wallets/"
echo "============================================"
