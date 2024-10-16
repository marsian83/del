import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import contractDefinitions from "../contracts";
import { UINT256_MAX } from "../config";
import { zeroAddress } from "viem";

type SureCoinHook = {
  allowance: bigint | undefined;
  approve: () => Promise<boolean>;
  getUserBalance: () => number;
  decimals: number | undefined;
  earned: bigint | undefined;
  multiplyWithDecimals: (value: bigint) => bigint;
  divideByDecimals: (value: bigint | number) => number;
  getUserEarned: () => number;
  refreshEarned: () => void;
};

function useSureCoinHook(): SureCoinHook {
  const { address: userAddress } = useAccount();
  const { data: txHash, writeContractAsync } = useWriteContract();

  const { data: decimals } = useReadContract({
    abi: contractDefinitions.surecoin.abi,
    address: contractDefinitions.surecoin.address,
    functionName: "decimals",
  });

  const { data: allowance } = useReadContract({
    abi: contractDefinitions.surecoin.abi,
    address: contractDefinitions.surecoin.address,
    functionName: "allowance",
    args: [
      userAddress || zeroAddress,
      contractDefinitions.justinsureInterface.address,
    ],
  });

  const { data: balance } = useReadContract({
    ...contractDefinitions.surecoin,
    functionName: "balanceOf",
    args: [userAddress || zeroAddress],
  });

  const { data: earned, refetch: refreshEarned } = useReadContract({
    ...contractDefinitions.surecoin,
    functionName: "earned",
    args: [userAddress || zeroAddress],
  });

  const approvalReciept = useWaitForTransactionReceipt({
    confirmations: 2,
    hash: txHash,
  });

  async function approve() {
    await writeContractAsync({
      ...contractDefinitions.surecoin,
      functionName: "approve",
      args: [contractDefinitions.justinsureInterface.address, UINT256_MAX],
    });

    return approvalReciept.isSuccess;
  }

  function getUserBalance() {
    if (!balance) return 0;
    return divideByDecimals(balance);
  }

  function getUserEarned() {
    if (!earned) return 0;
    return divideByDecimals(earned);
  }

  function multiplyWithDecimals(value: bigint) {
    if (!decimals) return 0n;
    return BigInt(Number(value) * 10 ** decimals);
  }

  function divideByDecimals(value: bigint | number) {
    if (!decimals) return 0;
    return Number(value) / 10 ** decimals;
  }

  return {
    allowance,
    decimals,
    earned,
    getUserBalance,
    getUserEarned,
    approve,
    multiplyWithDecimals,
    divideByDecimals,
    refreshEarned,
  };
}

export default useSureCoinHook;
