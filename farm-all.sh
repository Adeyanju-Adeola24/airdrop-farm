#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "============================================"
echo "  Airdrop Testnet Farm - Starting All"
echo "============================================"
echo ""

echo "[1/5] Farming Scroll..."
node scroll.js
echo ""

echo "[2/5] Farming Base..."
node base.js
echo ""

echo "[3/5] Farming Monad..."
node monad.js
echo ""

echo "[4/5] Farming Linea..."
node linea.js
echo ""

echo "[5/5] Farming Berachain..."
node berachain.js
echo ""

echo "============================================"
echo "  All done! Wallets saved to ./wallets/"
echo "============================================"
