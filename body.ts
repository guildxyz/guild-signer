import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import { Wallet } from "ethers";

const PARAMS_HEADER_NAME = "x-guild-params";
const SIG_HEADER_NAME = "x-guild-sig";

enum AuthMethod {
  Standard = 1,
  KeyPair,
  EIP1271,
}

type MethodBasedValidation = {
  params: {
    method: `${AuthMethod}`;
    addr: string;
    nonce: string;
    hash?: string;
    msg: string;
    chainId?: string;
    ts: string;
  };
  sig: string;
};

const recreateMessage = ({
  addr,
  chainId,
  method,
  msg,
  nonce,
  ts,
  hash,
}: MethodBasedValidation["params"]) =>
  `${msg}\n\nAddress: ${addr}\nMethod: ${method}${
    chainId ? `\nChainId: ${chainId}` : ""
  }${hash ? `\nHash: ${hash}` : ""}\nNonce: ${nonce}\nTimestamp: ${ts}`;

const authParams = (
  address: string,
  data = "{}",
): MethodBasedValidation["params"] => ({
  addr: address,
  method: `${AuthMethod.Standard}`,
  msg: "Please sign this message",
  // @ts-ignore
  nonce: CryptoJS.lib.WordArray.random(32).toString(),
  ts: Date.now().toString(),
  hash: keccak256(toUtf8Bytes(data)),
});

const signBody = async (wallet: Wallet, data: string) => {
  const params = authParams(wallet.address.toLowerCase(), data);
  const msg = recreateMessage(params);
  const signature = await wallet.signMessage(toUtf8Bytes(msg));

  return {
    payload: data,
    params,
    sig: Buffer.from(signature.slice(2), "hex").toString("base64"),
  };
};

// @ts-ignore
const mnemonic = pm.environment.get("WALLET_MNEMONIC");
// @ts-ignore
const payload = pm.request.body.raw;
signBody(Wallet.fromMnemonic(mnemonic), payload)
  .then((newBody) => {
    // @ts-ignore
    pm.request.body.update({
      mode: "raw",
      raw: JSON.stringify(newBody),
      options: {
        raw: {
          language: "json",
        },
      },
    });
  })
  .catch(console.error);
