import { Buffer } from "buffer";
import {
  Client as ContractClient,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}
export class Client extends ContractClient {
  options;
  static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options,
  ) {
    return ContractClient.deploy(null, options);
  }
  constructor(options) {
    super(
      new ContractSpec([
        "AAAABQAAAAAAAAAAAAAAFFByb2R1Y3Rpb25BZGRlZEV2ZW50AAAAAQAAABZwcm9kdWN0aW9uX2FkZGVkX2V2ZW50AAAAAAACAAAAAAAAAAxwcm9kdWN0X3R5cGUAAAARAAAAAAAAAAAAAAAFdmFsdWUAAAAAAAALAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAC01pbnRlZEV2ZW50AAAAAAEAAAAMbWludGVkX2V2ZW50AAAAAQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAC0J1cm5lZEV2ZW50AAAAAAEAAAAMYnVybmVkX2V2ZW50AAAAAQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAGFRyYW5zYWN0aW9uVmVsb2NpdHlFdmVudAAAAAEAAAAadHJhbnNhY3Rpb25fdmVsb2NpdHlfZXZlbnQAAAAAAAEAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAAE0hvdFRva2VuTWludGVkRXZlbnQAAAAAAQAAABZob3RfdG9rZW5fbWludGVkX2V2ZW50AAAAAAADAAAAAAAAAAxwcm9kdWN0X3R5cGUAAAARAAAAAAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAAAAAARZXhwaXJhdGlvbl9sZWRnZXIAAAAAAAAEAAAAAAAAAAI=",
        "AAAAAAAAAD4xLiBCQcWeTEFUTUE6IEhhemluZSB2ZSBEYcSfxLF0xLFtIEhhdnV6dSBhZHJlc2xlcmluaSBheWFybGFyLgAAAAAACmluaXRpYWxpemUAAAAAAAIAAAAAAAAACHRyZWFzdXJ5AAAAEwAAAAAAAAARZGlzdHJpYnV0aW9uX3Bvb2wAAAAAAAATAAAAAA==",
        "AAAAAAAAAOMyLiBPUkFDTEUgRk9OS1PEsFlPTlU6IMOccmV0aW1pIFNpc3RlbWUgR2lyZXIuCkJ1cmFzxLEgIk3EsXPEsXIsIDEwIFRvbiwgMTAwIFRva2VuIiB2ZXJpc2luaW4gZ2lyaWxkacSfaSB5ZXJkaXIuClNhZGVjZSBtaWt0YXIgZGXEn2lsLCBERcSeRVIgKEZpeWF0ICogTWlrdGFyKSBoZXNhcGxhci4KTUVNIEfDnE5DRUxMRU1FU8SwOiBleHBpcmF0aW9uX2xlZGdlciBwYXJhbWV0cmVzaSBla2xlbmRpLgAAAAATcmVnaXN0ZXJfcHJvZHVjdGlvbgAAAAADAAAAAAAAAAxwcm9kdWN0X3R5cGUAAAARAAAAAAAAAA50b2tlbl9xdWFudGl0eQAAAAAACwAAAAAAAAARZXhwaXJhdGlvbl9sZWRnZXIAAAAAAAAEAAAAAA==",
        "AAAAAAAAAGgzLiBZRU7EsCBQQVJBIERFTktMRU3EsCAoQ09SRSBMT0dJQykKQXJ6ID4gVGFsZXAgaXNlIFBhcmEgQmFzIChTZW55b3JhaikuCkJ1IGZvbmtzaXlvbiAiRGVuZ2VsZXlpY2kiZGlyLgAAAA5jaGVja19hbmRfbWludAAAAAAAAAAAAAEAAAAL",
        "AAAAAAAAALs0LiBLQU9TIFnDlk5FVMSwTcSwOiAiw4fDvHLDvG1lIC8gU3RvayDEsG1oYSIKRcSfZXIgZG9tYXRlcyBzYXTEsWxhbWF6IHZlIMOnw7xyw7xyc2UsIHBpeWFzYWRha2kga2FyxZ/EsWzEscSfxLEgb2xtYXlhbiBwYXJhecSxIHlha2FyLgpCdSBmb25rc2l5b24gIkRlZmxhc3lvbi9FbmZsYXN5b24gRGVuZ2VsZXlpY2lzaSJkaXIuAAAAABNidXJuX3JvdHRpbmdfYXNzZXRzAAAAAAEAAAAAAAAACnZhbHVlX2xvc3QAAAAAAAsAAAAA",
        "AAAAAAAAAJA1LiBQQVJBTklOIEhJWkk6IFZlcmdpbGVuZGlyaWxtacWfIFRyYW5zZmVyCk1FTTogIlBhcmEgZMO2bmTDvGvDp2UgZGV2bGV0IGthemFuxLFyLiIKTm9ybWFsIHRyYW5zZmVyIHllcmluZSBidSBrdWxsYW7EsWzEsXIuICUxMCBrb21pc3lvbiBrZXNlci4AAAARdHJhbnNmZXJfd2l0aF90YXgAAAAAAAAEAAAAAAAAAARmcm9tAAAAEwAAAAAAAAACdG8AAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAADdGF4AAAAAAsAAAAA",
        "AAAAAAAAAAAAAAALZ2V0X2JhbGFuY2UAAAAAAQAAAAAAAAAHYWRkcmVzcwAAAAATAAAAAQAAAAs=",
        "AAAAAAAAAAAAAAAUZ2V0X3RvdGFsX3Byb2R1Y3Rpb24AAAAAAAAAAQAAAAs=",
        "AAAAAAAAAAAAAAAQZ2V0X3RvdGFsX3N1cHBseQAAAAAAAAABAAAACw==",
      ]),
      options,
    );
    this.options = options;
  }
  fromJSON = {
    initialize: this.txFromJSON,
    register_production: this.txFromJSON,
    check_and_mint: this.txFromJSON,
    burn_rotting_assets: this.txFromJSON,
    transfer_with_tax: this.txFromJSON,
    get_balance: this.txFromJSON,
    get_total_production: this.txFromJSON,
    get_total_supply: this.txFromJSON,
  };
}
