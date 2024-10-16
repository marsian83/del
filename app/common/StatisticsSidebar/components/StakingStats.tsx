import React, { useEffect, useRef, useState } from "react";
import useIdleScrollbar from "../../../hooks/useIdleScrollbar";
import { useAccount, useReadContract } from "wagmi";
import useWeb3 from "../../../contexts/web3context";
import { Address, isAddress, zeroAddress } from "viem";
import contractDefinitions from "../../../contracts";
import { Policy } from "../../../types";
import useUsdjHook from "../../../hooks/useUsdj";
import { useWriteContract } from "wagmi";
import { toast } from "react-toastify";
import useModal from "../../../hooks/useModal";
import Heading from "../../../pages/NewPolicyPage/components/Heading";
import Icon from "../../Icon";
import { twMerge } from "tailwind-merge";
import { Link, useNavigate } from "react-router-dom";
import { extractErrorFromTx } from "../../../utils";

export default function StakingStats() {
  const containerRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const { address } = useAccount();
  const { policies } = useWeb3();
  const [totalStake, setTotalStake] = useState(0);

  useIdleScrollbar(containerRef);
  const policiesStakedIn =
    policies?.filter((p) => p.stakers?.includes(address as string)) || [];

  return (
    <div
      className="scrollbar-primary flex max-h-[80vh] flex-col gap-3 overflow-y-scroll border-y border-border px-6 py-4"
      ref={containerRef}
    >
      <div className="flex items-center justify-between gap-x-3">
        <h1 className="text-base font-bold text-mute">Your Stakes</h1>
        <p className="rounded-lg bg-foreground p-2 text-sm font-semibold">
          Total : ${totalStake.toFixed(1)}
        </p>
      </div>

      {policiesStakedIn.map((policy, index) => (
        <StakedInCard
          key={index}
          setTotalStake={setTotalStake}
          policy={policy}
          withdrawable={false}
        />
      ))}
    </div>
  );
}

export function StakedInCard({
  policy,
  setTotalStake,
  setStakes,
  withdrawable,
}: {
  policy: Policy;
  setTotalStake: Function;
  setStakes?: Function;
  withdrawable?: boolean;
}) {
  const { address } = useAccount();
  const hasAddedStake = useRef(false);
  const usdj = useUsdjHook();
  const modal = useModal();

  const { data: stakeAmount } = useReadContract({
    ...contractDefinitions.insuranceController,
    address:
      policy.address && isAddress(policy.address)
        ? policy.address
        : zeroAddress,
    functionName: "stakedAmountOfAddress",
    args: [address ? address : zeroAddress],
  });

  useEffect(() => {
    if (stakeAmount && !hasAddedStake.current) {
      if (setStakes) {
        setStakes((prev: any) => {
          return [
            ...prev,
            {
              name: policy.name,
              address: policy.address,
              value: usdj.divideByDecimals(stakeAmount || 0n),
            },
          ];
        });
      }

      setTotalStake(
        (prev: number) => prev + usdj.divideByDecimals(stakeAmount || 0n),
      );
      hasAddedStake.current = true;
    }
  }, [stakeAmount, setTotalStake]);

  return (
    <>
      {stakeAmount && stakeAmount > usdj.multiplyWithDecimals(0.1) && (
        <Link
          to={`/policies/${policy.address}`}
          className={twMerge(
            `rounded-lg border border-border bg-background p-2 transition-all`,
            !withdrawable && "hover:bg-mute/5",
          )}
          title={
            policy.creator === address ? "Created by you" : "Staked by you"
          }
        >
          <div className="relative flex gap-x-2">
            <img
              src={policy.image}
              alt="image"
              className="aspect-square h-10 w-10 rounded-md object-cover"
            />
            <div className="flex w-full justify-between">
              <div className="flex w-2/3 flex-col truncate">
                <h1 className="w-full truncate text-sm font-semibold capitalize">
                  {policy.name}
                </h1>
                <p
                  className={twMerge(
                    "mt-1 flex gap-x-1 whitespace-nowrap text-xs text-mute",
                    withdrawable ? "" : "",
                  )}
                >
                  Stake: ${usdj.divideByDecimals(stakeAmount || 0n).toFixed(2)}
                </p>
              </div>

              {withdrawable && (
                <button
                  className="w-max self-start rounded-md border border-border bg-front/10 px-3 py-2 text-sm text-front/80 transition-all"
                  onClick={() =>
                    modal.show(<WithdrawStakeModal policy={policy} />)
                  }
                >
                  Withdraw
                </button>
              )}
            </div>
          </div>
        </Link>
      )}
    </>
  );
}

