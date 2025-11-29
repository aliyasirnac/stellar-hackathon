import { Buffer } from "buffer";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
} from "@stellar/stellar-sdk/contract";
import type { u32, i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * 1. BAŞLATMA: Hazine ve Dağıtım Havuzu adreslerini ayarlar.
   */
  initialize: (
    {
      treasury,
      distribution_pool,
    }: {
      treasury: string;
      distribution_pool: string;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;
  /**
   * Construct and simulate a register_production transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * 2. ORACLE FONKSİYONU: Üretimi Sisteme Girer.
   * Burası "Mısır, 10 Ton, 100 Token" verisinin girildiği yerdir.
   * Sadece miktar değil, DEĞER (Fiyat * Miktar) hesaplar.
   * MEM GÜNCELLEMESİ: expiration_ledger parametresi eklendi.
   */
  register_production: (
    {
      product_type,
      token_quantity,
      expiration_ledger,
    }: {
      product_type: string;
      token_quantity: i128;
      expiration_ledger: u32;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;
  /**
   * Construct and simulate a check_and_mint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * 3. YENİ PARA DENKLEMİ (CORE LOGIC)
   * Arz > Talep ise Para Bas (Senyoraj).
   * Bu fonksiyon "Dengeleyici"dir.
   */
  check_and_mint: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;
    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;
    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>;
  /**
   * Construct and simulate a burn_rotting_assets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * 4. KAOS YÖNETİMİ: "Çürüme / Stok İmha"
   * Eğer domates satılamaz ve çürürse, piyasadaki karşılığı olmayan parayı yakar.
   * Bu fonksiyon "Deflasyon/Enflasyon Dengeleyicisi"dir.
   */
  burn_rotting_assets: (
    {
      value_lost,
    }: {
      value_lost: i128;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;
  /**
   * Construct and simulate a transfer_with_tax transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * 5. PARANIN HIZI: Vergilendirilmiş Transfer
   * MEM: "Para döndükçe devlet kazanır."
   * Normal transfer yerine bu kullanılır. %10 komisyon keser.
   */
  transfer_with_tax: (
    {
      from,
      to,
      amount,
      tax,
    }: {
      from: string;
      to: string;
      amount: i128;
      tax: i128;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;
  /**
   * Construct and simulate a get_balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_balance: (
    {
      address,
    }: {
      address: string;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<i128>>;
  /**
   * Construct and simulate a get_total_production transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_total_production: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;
    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;
    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>;
  /**
   * Construct and simulate a get_total_supply transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_total_supply: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;
    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;
    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>;
}
export declare class Client extends ContractClient {
  readonly options: ContractClientOptions;
  static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      },
  ): Promise<AssembledTransaction<T>>;
  constructor(options: ContractClientOptions);
  readonly fromJSON: {
    initialize: (json: string) => AssembledTransaction<null>;
    register_production: (json: string) => AssembledTransaction<null>;
    check_and_mint: (json: string) => AssembledTransaction<bigint>;
    burn_rotting_assets: (json: string) => AssembledTransaction<null>;
    transfer_with_tax: (json: string) => AssembledTransaction<null>;
    get_balance: (json: string) => AssembledTransaction<bigint>;
    get_total_production: (json: string) => AssembledTransaction<bigint>;
    get_total_supply: (json: string) => AssembledTransaction<bigint>;
  };
}
