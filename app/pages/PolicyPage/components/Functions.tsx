import { Policy } from "../../../types";

export default function Functions(props: { policy: Policy }) {
  const { policy } = props;
  return (
    <div className="flex flex-col gap-y-8 py-6">
      <div className="flex basis-1/2 flex-col">
        <h1 className="border-b border-front/20 pb-1 text-xl">
          Premium validation function
        </h1>
        <p className="mt-1 text-sm text-front/40">
          {policy.premiumFuncDescription}
        </p>
        <div className="mt-4 flex w-max flex-col rounded-md border border-border bg-foreground p-2 text-front/80 duration-300">
          <pre className="font-mono text-xs">{policy.premiumFunc}</pre>
        </div>
      </div>

      <div className="flex basis-1/2 flex-col">
        <h1 className="border-b border-front/20 pb-1 text-xl">
          Claim validation function
        </h1>
        <p className="mt-1 text-sm text-front/40">
          {policy.claimFuncDescription}
        </p>
        <div className="mt-4 flex w-max flex-col rounded-md border border-border bg-foreground p-2 text-front/80 duration-300">
          <pre className="font-mono text-xs">{policy.claimFunc}</pre>
        </div>
      </div>
    </div>
  );
}
