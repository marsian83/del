import { useReadContract } from "wagmi";
import Icon from "../../../common/Icon";
import { Policy } from "../../../types";
import contractDefinitions from "../../../contracts";
import { isAddress, zeroAddress } from "viem";
import useUsdjHook from "../../../hooks/useUsdj";

export default function TotalStakes({ policy }: { policy: Policy }) {
  const creatorAddress = isAddress(policy.creator)
    ? policy.creator
    : zeroAddress;
  const policyAddress = isAddress(policy.address)
    ? policy.address
    : zeroAddress;
  const { divideByDecimals } = useUsdjHook();

  const { data } = useReadContract({
    ...contractDefinitions.insuranceController,
    address: policyAddress,
    functionName: "totalStake",
  });

  const totalStake = data ? divideByDecimals(data) : 0;

  const { data: data2 } = useReadContract({
    ...contractDefinitions.insuranceController,
    address: policyAddress,
    functionName: "stakedAmountOfAddress",
    args: [creatorAddress],
  });

  const ownerStake = data2 ? divideByDecimals(data2) : 0;

  if (!isAddress(policy.address)) return <></>;

  const ownerStakePercentage =
    ownerStake && totalStake
      ? (Number(ownerStake) / Number(totalStake)) * 100
      : 0;

  if (creatorAddress === zeroAddress || policyAddress === zeroAddress)
    return null;
  return (
    <div className="flex w-full flex-col gap-y-2 pb-16">
      <div className="flex justify-between mobile:gap-y-2">
        <h1 className="text-xl">Staked Amount</h1>
        <div className="rounded-xl border border-primary/40 bg-primary/20 px-4 mobile:w-max mobile:self-end">
          Total: <span className="font-mono">{totalStake?.toString()}</span>
        </div>
      </div>
      <div className="relative mt-3 h-[1vh] w-full rounded-xl bg-primary/20">
        <div
          className="flex h-[1vh] items-center justify-end rounded-xl bg-secondary"
          style={{ width: `${ownerStakePercentage}%` }}
        >
          <div className="rounded-full border border-secondary bg-background p-1">
            <Icon
              icon="shield_person"
              className="text-[1.5rem] text-secondary"
            />
          </div>
        </div>

        <div
          className="mt-4 mobile:whitespace-nowrap"
          style={{ left: `${ownerStakePercentage}%` }}
        >
          By owner: {ownerStakePercentage.toFixed(2).toString()}%
        </div>
      </div>
      <div className="relative mt-2 flex w-full justify-between"></div>
    </div>
  );
}
