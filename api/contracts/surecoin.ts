import {
  getContract,
  GetContractReturnType,
  PublicClient,
  WalletClient,
} from "viem";
import evmConfig from "../../evmConfig";
import evm from "../evm";

const surecoin: GetContractReturnType<
  typeof evmConfig.surecoin.abi,
  WalletClient
> = getContract({
  abi: evmConfig.surecoin.abi,
  address: evmConfig.surecoin.address,
  client: evm.client,
});

export default surecoin;
