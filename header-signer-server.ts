import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import { Wallet } from "ethers";
import { configDotenv } from "dotenv";
import { randomBytes } from "crypto";

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
  data = "{}"
): MethodBasedValidation["params"] => ({
  addr: address,
  method: `${AuthMethod.Standard}`,
  msg: "Please sign this message",
  nonce: randomBytes(32).toString("base64"),
  ts: Date.now().toString(),
  hash: keccak256(toUtf8Bytes(data)),
});

const authHeaders = async (wallet: Wallet) => {
  const params = authParams(wallet.address.toLowerCase());
  const msg = recreateMessage(params);
  const signature = await wallet.signMessage(toUtf8Bytes(msg));

  return {
    [PARAMS_HEADER_NAME]: Buffer.from(JSON.stringify(params)).toString(
      "base64"
    ),
    [SIG_HEADER_NAME]: Buffer.from(signature.slice(2), "hex").toString(
      "base64"
    ),
  };
};

configDotenv();
const mnemonic = process.env.MNEMONIC;
const wallet = Wallet.fromMnemonic(mnemonic);

const express = require("express");
const app = express();
const port = 1234;

app.get("/", async (req, res) => {
  const headers = await authHeaders(wallet);
  res.json(headers);
});

app.listen(port, () => {
  console.log(`Signer app listening on port ${port}`);
});
