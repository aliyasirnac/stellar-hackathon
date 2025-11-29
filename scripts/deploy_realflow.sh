#!/bin/bash
set -e

NETWORK="${1:-local}"
IDENTITY="${2:-alice}"

echo "🌍 Target Network: $NETWORK"
echo "👤 Identity: $IDENTITY"

if [ "$NETWORK" == "testnet" ]; then
    echo "🔍 Checking identity on testnet..."
    if ! stellar keys address $IDENTITY > /dev/null 2>&1; then
        echo "⚠️  Identity '$IDENTITY' not found. Creating and funding..."
        stellar keys generate $IDENTITY --network testnet
    else
        echo "✅ Identity '$IDENTITY' exists."
        # Optional: Check balance or just try to fund/deploy
    fi
    
    # Always try to fund on testnet to ensure enough XLM
    echo "💸 Funding identity on testnet..."
    stellar keys fund $IDENTITY --network testnet || echo "⚠️  Funding might have failed (maybe already funded), proceeding..."
fi

echo "🏗️  Building RealFlow Contract..."
stellar contract build

echo "🚀 Deploying RealFlow Contract to $NETWORK..."
# Deploy and capture ID.
CONTRACT_ID=$(stellar contract deploy --wasm target/wasm32v1-none/release/realflow.wasm --source $IDENTITY --network $NETWORK)
echo "✅ Contract Deployed with ID: $CONTRACT_ID"

echo "🔗 Generating TypeScript Bindings..."
stellar contract bindings typescript --wasm target/wasm32v1-none/release/realflow.wasm --output-dir packages/realflow --overwrite

echo "📦 Building Frontend Package..."
cd packages/realflow
pnpm install
pnpm run build
cd ../..

echo "🎉 Done! RealFlow is ready on $NETWORK."
echo "⚠️  IMPORTANT: Please update the CONTRACT_ID in 'src/pages/RealFlow.tsx' with the new ID:"
echo "👉 $CONTRACT_ID"
