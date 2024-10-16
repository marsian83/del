import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-viem";
import crypto from "crypto";
import "dotenv/config";

function getRandomKeys() {
  return Array.from(
    { length: 10 },
    () => "0x" + crypto.randomBytes(32).toString("hex"),
  );
}

const config: HardhatUserConfig = {
  solidity: { version: "0.8.27", settings: { optimizer: { enabled: true } } },
  networks: {
    donau: {
      url: "https://pre-rpc.bt.io",
      accounts: [`${process.env.OWNER_PVT_KEY}`, ...getRandomKeys()],
    },
    opt: {
      url: "https://sepolia.optimism.io",
      chainId: 11155420,
      mining: { interval: 60_000 },
      accounts: [`${process.env.OWNER_PVT_KEY}`, ...getRandomKeys()],
    },
  },
  paths: {
    root: "./contracts",
    sources: ".",
  },
};

export default config;
