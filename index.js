const { prepareBodyWithSign } = require("@guildxyz/sdk");
const { Wallet } = require("ethers");

require("dotenv").config();

const wallet = Wallet.fromMnemonic(process.env.MNEMONIC);

console.log("payload:");
console.log(process.argv[2]);
const payload = JSON.parse(process.argv[2]);

(async () => {
  console.log("result:");
  console.log(
    await prepareBodyWithSign(
      wallet.address,
      (signableMessage) => wallet.signMessage(signableMessage),
      payload
    )
  );
})();
