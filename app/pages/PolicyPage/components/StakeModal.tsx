import { twMerge } from "tailwind-merge";
import Heading from "../../NewPolicyPage/components/Heading";
import Icon from "../../../common/Icon";
import useModal from "../../../hooks/useModal";
import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import contractDefinitions from "../../../contracts";
import { Policy } from "../../../types";
import { isAddress, zeroAddress } from "viem";
import useUsdjHook from "../../../hooks/useUsdj";
import api from "../../../utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { extractErrorFromTx } from "../../../utils";

export default function StakeModal({ policy }: { policy: Policy }) {
  const modal = useModal();
  const navigate = useNavigate();
  const [stake, setStake] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { allowance, approve, multiplyWithDecimals } = useUsdjHook();
  const { address } = useAccount();
  const { data: hash, writeContractAsync } = useWriteContract();
  const [showWarning, setShowWarning] = useState(false);

  const stakeReciept = useWaitForTransactionReceipt({
    confirmations: 2,
    hash,
  });

  const { data: minStake } = useReadContract({
    ...contractDefinitions.justinsureInterface,
    functionName: "minimumInitialStake",
  });

  const { data: usdjDecimals } = useReadContract({
    abi: contractDefinitions.usdj.abi,
    address: contractDefinitions.usdj.address,
    functionName: "decimals",
  });

  const minStakewithDecimals =
    Number(minStake) / Math.pow(10, Number(usdjDecimals));

  useEffect(() => {
    if (stake < minStakewithDecimals) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [stake]);

  async function handleSubmit() {
    if (stake === 0) {
      toast.error("Invalid USDJ amount..", {
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      return;
    }

    const handleSubmitToast = toast("Waiting for approval...", {
      type: "info",
      isLoading: true,
    });
    setLoading(true);
    try {
      if (
        allowance === BigInt(0) ||
        Number(allowance) < Number(multiplyWithDecimals(stake))
      ) {
        await approve();
      }

      await writeContractAsync({
        ...contractDefinitions.insuranceController,
        address: isAddress(policy.address) ? policy.address : zeroAddress,
        functionName: "stakeToPolicy",
        args: [multiplyWithDecimals(stake)],
      });

      toast.update(handleSubmitToast, {
        render: "Transaction submitted..",
        type: "info",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (error) {
      console.error(error);
      setLoading(false);

      toast.update(handleSubmitToast, {
        render: "Something went wrong..",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  }

  useEffect(() => {
    async function saveStakeToDB() {
      if (!address) return;
      const result = await api.policy.updateStakers(policy.address, address);

      if (result) {
        toast.success("Staked successfully..", {
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        modal.hide();
        navigate(0);
      } else {
        toast.error("Error while updating database..", {
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    }

    if (stakeReciept.isSuccess) {
      saveStakeToDB();
    }

    if (stakeReciept.isError) {
      const errormsg = extractErrorFromTx(stakeReciept.error.message);
      toast.error(errormsg, {
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  }, [stakeReciept.isLoading]);

  return (
    <div className="relative flex w-[40vw] flex-col gap-y-1 rounded-lg border border-primary/60 bg-background px-8 py-8 mobile:w-[80vw] mobile:px-8">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="flex animate-pulse flex-col items-center rounded-lg border border-border bg-zinc-200 p-8">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-0 border-primary" />
            <p className="mt-2 font-semibold text-primary">
              Processing Request
            </p>
            <p className="text-mute">Please wait..</p>
          </div>
        </div>
      )}

      <button
        className="absolute right-3 top-3 rounded-full border border-red-500 p-1 text-red-500 opacity-50 duration-300 ease-in hover:opacity-100"
        onClick={() => modal.hide()}
      >
        <Icon icon="close" className="text-[1rem] mobile:text-[1rem]" />
      </button>
      <h1 className="mb-2 text-2xl font-bold">
        Stake in the Policy and Earn Rewards
      </h1>
      <div className="flex flex-col gap-y-1 text-sm text-mute">
        By staking in this policy, you can actively participate and earn
        benefits. Here's how it works:
        <p>
          <span className="text-front">1. Profit Sharing: </span>
          When you stake, you will receive 2% of the policy's total revenue.
          This includes premiums collected, allowing you to earn passive income
          based on the policy's performance.
        </p>
        <p>
          <span className="text-front">2. SureCoin Rewards: </span>
          In addition to profit sharing, you will earn{" "}
          <span className="font-bold text-secondary">SureCoins</span>— A special
          revenue-sharing token. SureCoin holders benefit from platform-wide
          activity, as 50% of all platform fees are used to support the
          liquidity of SureCoin. This ensures that even if no one directly
          invests in SureCoin, it continues to gain value over time.
        </p>
      </div>
      <div className="relative mt-6 flex flex-col">
        <p
          className={twMerge(
            "absolute right-0 top-1 flex animate-pulse items-center gap-x-1 text-xs text-red-500",
            showWarning ? "" : "hidden",
          )}
        >
          <Icon icon="info" /> Minimum Stake: {minStakewithDecimals} USDJ
        </p>
        <Heading>Enter amount to be Staked in policy</Heading>
        <input
          type="number"
          className="mt-1 rounded-md border border-border bg-background p-2 shadow shadow-mute/30"
          placeholder="Enter Amount in USDJ"
          onChange={(e) => setStake(Number(e.target.value))}
        />
      </div>
      <button
        className={twMerge(
          "mt-3 w-max self-end rounded-lg border border-primary px-6 py-2 font-bold text-secondary duration-300 ease-in hover:bg-primary hover:text-front disabled:pointer-events-none disabled:opacity-50",
          loading ? "animate-pulse" : "",
        )}
        onClick={handleSubmit}
        disabled={loading || showWarning}
      >
        {loading ? "Staking..." : "Stake"}
      </button>
    </div>
  );
}
