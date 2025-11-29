import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

export const networks = {
  standalone: {
    networkPassphrase: "Standalone Network ; February 2017",
    contractId: "CAUAWQ63NVTJWD7UF5BVNWWQJDUFCAS4VBZLJLSMMJ2FQMBLLMLF6WEW",
  },
} as const;

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * 1. BAŞLATMA: Hazine ve Dağıtım Havuzu adreslerini ayarlar.
   */
  initialize: (
    {
      treasury,
      distribution_pool,
    }: { treasury: string; distribution_pool: string },
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
      token_price,
      expiration_ledger,
    }: {
      product_type: string;
      token_quantity: i128;
      token_price: i128;
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
    { value_lost }: { value_lost: i128 },
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
    }: { from: string; to: string; amount: i128; tax: i128 },
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
    { address }: { address: string },
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
export class Client extends ContractClient {
  static async deploy<T = Client>(
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
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAABQAAAAAAAAAAAAAAFFByb2R1Y3Rpb25BZGRlZEV2ZW50AAAAAQAAABZwcm9kdWN0aW9uX2FkZGVkX2V2ZW50AAAAAAACAAAAAAAAAAxwcm9kdWN0X3R5cGUAAAARAAAAAAAAAAAAAAAFdmFsdWUAAAAAAAALAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAC01pbnRlZEV2ZW50AAAAAAEAAAAMbWludGVkX2V2ZW50AAAAAQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAC0J1cm5lZEV2ZW50AAAAAAEAAAAMYnVybmVkX2V2ZW50AAAAAQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAGFRyYW5zYWN0aW9uVmVsb2NpdHlFdmVudAAAAAEAAAAadHJhbnNhY3Rpb25fdmVsb2NpdHlfZXZlbnQAAAAAAAEAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAAE0hvdFRva2VuTWludGVkRXZlbnQAAAAAAQAAABZob3RfdG9rZW5fbWludGVkX2V2ZW50AAAAAAADAAAAAAAAAAxwcm9kdWN0X3R5cGUAAAARAAAAAAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAAAAAARZXhwaXJhdGlvbl9sZWRnZXIAAAAAAAAEAAAAAAAAAAI=",
        "AAAAAAAAAD4xLiBCQcWeTEFUTUE6IEhhemluZSB2ZSBEYcSfxLF0xLFtIEhhdnV6dSBhZHJlc2xlcmluaSBheWFybGFyLgAAAAAACmluaXRpYWxpemUAAAAAAAIAAAAAAAAACHRyZWFzdXJ5AAAAEwAAAAAAAAARZGlzdHJpYnV0aW9uX3Bvb2wAAAAAAAATAAAAAA==",
        "AAAAAAAAAOMyLiBPUkFDTEUgRk9OS1PEsFlPTlU6IMOccmV0aW1pIFNpc3RlbWUgR2lyZXIuCkJ1cmFzxLEgIk3EsXPEsXIsIDEwIFRvbiwgMTAwIFRva2VuIiB2ZXJpc2luaW4gZ2lyaWxkacSfaSB5ZXJkaXIuClNhZGVjZSBtaWt0YXIgZGXEn2lsLCBERcSeRVIgKEZpeWF0ICogTWlrdGFyKSBoZXNhcGxhci4KTUVNIEfDnE5DRUxMRU1FU8SwOiBleHBpcmF0aW9uX2xlZGdlciBwYXJhbWV0cmVzaSBla2xlbmRpLgAAAAATcmVnaXN0ZXJfcHJvZHVjdGlvbgAAAAAEAAAAAAAAAAxwcm9kdWN0X3R5cGUAAAARAAAAAAAAAA50b2tlbl9xdWFudGl0eQAAAAAACwAAAAAAAAALdG9rZW5fcHJpY2UAAAAACwAAAAAAAAARZXhwaXJhdGlvbl9sZWRnZXIAAAAAAAAEAAAAAA==",
        "AAAAAAAAAGgzLiBZRU7EsCBQQVJBIERFTktMRU3EsCAoQ09SRSBMT0dJQykKQXJ6ID4gVGFsZXAgaXNlIFBhcmEgQmFzIChTZW55b3JhaikuCkJ1IGZvbmtzaXlvbiAiRGVuZ2VsZXlpY2kiZGlyLgAAAA5jaGVja19hbmRfbWludAAAAAAAAAAAAAEAAAAL",
        "AAAAAAAAALs0LiBLQU9TIFnDlk5FVMSwTcSwOiAiw4fDvHLDvG1lIC8gU3RvayDEsG1oYSIKRcSfZXIgZG9tYXRlcyBzYXTEsWxhbWF6IHZlIMOnw7xyw7xyc2UsIHBpeWFzYWRha2kga2FyxZ/EsWzEscSfxLEgb2xtYXlhbiBwYXJhecSxIHlha2FyLgpCdSBmb25rc2l5b24gIkRlZmxhc3lvbi9FbmZsYXN5b24gRGVuZ2VsZXlpY2lzaSJkaXIuAAAAABNidXJuX3JvdHRpbmdfYXNzZXRzAAAAAAEAAAAAAAAACnZhbHVlX2xvc3QAAAAAAAsAAAAA",
        "AAAAAAAAAJA1LiBQQVJBTklOIEhJWkk6IFZlcmdpbGVuZGlyaWxtacWfIFRyYW5zZmVyCk1FTTogIlBhcmEgZMO2bmTDvGvDp2UgZGV2bGV0IGthemFuxLFyLiIKTm9ybWFsIHRyYW5zZmVyIHllcmluZSBidSBrdWxsYW7EsWzEsXIuICUxMCBrb21pc3lvbiBrZXNlci4AAAARdHJhbnNmZXJfd2l0aF90YXgAAAAAAAAEAAAAAAAAAARmcm9tAAAAEwAAAAAAAAACdG8AAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAADdGF4AAAAAAsAAAAA",
        "AAAAAAAAAAAAAAALZ2V0X2JhbGFuY2UAAAAAAQAAAAAAAAAHYWRkcmVzcwAAAAATAAAAAQAAAAs=",
        "AAAAAAAAAAAAAAAUZ2V0X3RvdGFsX3Byb2R1Y3Rpb24AAAAAAAAAAQAAAAs=",
        "AAAAAAAAAAAAAAAQZ2V0X3RvdGFsX3N1cHBseQAAAAAAAAABAAAACw==",
      ]),
      options,
    );
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
    register_production: this.txFromJSON<null>,
    check_and_mint: this.txFromJSON<i128>,
    burn_rotting_assets: this.txFromJSON<null>,
    transfer_with_tax: this.txFromJSON<null>,
    get_balance: this.txFromJSON<i128>,
    get_total_production: this.txFromJSON<i128>,
    get_total_supply: this.txFromJSON<i128>,
  };
}
