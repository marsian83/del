import { useState } from "react";
import PolicyHolders from "./PolicyHolders";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useReadContract } from "wagmi";
import contractDefinitions from "../../../contracts";
import { Address, isAddress, zeroAddress } from "viem";
import { Policy } from "../../../types";
import useModal from "../../../hooks/useModal";
import useUsdjHook from "../../../hooks/useUsdj";
import InitialStakeModal from "./InitialStakeModal";
import Icon from "../../../common/Icon";
import { Link } from "react-router-dom";
import EnablePolicyComponent from "./EnablePolicyComponent";
import DisablePolicyComponent from "./DisablePolicyComponent";
import EditPolicyComponent from "./EditPolicyComponent";

export default function PolicyCard(props: { policy: Policy }) {
  const [parent] = useAutoAnimate();
  const modal = useModal();
  const usdj = useUsdjHook();
  const [expanded, setExpanded] = useState(false);
  const policyAddress = isAddress(props.policy.address)
    ? props.policy.address
    : zeroAddress;

  const { data: isPaused } = useReadContract({
    abi: contractDefinitions.insuranceController.abi,
    address: policyAddress,
    functionName: "paused",
  });

  const { data: totalStake } = useReadContract({
    abi: contractDefinitions.insuranceController.abi,
    address: policyAddress,
    functionName: "totalStake",
  });

  const { data: creatorStake } = useReadContract({
    abi: contractDefinitions.insuranceController.abi,
    address: policyAddress,
    functionName: "stakedAmountOfAddress",
    args: [props.policy.creator as Address],
  });

  return (
    <div
      ref={parent}
      className="relative flex flex-col gap-y-4 rounded-md border border-border p-3"
    >
      <div className="flex flex-col">
        <div className="flex justify-between gap-y-1">
          <div className="flex items-center gap-2">
            <img
              src={props.policy.image}
              alt="logo"
              className="aspect-square w-16 rounded-md object-cover p-1 sm:w-12"
            />
            <div>
              <Link
                to={`/policies/${props.policy.address}`}
                className="text-2xl font-semibold sm:text-xl"
              >
                {props.policy.name}
              </Link>
              {isPaused ? (
                <p className="flex items-center gap-x-2 whitespace-nowrap text-sm tracking-wide text-red-500">
                  Policy Inactive
                  <Icon icon="info" />
                </p>
              ) : (
                <p className="flex items-center gap-x-2 whitespace-nowrap text-sm tracking-wide text-green-500">
                  Policy Active
                  <Icon icon="done" />
                </p>
              )}
            </div>
          </div>

          <div className="font-semibold">
            {isPaused && usdj.divideByDecimals(creatorStake || 0n) === 0 && (
              <button
                onClick={() =>
                  modal.show(<InitialStakeModal policy={props.policy} />)
                }
                className="whitespace-nowrap rounded-md border border-border/60 px-4 py-2 text-sm font-medium text-front transition-all hover:bg-zinc-900/60"
              >
                Set Initial Stake
              </button>
            )}

            {isPaused && usdj.divideByDecimals(creatorStake || 0n) > 0 && (
              <button
                title="Enable Policy"
                onClick={() =>
                  modal.show(<EnablePolicyComponent policy={props.policy} />)
                }
                className="whitespace-nowrap rounded-md border border-border/60 px-4 py-2 text-sm font-medium text-front transition-all hover:bg-zinc-900/60"
              >
                Enable Policy
              </button>
            )}

            {!isPaused && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  title="Edit Policy"
                  // onClick={() => modal.show(<EditPolicyComponent policy={props.policy} />)}
                  className="whitespace-nowrap rounded-md border border-border/60 px-4 py-2 text-sm font-medium text-front transition-all hover:bg-zinc-900/60"
                >
                  Edit Policy
                </button>

                <button
                  title="Disable Policy"
                  onClick={() =>
                    modal.show(<DisablePolicyComponent policy={props.policy} />)
                  }
                  className="whitespace-nowrap rounded-md border border-border/60 px-4 py-2 text-sm font-medium text-front transition-all hover:bg-zinc-900/60"
                >
                  Disable Policy
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 text-sm text-front/80">
          {`${props.policy.description.slice(0, 250)}${props.policy.description.length > 250 ? "..." : ""}`}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-4 mobile:gap-y-2">
        <div className="flex w-max items-center justify-between gap-x-8 rounded-2xl border border-front/10 bg-background px-4 py-1 duration-300 ease-in-out hover:bg-front hover:bg-opacity-[1%]">
          <div className="flex flex-col">
            <p className="flex items-center text-sm text-front/80">
              {props.policy.holders?.length} Policy Holders
            </p>
          </div>
        </div>
        <div className="flex w-max items-center justify-between gap-x-8 rounded-2xl border border-front/10 bg-background px-4 py-1 duration-300 ease-in-out hover:bg-slate-400 hover:bg-opacity-[1%]">
          <div className="flex flex-col">
            <p className="text-sm text-front/80">
              {usdj.divideByDecimals(totalStake || 0n)?.toString()} USDJ Staked
            </p>
          </div>
        </div>
      </div>

      <button
        className="absolute bottom-2 right-4 text-sm text-zinc-400 underline underline-offset-2"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "View Less" : "View More"}
      </button>

      {expanded && <PolicyHolders holders={props.policy.holders} />}
    </div>
  );
}
