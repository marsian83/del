import { twMerge } from "tailwind-merge";
import PieChart from "../../../common/PieChart";

export default function StakeDistribution(props: {
  data: { labels: string[]; values: number[]; bgColor: string[] };
}) {
  return (
    <div className="my-5 flex flex-col gap-x-8 rounded-xl bg-background px-6 py-6 mobile:px-4 mobile:py-3">
      <div className="flex justify-between mobile:flex-col mobile:gap-y-1">
        <h1 className="text-xl">Total money & distribution of pool</h1>
        <p className="rounded-xl border border-primary/30 bg-primary/20 px-4 mobile:w-max mobile:self-end mobile:text-sm">
          Total Staked : <span className="font-mono">890.32</span>
        </p>
      </div>
      <div className="flex justify-around pt-6 mobile:w-full mobile:flex-col mobile:items-center mobile:gap-y-4">
        <PieChart data={props.data} className="w-[20vw] mobile:w-[40vw]" />
        <div className="flex basis-1/2 flex-col gap-y-3 mobile:w-full">
          {props.data.labels.map((label, i) => (
            <div className="flex w-full items-center gap-x-4">
              <span className="">{i + 1}</span>
              <div
                className={twMerge(
                  "flex w-full items-center justify-between rounded-xl border border-front/10 bg-front/5 px-4 py-2",
                  `duration-150 ease-in hover:scale-[102%] hover:cursor-pointer`,
                )}
              >
                <h1 className="">{label}</h1>
                <p className="font-mono">{props.data.values[i]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
