/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

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
const CONTRACT_ID = "CBCLO4SPZ3IW6QUUGEDFSOVKGE2FEU74VXV6T62BRYE45PMYFDJL6RYR";
const TREASURY_ADDRESS =
  "GAYAZERYFJDPIHQYS25BVN6XLUTZ6POUJKYGLB33ER25VFXLJZGYQFQ3";

const RealFlowPage: React.FC = () => {
  const { address, signTransaction } = useWallet();
  const [totalProduction, setTotalProduction] = useState<bigint>(0n);
  const [totalSupply, setTotalSupply] = useState<bigint>(0n);
  const [treasuryBalance, setTreasuryBalance] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- ÜRÜN LİSTESİ ---
  const PRODUCTS = [
    { symbol: "Cay", tokenPrice: 25 },
    { symbol: "Findik", tokenPrice: 200 },
    { symbol: "Misir", tokenPrice: 11 },
  ];

  const [prodType, setProdType] = useState(PRODUCTS[0].symbol);
  const [prodQuantity, setProdQuantity] = useState("");
  const [prodDate, setProdDate] = useState("");

  // Seçilen ürünün fiyatını otomatik bul
  const selectedProduct =
    PRODUCTS.find((p) => p.symbol === prodType) || PRODUCTS[0];

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

  // --- GÜVENLİ LEDGER ÇEKME ---
  const getCurrentLedger = async () => {
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getLatestLedger",
          params: [],
        }),
      });

      if (!response.ok) throw new Error("Ağ hatası");
      const data = await response.json();

      if (!data.result || !data.result.sequence) return 900000;

      return Number(data.result.sequence);
    } catch (e) {
      console.warn("Ledger çekilemedi, varsayılan kullanılıyor:", e);
      return 900000;
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const prodTx = await client.get_total_production();
      const supplyTx = await client.get_total_supply();
      const treasuryTx = await client.get_balance({
        address: TREASURY_ADDRESS,
      });

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

  // --- DÜZELTİLMİŞ KAYIT FONKSİYONU ---
  const handleRegisterProduction = async () => {
    if (!address) return setError("Lütfen cüzdan bağlayın");
    if (!prodDate) return setError("Lütfen bir tarih seçin");

    if (!prodQuantity || Number(prodQuantity) <= 0)
      return setError("Geçerli bir miktar girin");

    setLoading(true);
    setError(null);
    try {
      const currentLedger = await getCurrentLedger();

      const targetTime = new Date(prodDate).getTime();
      const currentTime = new Date().getTime();
      const diffSeconds = (targetTime - currentTime) / 1000;

      if (diffSeconds < 0) throw new Error("Geçmiş tarih seçemezsiniz!");

      const ledgersToAdd = Math.floor(diffSeconds / 5);
      const finalExpirationLedger =
        Number(currentLedger) + Number(ledgersToAdd);

      console.log(
        `Gönderiliyor -> Tür: ${prodType}, Miktar: ${prodQuantity}, Fiyat: ${selectedProduct.tokenPrice}, Ledger: ${finalExpirationLedger}`,
      );

      const tx = await client.register_production(
        {
          product_type: prodType,
          token_quantity: BigInt(prodQuantity),
          token_price: BigInt(selectedProduct.tokenPrice),
          expiration_ledger: finalExpirationLedger,
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
      setProdType(PRODUCTS[0].symbol);
      setProdQuantity("");
      setProdDate("");
      setError(null);
    } catch (err: unknown) {
      console.error("HATA DETAYI:", err);
      if (err instanceof Error) {
        setError(
          err.message.includes("InvalidInput")
            ? "Veri Hatası: Lütfen tüm alanları (özellikle Fiyatı) sayı olarak girin."
            : err.message,
        );
      } else {
        setError("İşlem Başarısız oldu.");
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
          FNDK Fındık Borsası
        </Text>

        {error && (
          <Notification variant="error" title="Hata">
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
                  Sistem Kurulumu
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
                  Sistemi başlatmak için tıklayın (Verileri sıfırlar!)
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
                Sistemi Başlat (Initialize)
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
                Lisanslı Depo Rezervi (RWA)
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
                Dolaşımdaki FNDK Token
              </Text>
              <Text as="h1" size="xl" style={{ color: "var(--pal-brand-40)" }}>
                {totalSupply.toString()}
              </Text>
            </div>
          </Card>
          <Card>
            <div style={{ padding: "20px" }}>
              <Text as="h3" size="lg">
                Güvence Fonu (Senyoraj)
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
                Ürün Girişi & Tokenizasyon (Oracle)
              </Text>
              <div style={{ display: "grid", gap: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <label
                    htmlFor="prod-type"
                    style={{ fontSize: "0.875rem", fontWeight: 500 }}
                  >
                    Ürün Tipi (Sembol)
                  </label>
                  <select
                    id="prod-type"
                    value={prodType}
                    onChange={(e) => setProdType(e.target.value)}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "0.25rem",
                      color: "var(--pal-text-primary)",
                    }}
                  >
                    {PRODUCTS.map((p) => (
                      <option key={p.symbol} value={p.symbol}>
                        {p.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  fieldSize="md"
                  id="prod-price"
                  label="Token Fiyatı (Sabit)"
                  value={selectedProduct.tokenPrice.toString()}
                  readOnly
                  disabled
                />

                <Input
                  fieldSize="md"
                  id="prod-qty"
                  label="Token Miktarı"
                  type="number"
                  value={prodQuantity}
                  onChange={(e) => setProdQuantity(e.target.value)}
                />

                <Input
                  fieldSize="md"
                  id="prod-date"
                  label="Son Kullanma Tarihi (Vade)"
                  type="date"
                  value={prodDate}
                  onChange={(e) => setProdDate(e.target.value)}
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
                  Ürünü Kaydet (FNDK Bas)
                </Button>
              </div>
            </div>
          </Card>

          {/* Minting */}
          <Card>
            <div style={{ padding: "20px" }}>
              <Text as="h3" size="lg" style={{ marginBottom: "20px" }}>
                Para Politikası
              </Text>
              <Text as="p" size="md">
                Arz/Talep dengesini kontrol et ve gerekirse ek token bas.
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
                Kontrol Et & Bas (Senyoraj)
              </Button>
            </div>
          </Card>

          {/* Transfer */}
          <Card>
            <div style={{ padding: "20px" }}>
              <Text as="h3" size="lg" style={{ marginBottom: "20px" }}>
                Vergili Transfer (Ticaret)
              </Text>
              <div style={{ display: "grid", gap: "10px" }}>
                <Input
                  fieldSize="md"
                  id="trans-to"
                  label="Alıcı Adresi"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                />
                <Input
                  fieldSize="md"
                  id="trans-amt"
                  label="Miktar"
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
                <Input
                  fieldSize="md"
                  id="trans-tax"
                  label="Vergi Oranı (%)"
                  type="number"
                  value={transferTaxRate}
                  onChange={(e) => setTransferTaxRate(e.target.value)}
                  placeholder="Örn: 10"
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
                  Transfer Et
                </Button>
              </div>
            </div>
          </Card>

          {/* Burn */}
          <Card>
            <div style={{ padding: "20px" }}>
              <Text as="h3" size="lg" style={{ marginBottom: "20px" }}>
                Çürüyen Varlıkları Yak (Burn)
              </Text>
              <div style={{ display: "grid", gap: "10px" }}>
                <Input
                  fieldSize="md"
                  id="burn-amt"
                  label="Kaybedilen Değer"
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
                  Varlıkları Yak
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
