import {
  Address,
  createWalletClient,
  defineChain,
  getContract,
  Hash,
  http,
  isHash,
  publicActions,
  zeroAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import JustInsureInterface from "../artifacts/JustInsureInterface.sol/JustInsureInterface.json";
import InsuranceController from "../artifacts/InsuranceController.sol/InsuranceController.json";
import SureCoin from "../artifacts/SureCoin.sol/SureCoin.json";
import Vault from "../artifacts/Vault.sol/Vault.json";
import USDJ from "../artifacts/USDJ.sol/USDJ.json";
import fs from "fs";

const donau = defineChain({
  id: 1029,
  rpcUrls: {
    default: {
      http: ["https://pre-rpc.bt.io"],
      webSocket: ["wss://pre-rpc.bt.io:8546"],
    },
  },
  iconUrl: "/icons/bttc.png",
  name: "BitTorrent Chain Donau",
  nativeCurrency: { symbol: "BTT", decimals: 18, name: "BitTorrent (BTT)" },
});

async function main() {
  if (!process.env.OWNER_PVT_KEY || !isHash(process.env.OWNER_PVT_KEY))
    throw "missing pvt key";

  const client = createWalletClient({
    transport: http(),
    account: privateKeyToAccount(process.env.OWNER_PVT_KEY),
    chain: donau,
  }).extend(publicActions);

  async function tx(txn: Promise<Hash>) {
    return await client.waitForTransactionReceipt({ hash: await txn });
  }
  const usdjTx = await tx(
    client.deployContract({
      abi: USDJ.abi,
      bytecode: USDJ.bytecode as "0x",
    }),
  );
  const usdj = getContract({
    abi: USDJ.abi,
    address: usdjTx.contractAddress || zeroAddress,
    client: client,
  });

  const usdjDecimals = BigInt(Math.pow(10, 6));

  await tx(
    usdj.write.transfer(
      ["0x5dE36d74D5A8497a18Ed5B495A870e583b83B7da", 100_000_000_000n], // Riya
    ),
  );

  await tx(
    usdj.write.transfer(
      ["0xAA1bfB4D4eCDbc78A6f929D829fded3710D070D0", 100_000_000_000n], // Kartik
    ),
  );

  const peripheryTx = await tx(
    client.deployContract({
      abi: JustInsureInterface.abi,
      bytecode: JustInsureInterface.bytecode as "0x",
      args: [usdj.address],
    }),
  );
  const periphery = getContract({
    abi: JustInsureInterface.abi,
    address: peripheryTx.contractAddress || zeroAddress,
    client: client,
  });

  // await tx(periphery.write.updateStakingRewardRate([100_000_000n]));
  await tx(periphery.write.setMinimumInitialStake([10n * usdjDecimals]));

  const vaultAddress = (await periphery.read.vault()) as Address;
  const surecoinAddress = (await periphery.read.surecoin()) as Address;

  console.log(`USDJ : ${usdj.address}`);
  console.log(`Surity Interface : ${periphery.address}`);
  console.log(`Vault : ${vaultAddress}`);
  console.log(`SureCoin : ${surecoinAddress}`);

  // update evmConfig
  const chain = {
    id: client.chain.id,
    name: client.chain.name,
    iconUrl: client.chain.iconUrl,
    nativeCurrency: client.chain.nativeCurrency,
    rpcUrls: client.chain.rpcUrls,
    blockExplorers: client.chain.blockExplorers,
  };
  const file = `import {defineChain} from "viem"

const primaryChain = defineChain(${JSON.stringify(chain)})

const justinsureInterface = {address : "${periphery.address}" as const, abi : ${JSON.stringify(periphery.abi)} as const}
const surecoin = {address : "${surecoinAddress}" as const, abi : ${JSON.stringify(SureCoin.abi)} as const}
const vault = {address : "${vaultAddress}" as const, abi : ${JSON.stringify(Vault.abi)} as const}
const usdj = {address : "${usdj.address}" as const, abi : ${JSON.stringify(usdj.abi)} as const}
const insuranceController = {abi : ${JSON.stringify(InsuranceController.abi)} as const}

export default {primaryChain, justinsureInterface, surecoin, vault, usdj, insuranceController}
`;

  fs.writeFileSync("./evmConfig.ts", file);
  console.log("\n\nUPDATED EVM CONFIG");
}

main()
  .then(() => {
    console.log("\nDONE");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
