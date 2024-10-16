import { twMerge } from "tailwind-merge";
import PieChart from "../../../common/PieChart";
import { generateShades } from "../../../utils";
import { StakedInCard } from "../../../common/StatisticsSidebar/components/StakingStats";
import useWeb3 from "../../../contexts/web3context";
import { useState } from "react";
import { useAccount } from "wagmi";

export default function YourStakes() {
  const { policies } = useWeb3();
  const [totalStake, setTotalStake] = useState(0);
  const [stakes, setStakes] = useState<
    {
      name: string;
      address: string;
      value: number;
    }[]
  >([]);
  const { address } = useAccount();

  const policiesStakedIn =
    policies?.filter((p) => p.stakers?.includes(address as string)) || [];

  const chartData = {
    labels: stakes.map((s) => s.name),
    values: stakes.map((s) => s.value),
    bgColor: generateShades("rgb(11, 128, 182)", stakes.length),
  };

  return (
    <div className="my-10 flex flex-col gap-x-8 rounded-xl bg-mute/5 p-2 mobile:mx-2">
      <div className="flex flex-col p-2 mobile:items-center">
        <div className="flex justify-between">
          <h1 className="text-2xl font-semibold">Policies Staked</h1>
          <p className="h-fit whitespace-nowrap rounded-md border border-primary/30 bg-mute/10 px-4 py-1 mobile:w-max">
            Total Staked :{" "}
            <span className="font-mono">{totalStake.toFixed(1)}</span>
          </p>
        </div>
        <h2 className="mt-2 text-sm text-mute">
          These are the policies in which you have staked. This pie chart
          displays the distribution of your staked amount across various
          policies. It provides a visual breakdown of how much you've staked in
          each policy, helping you track and manage your investments easily.
        </h2>
      </div>
      {policiesStakedIn.length > 0 ? (
        <div className="flex h-full items-center justify-between gap-10 pt-6 mobile:flex-col mobile:gap-6">
          <PieChart data={chartData} className="w-[20vw] mobile:w-[50vw]" />
          <div className="scrollbar-primary flex h-full max-h-[50vh] w-full flex-col gap-y-3 overflow-auto rounded-xl p-1 mobile:w-full widescreen:h-[35vh]">
            {policiesStakedIn.map((policy, i) => (
              <StakedInCard
                key={i}
                setStakes={setStakes}
                setTotalStake={setTotalStake}
                policy={policy}
                withdrawable={true}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-[20vh] items-center justify-center">
          <h1 className="text-2xl font-semibold text-mute">
            Nothing to show..
          </h1>
        </div>
      )}
    </div>
  );
}
