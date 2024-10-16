import { useReadContract } from "wagmi";
import { Policy } from "../../../types";
import { closestTimeUnit } from "../../../utils";
import contractDefinitions from "../../../contracts";
import { isAddress } from "viem";
import useUsdjHook from "../../../hooks/useUsdj";

export default function ClaimInfo({ policy }: { policy: Policy }) {
  const usdj = useUsdjHook();
  if (!isAddress(policy.address)) return <></>;

  const { data: totalStake } = useReadContract({
    abi: contractDefinitions.insuranceController.abi,
    address: policy.address,
    functionName: "totalStake",
  });

  return (
    <div>
      <div className="mt-4 flex w-full gap-x-4 gap-y-7 text-front/60 mobile:flex-col mobile:gap-x-4">
        <div className="flex w-1/3 flex-col gap-y-2 text-sm mobile:w-full">
          <div className="flex items-center justify-center gap-x-2 rounded-md border border-border bg-background py-1 text-center duration-200 ease-in-out hover:bg-front/5">
            <h1 className="tracking-wide">Policy Holders: </h1>
            <p className="text-front/80">{policy.holders.length}</p>
          </div>

          <div className="flex items-center justify-center gap-x-2 rounded-md border border-border bg-background py-1 text-center duration-200 ease-in-out hover:bg-front/5">
            <h1 className="tracking-wide">Total Stake:</h1>
            <p className="text-front/80">
              {" "}
              {usdj.divideByDecimals(totalStake || 0n)?.toString()} USDJ
            </p>
          </div>

          <div className="flex items-center justify-center gap-x-2 rounded-md border border-border bg-background py-1 text-center duration-200 ease-in-out hover:bg-front/5">
            <h1 className="tracking-wide">Total Claims:</h1>
            <p className="text-front/80">{policy.claims.length} </p>
          </div>
        </div>
        <div className="flex w-2/3 gap-x-4 mobile:w-full">
          <div className="flex w-1/2 flex-col justify-center rounded-md border border-border bg-background p-2 px-3 duration-200 ease-in-out mobile:w-full">
            {" "}
            <h1 className="border-b-2 border-foreground tracking-wide">
              Duration for the policy
            </h1>
            <div className="mt-2 text-front/60">
              Minimum:{" "}
              <span className="text-front/80">
                {closestTimeUnit(Number(policy.minimumDuration))}
              </span>
            </div>
            <div className="mt-1 text-front/60">
              Maximum:{" "}
              <span className="text-front/80">
                {closestTimeUnit(Number(policy.maximumDuration))}
              </span>
            </div>
          </div>
          <div className="flex w-1/2 flex-col justify-center rounded-md border border-border bg-background p-2 px-3 duration-200 ease-in-out mobile:w-full">
            {" "}
            <h1 className="border-b-2 border-foreground tracking-wide">
              Limit of the claim
            </h1>
            <div className="mt-2 text-front/60">
              Minimum:{" "}
              <span className="text-front/80">${policy.minimumClaim}</span>
            </div>
            <div className="mt-1 text-front/60">
              Maximum:{" "}
              <span className="text-front/80">${policy.maximumClaim}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
