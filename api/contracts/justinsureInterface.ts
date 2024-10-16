import { getContract } from "viem";
import evmConfig from "../../evmConfig";
import evm from "../evm";

const justinsureInterface = getContract({
  client: evm.client,
  abi: evmConfig.justinsureInterface.abi,
  address: evmConfig.justinsureInterface.address,
});

export default justinsureInterface;
