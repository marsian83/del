import { createWalletClient, http, publicActions } from "viem";
import evmConfig from "../evmConfig";
import { privateKeyToAccount } from "viem/accounts";

const client = createWalletClient({
  chain: evmConfig.primaryChain,
  account: privateKeyToAccount(process.env.SERVER_PRIVATE_KEY as "0x"),
  transport: http(evmConfig.primaryChain.rpcUrls.default.http[0]),
}).extend(publicActions);

export default { client };
