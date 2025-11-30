# NutToken 🌰

### RWA Tokenization & Algorithmic Seigniorage Protocol on Stellar

**NutToken** is a DeFi solution built on **Stellar Soroban** that digitizes the **Hazelnut** economy. By leveraging the **National Economy Model (MEM)**, we turn real-world agricultural production into instant liquidity, solving the chronic cash-flow problems of farmers in Turkey (who control 70% of global production).

---

## 📉 The Problem

Turkey dominates the global hazelnut market ($billions in value), yet the local economy suffers from:

- **Illiquidity:** Farmers wait months for payments or sell at a loss to intermediaries.
- **Inflation:** High interest rates destroy profit margins.
- **Waste:** Agricultural assets rot. If they aren't monetized or consumed quickly, value is destroyed forever.

## 💡 The Solution: NutToken Protocol

We utilize the **New Monetary Equation** ($P_S = P_F - P_t$) to create a currency backed 1:1 by real production, not debt.

1.  **Oracle-Verified Production:** Farmers/Co-ops register their harvest on-chain. This becomes the verified **RWA Reserve**.
2.  **Algorithmic Minting:** The protocol calculates the gap between **Production Value** and **Money Supply**. If production is higher, it mints new tokens (**Seigniorage**) to fill the gap without inflation.
3.  **Social Distribution:** Instead of lending money at interest, the protocol injects this new liquidity into a **Distribution Pool** to stimulate demand.
4.  **High Velocity & Tax:** Every transfer includes a dynamic tax sent to the Treasury, ensuring the state/protocol revenues grow as the economy moves.

---

## 🏗 Technical Architecture (Smart Contract)

The logic is implemented in `contracts/realflow/src/lib.rs` using the **Soroban SDK**.

### Core Functions

| Function                  | Description                                                                                          | MEM Concept              |
| :------------------------ | :--------------------------------------------------------------------------------------------------- | :----------------------- |
| **`register_production`** | Registers RWA (Hazelnut) quantity, price, and expiration. Emits `ProductionAddedEvent`.              | **Standard of Value**    |
| **`check_and_mint`**      | Checks if `Total Production > Total Supply`. If true, mints the difference to the Distribution Pool. | **Seigniorage**          |
| **`transfer_with_tax`**   | Transfers tokens between users and automatically sends a tax portion to the Treasury.                | **Velocity of Money**    |
| **`burn_rotting_assets`** | Burns tokens corresponding to spoiled/unsold assets to prevent inflation.                            | **Deflationary Control** |

### Events & Monitoring

The contract emits specific events for the frontend dashboard:

- `HotTokenMintedEvent`: Triggered when assets with short shelf-life (e.g., fresh fish, raw hazelnuts) are registered, signaling a need for fast consumption.
- `TransactionVelocityEvent`: Tracks the economic volume.

---

## 💻 Getting Started

### Prerequisites

- Node.js (v18+)
- Rust & Cargo
- Stellar CLI
- Freighter Wallet Extension

### 1\. Installation

Clone the repo and install dependencies:

```bash
git clone [https://github.com/aliyasirnac/stellar-hackathon](https://github.com/aliyasirnac/stellar-hackathon)
cd stellar-hackathon
pnpm install
```