function WithdrawStakeModal({ policy }: { policy: Policy }) {
  const {
    writeContractAsync,
    error: txError,
    data: txHash,
  } = useWriteContract();
  const modal = useModal();
  const [stake, setStake] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const usdjHook = useUsdjHook();
  const [showWarning, setShowWarning] = useState(false);
  const { address } = useAccount();
  const navigate = useNavigate();

  const { data: stakedAmount } = useReadContract({
    ...contractDefinitions.insuranceController,
    address: policy.address as Address,
    functionName: "stakedAmountOfAddress",
    args: [address || zeroAddress],
  });

  const { data: profitShare } = useReadContract({
    ...contractDefinitions.insuranceController,
    address: policy.address as Address,
    functionName: "profitShare",
    args: [address || zeroAddress],
  });

  useEffect(() => {
    if (stake > usdjHook.divideByDecimals(stakedAmount || 0n)) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [stake]);

  async function handleSubmit() {
    if (stake === 0) {
      toast.error("Please enter a valid amount..", {
        type: "error",
        autoClose: 2000,
      });
      return;
    }

    setLoading(true);
    toast.info("Sign the request to continue..");

    await writeContractAsync({
      ...contractDefinitions.insuranceController,
      address: policy.address as Address,
      functionName: "revokeStakeFromPolicy",
      args: [usdjHook.multiplyWithDecimals(stake)],
    });
  }

  useEffect(() => {
    if (txHash) {
      toast.success("Withdrawn Successfully..", {
        type: "success",
        autoClose: 2000,
      });
      modal.hide();
      setLoading(false);
      navigate(0);
    }

    if (txError) {
      const errormsg = extractErrorFromTx(txError.message);
      toast.error(errormsg || "Failed to withdraw stake..", {
        type: "error",
        autoClose: 2000,
      });
      setLoading(false);
    }

    console.log({ txHash, txError });
  }, [txHash, txError]);

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
      <h1 className="text-2xl font-bold">
        Withdraw Stake from{" "}
        <span className="text-secondary">{policy.name}</span>
      </h1>
      <div className="flex flex-col text-sm text-mute">
        You can withdraw your stake from the policy at any time along with the
        profit.
        <p>
          You can only withdraw the amount you have staked. You can check the
          amount you have staked below.
        </p>
        <p className="mt-2 text-front">
          Max Withdrawl:{" "}
          {usdjHook.divideByDecimals(stakedAmount || 0n).toFixed(2)}
        </p>
      </div>
      <div className="relative mt-4 flex flex-col">
        {showWarning && (
          <p
            className={twMerge(
              "absolute right-0 top-1 flex items-center gap-x-1 text-xs text-red-500",
              showWarning ? "animate-pulse" : "",
            )}
          >
            <Icon icon="info" /> Withdrawal Limit: $
            {usdjHook.divideByDecimals(stakedAmount || 0n).toFixed(2)}
          </p>
        )}
        <Heading>Enter amount to withdraw</Heading>
        <input
          type="number"
          className="mt-1 rounded-md border border-border bg-background p-2 shadow shadow-mute/30"
          placeholder="Enter Amount in USDJ"
          onChange={(e) => setStake(Number(e.target.value))}
        />
        <p className={twMerge("mt-2 flex gap-x-1 text-xs text-green-500")}>
          Max Profit: ${usdjHook.divideByDecimals(profitShare || 0n)}
        </p>
      </div>

      <button
        className={twMerge(
          "w-max self-end rounded-lg border border-primary px-6 py-2 font-bold text-secondary duration-300 ease-in hover:bg-primary hover:text-front disabled:pointer-events-none disabled:opacity-50",
          loading ? "animate-pulse" : "",
        )}
        onClick={handleSubmit}
        disabled={loading || showWarning}
      >
        {loading ? "Processing..." : "Withdraw"}
      </button>
    </div>
  );
}
