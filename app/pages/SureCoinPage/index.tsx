import DocTitle from "../../common/DocTitle";
import PieChart from "../../common/PieChart";
import { generateShades } from "../../utils";
import Heading from "../NewPolicyPage/components/Heading";

export default function (props: {}) {
  return (
    <div className="m-8 rounded-xl border border-border/50 p-4 text-sm">
      <DocTitle title="SureCoin" />

      <div>
        <Heading className="text-2xl">SureCoin</Heading>
        <p className="mt-1 text-mute">
          SureCoin is the native ERC20 token issued by JustInsure
        </p>
      </div>

      <div className="mt-8 leading-8">
        <p>SureCoin can be earned by staking to any policy on the platform</p>
        <p>
          SureCoin is a revShare token and 50% of all fee collected on the
          platform is used to increase SureCoin liquidity
        </p>
      </div>

      <div className="mt-3 text-lg font-bold">
        What actions are fees collected on?
      </div>
      <ul className="mt-2 list-disc pl-10 leading-8">
        <li>
          When a creator stakes to their own policy{" "}
          <span className="ml-1 text-xs italic text-mute">
            {" "}
            initial Stake is exempt from fee
          </span>
        </li>
        <li>When a creator withdraws their profits from a policy</li>
        <li>When someone buys a policy</li>
      </ul>

      <h2 className="mt-12 text-3xl font-bold">Tokenomics</h2>
      <img src="/images/tokenomics.png" className="mx-auto w-2/3" />
    </div>
  );
}
