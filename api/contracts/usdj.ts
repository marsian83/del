import { getContract } from "viem";
import evmConfig from "../../evmConfig";
import evm from "../evm";

const usdj = getContract({
  client: evm.client,
  abi: evmConfig.usdj.abi,
  address: evmConfig.usdj.address,
});

export default usdj;
