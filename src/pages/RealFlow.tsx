import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Text,
  Button,
  Input,
  Card,
  Notification,
} from "@stellar/design-system";
import * as RealFlow from "../../packages/realflow";
import { useWallet } from "../hooks/useWallet";
import { networkPassphrase, rpcUrl } from "../contracts/util";

// Contract ID and Network (Testnet)
const CONTRACT_ID = "CDTZ6UJLJLATUXXZVFTMLBWT7U26KGG6TAPKN2Q3V6O476CKXSI27523";
const TREASURY_ADDRESS =
  "GAYAZERYFJDPIHQYS25BVN6XLUTZ6POUJKYGLB33ER25VFXLJZGYQFQ3";

const RealFlowPage: React.FC = () => {
  const { address, signTransaction } = useWallet();
  const [totalProduction, setTotalProduction] = useState<bigint>(0n);
  const [totalSupply, setTotalSupply] = useState<bigint>(0n);
  const [treasuryBalance, setTreasuryBalance] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forms State
  const [prodType, setProdType] = useState("");
  const [prodQuantity, setProdQuantity] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodExpiration, setProdExpiration] = useState("");

  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferTaxRate, setTransferTaxRate] = useState("");

  const [burnAmount, setBurnAmount] = useState("");

  const client = React.useMemo(
    () =>
      new RealFlow.Client({
        networkPassphrase: networkPassphrase,
        contractId: CONTRACT_ID,
        rpcUrl: rpcUrl,
        allowHttp: true,
        publicKey: address,
      }),
    [address],
  );

  const fetchData = useCallback(async () => {
    try {
      // Generated client methods return AssembledTransaction<T>
      const prodTx = await client.get_total_production();
      const supplyTx = await client.get_total_supply();
      const treasuryTx = await client.get_balance({
        address: TREASURY_ADDRESS,
      });

      // simulate() zaten sonucu T tipine (burada bigint) çevirip dönüyor
      const prodSim = await prodTx.simulate();
      const supplySim = await supplyTx.simulate();
      const treasurySim = await treasuryTx.simulate();

      setTotalProduction(prodSim.result);
      setTotalSupply(supplySim.result);
      setTreasuryBalance(treasurySim.result);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [client]);

  useEffect(() => {
    void fetchData();
    const interval = setInterval(() => {
      void fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRegisterProduction = async () => {
    if (!address) return setError("Please connect wallet");
    setLoading(true);
    setError(null);
    try {
      const tx = await client.register_production(
        {
          product_type: prodType,
          quantity: BigInt(prodQuantity),
          price_per_unit: BigInt(prodPrice),
          expiration_ledger: Number(prodExpiration),
        },
        {
          fee: 10000,
        },
      );

      await tx.signAndSend({
        signTransaction: async (x) => {
          const signed = await signTransaction(x);
          return signed;
        },
      });

      await fetchData();
      setProdType("");
      setProdQuantity("");
      setProdPrice("");
      setProdExpiration("");
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Transaction failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    if (!address) return setError("Please connect wallet");
    setLoading(true);
    setError(null);
    try {
      const tx = await client.check_and_mint({
        fee: 10000,
      });

      await tx.signAndSend({
        signTransaction: async (x) => {
          const signed = await signTransaction(x);
          return signed;
        },
      });

      await fetchData();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Transaction failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!address) return setError("Please connect wallet");
    setLoading(true);
    setError(null);
    try {
      const amount = BigInt(transferAmount);
      const rate = BigInt(transferTaxRate);
      const taxAmount = (amount * rate) / 100n;

      const tx = await client.transfer_with_tax(
        {
          from: address,
          to: transferTo,
          amount: amount,
          tax: taxAmount,
        },
        {
          fee: 10000,
        },
      );

      await tx.signAndSend({
        signTransaction: async (x) => {
          const signed = await signTransaction(x);
          return signed;
        },
      });

      await fetchData();
      setTransferTo("");
      setTransferAmount("");
      setTransferTaxRate("");
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Transaction failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBurn = async () => {
    if (!address) return setError("Please connect wallet");
    setLoading(true);
    setError(null);
    try {
      const tx = await client.burn_rotting_assets(
        {
          value_lost: BigInt(burnAmount),
        },
        {
          fee: 10000,
        },
      );

      await tx.signAndSend({
        signTransaction: async (x) => {
          const signed = await signTransaction(x);
          return signed;
        },
      });

      await fetchData();
      setBurnAmount("");
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Transaction failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    if (!address) return setError("Please connect wallet");
    setLoading(true);
    setError(null);
    try {
      const tx = await client.initialize({
        treasury: TREASURY_ADDRESS,
        distribution_pool: address,
      });

      await tx.signAndSend({
        signTransaction: async (x) => {
          const signed = await signTransaction(x);
          return signed;
        },
      });

      await fetchData();
      // Reset local state as contract resets them
      setTotalProduction(0n);
      setTotalSupply(0n);
      setTreasuryBalance(0n);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Transaction failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout.Content>
      <Layout.Inset>
        <Text as="h1" size="xl">
          RealFlow Economy Dashboard
        </Text>

        {error && (
          <Notification variant="error" title="Error">
            {error}
          </Notification>
        )}

        <div style={{ marginBottom: "20px" }}>
          <Card>
            <div
              style={{
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Text as="h3" size="lg">
                  System Setup
                </Text>
                <Text
                  as="div"
                  size="xs"
                  style={{
                    display: "block",
                    margin: "5px 0",
                    wordBreak: "break-all",
                    fontFamily: "monospace",
                  }}
                >
                  {CONTRACT_ID}
                </Text>
                <Text as="p" size="sm">
                  Initialize the contract if you see "UnreachableCodeReached"
                  error. (Resets data)
                </Text>
              </div>
              <Button
                size="md"
                variant="secondary"
                onClick={() => {
                  void handleInitialize();
                }}
                disabled={loading || !address}
                isLoading={loading}
              >
                Initialize Contract
              </Button>
            </div>
          </Card>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <Card>
            <div style={{ padding: "20px" }}>
              <Text as="h3" size="lg">
                Total Production Value
              </Text>
              <Text
                as="h1"
                size="xl"
                style={{ color: "var(--pal-success-40)" }}
              >
                {totalProduction.toString()}
              </Text>
            </div>
          </Card>
          <Card>
            <div style={{ padding: "20px" }}>
              <Text as="h3" size="lg">
                Total Money Supply
              </Text>
              <Text as="h1" size="xl" style={{ color: "var(--pal-brand-40)" }}>
                {totalSupply.toString()}
              </Text>
            </div>
          </Card>
          <Card>
            <div style={{ padding: "20px" }}>
              <Text as="h3" size="lg">
                Treasury Balance (Tax)
              </Text>
              <Text
                as="h1"
                size="xl"
                style={{ color: "var(--pal-warning-40)" }}
              >
                {treasuryBalance.toString()}
              </Text>
            </div>
          </Card>
        </div>

        <div style={{ display: "grid", gap: "40px" }}>
          {/* Production Registration */}
          <Card>
            <div style={{ padding: "20px" }}>
              <Text as="h3" size="lg" style={{ marginBottom: "20px" }}>
                Register Production (Oracle)
              </Text>
              <div style={{ display: "grid", gap: "10px" }}>
                <Input
                  fieldSize="md"
                  id="prod-type"
                  label="Product Type (Symbol)"
                  value={prodType}
                  onChange={(e) => setProdType(e.target.value)}
                  placeholder="e.g. CORN"
                />
                <Input
                  fieldSize="md"
                  id="prod-qty"
                  label="Quantity"
                  type="number"
                  value={prodQuantity}
                  onChange={(e) => setProdQuantity(e.target.value)}
                />
                <Input
                  fieldSize="md"
                  id="prod-price"
                  label="Price per Unit"
                  type="number"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                />
                <Input
                  fieldSize="md"
                  id="prod-exp"
                  label="Expiration Ledger (Current + TTL)"
                  type="number"
                  value={prodExpiration}
                  onChange={(e) => setProdExpiration(e.target.value)}
                  placeholder="e.g. 100000"
                />
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => {
                    void handleRegisterProduction();
                  }}
                  disabled={loading || !address}
                  isLoading={loading}
                >
                  Register Production
                </Button>
              </div>
            </div>
          </Card>

          {/* Minting */}
          <Card>
            <div style={{ padding: "20px" }}>
              <Text as="h3" size="lg" style={{ marginBottom: "20px" }}>
                Monetary Policy
              </Text>
              <Text as="p" size="md">
                Check supply/demand gap and mint new tokens if needed.
              </Text>
              <Button
                size="md"
                variant="secondary"
                onClick={() => {
                  void handleMint();
                }}
                disabled={loading || !address}
                isLoading={loading}
                style={{ marginTop: "10px" }}
              >
                Check & Mint (Seigniorage)
              </Button>
            </div>
          </Card>

          {/* Transfer */}
          <Card>
            <div style={{ padding: "20px" }}>
              <Text as="h3" size="lg" style={{ marginBottom: "20px" }}>
                Transfer with Tax
              </Text>
              <div style={{ display: "grid", gap: "10px" }}>
                <Input
                  fieldSize="md"
                  id="trans-to"
                  label="To Address"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                />
                <Input
                  fieldSize="md"
                  id="trans-amt"
                  label="Amount"
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
                <Input
                  fieldSize="md"
                  id="trans-tax"
                  label="Tax Rate (%)"
                  type="number"
                  value={transferTaxRate}
                  onChange={(e) => setTransferTaxRate(e.target.value)}
                  placeholder="e.g. 10 for 10%"
                />
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => {
                    void handleTransfer();
                  }}
                  disabled={loading || !address}
                  isLoading={loading}
                >
                  Send Transaction
                </Button>
              </div>
            </div>
          </Card>

          {/* Burn */}
          <Card>
            <div style={{ padding: "20px" }}>
              <Text as="h3" size="lg" style={{ marginBottom: "20px" }}>
                Burn Rotting Assets
              </Text>
              <div style={{ display: "grid", gap: "10px" }}>
                <Input
                  fieldSize="md"
                  id="burn-amt"
                  label="Value Lost"
                  type="number"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                />
                <Button
                  size="md"
                  variant="destructive"
                  onClick={() => {
                    void handleBurn();
                  }}
                  disabled={loading || !address}
                  isLoading={loading}
                >
                  Burn Assets
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Layout.Inset>
    </Layout.Content>
  );
};

export default RealFlowPage;
