import { twMerge } from "tailwind-merge";
import PieChart from "../../../common/PieChart";
import { Policy } from "../../../types";
import useIdleScrollbar from "../../../hooks/useIdleScrollbar";
import React, { useRef } from "react";
import { generateShades } from "../../../utils";
import { useReadContract } from "wagmi";
import contractDefinitions from "../../../contracts";
import { isAddress, zeroAddress } from "viem";

export default function PoolDistribution({ policy }: { policy: Policy }) {
  const accountRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  useIdleScrollbar(accountRef);
  const policyAddress = isAddress(policy.address)
    ? policy.address
    : zeroAddress;

  const { data: totalStake } = useReadContract({
    ...contractDefinitions.insuranceController,
    address: policyAddress,
    functionName: "totalStake",
  });

  // const stakerArray = [];

  // for (const staker of policy.stakers) {
  //   if(!isAddress(staker)) continue;

  //   const result = useReadContract({
  //     ...contractDefinitions.insuranceController,
  //     address: policyAddress,
  //     functionName: "stakedAmountOfAddress",
  //     args: [staker],
  //   })

  //   stakerArray.push({
  //     address: staker,
  //     amount: (result.data)?.toString(),
  //   })
  // }

  // const data = {
  //   labels: stakerArray?.map((staker) => staker.amount) || [],
  //   values: stakerArray?.map((staker) => staker.amount) || [],
  //   bgColor: generateShades("rgb(26, 201, 255)", policy.stakers?.length || 1),
  // };

  return (
    <div className="mx-4 flex flex-col gap-x-8 rounded-xl border border-secondary/20 bg-secondary/5 px-8 py-12 mobile:py-6">
      <div className="flex justify-between">
        <h1 className="text-xl">Total Stakes</h1>
        <p className="rounded-xl border border-primary/30 bg-primary/20 px-4 mobile:w-max mobile:self-end">
          Surecoins :{" "}
          <span className="font-mono">{totalStake?.toString()}</span>
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center mobile:gap-5 widescreen:flex-row widescreen:justify-between widescreen:gap-10">
        {/* <PieChart
          data={data}
          className=""
        /> */}
        <div
          className="scrollbar-primary flex max-h-[240px] w-full flex-col gap-y-3 rounded-xl border border-border p-4 text-sm"
          ref={accountRef}
        >
          {policy.stakers?.map((staker, i) => (
            <div key={i} className="flex w-full items-center gap-x-4">
              <span className="">{i + 1}</span>
              <div
                className={twMerge(
                  "flex w-full flex-wrap items-center justify-between gap-4 rounded-xl border border-front/10 px-4 py-2",
                  `duration-150 ease-in hover:scale-[102%] hover:cursor-pointer`,
                  staker === policy.creator
                    ? "bg-secondary/50"
                    : "bg-primary/5",
                )}
              >
                <h1 className="">{staker}</h1>
                {/* <p className="font-mono text-cyan-400 font-bold">{staker}</p> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
