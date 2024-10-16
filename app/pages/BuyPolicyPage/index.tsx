import { twMerge } from "tailwind-merge";
import DocTitle from "../../common/DocTitle";
import Heading from "../NewPolicyPage/components/Heading";
import { useEffect, useState } from "react";
import DurationInput from "../../common/DurationInput";
import DataForm from "../../common/DataForm";
import { closestTimeUnit } from "../../utils";
import { Navigate, useParams } from "react-router-dom";
import { isAddress } from "viem";
import useApiResponse from "../../hooks/useApiResponse";
import api from "../../utils/api";
import useModal from "../../hooks/useModal";
import RequestQuoteModal from "./RequestQuoteModal";

export default function BuyPolicyPage() {
  const [claimValue, setClaimValue] = useState<string>("");
  const [isClaimInRange, setIsClaimInRange] = useState<boolean>(true);
  const [duration, setDuration] = useState<number>(0);
  const [isDurationInRange, setIsDurationInRange] = useState<boolean>(true);
  const { address: policyAddress } = useParams<{ address: string }>();
  const modal = useModal();
  const [loading, setLoading] = useState(false);

  function checkRange(min: number, max: number, inputValue: number) {
    return inputValue >= min && inputValue <= max;
  }

  const twInputStyle =
    "text-lg rounded-md p-2 bg-background border border-border shadow shadow-mute/30";

  const { data: policyData } = useApiResponse(
    api.policy.getByAddress,
    policyAddress ? policyAddress : "",
  );

  useEffect(() => {
    if (
      duration &&
      policyData &&
      checkRange(
        policyData?.minimumDuration,
        policyData?.maximumDuration,
        duration,
      )
    ) {
      setIsDurationInRange(true);
    } else if (policyData) {
      checkRange(
        policyData?.minimumDuration,
        policyData?.maximumDuration,
        duration,
      );
      setIsDurationInRange(false);
    }
  }, [duration]);

  const handleFormSubmit = async (data: Record<string, string>) => {
    setLoading(true);

    try {
      if (policyData) {
        let argsArray = policyData.premiumFuncArgs.map((arg: any) => {
          return {
            arg: arg.name,
            value: data[arg.name],
          };
        });

        if (!argsArray.every((arg: any) => arg.value)) {
          alert("Please fill all the fields");
          setLoading(false);
          return;
        }

        const { key } = await api.policy.calculatePremium(
          policyData.address,
          argsArray,
        );

        const intervalId = setInterval(async () => {
          const newData = await api.policy.getExecutedKey(key);

          if (newData.completed && newData.output) {
            setLoading(false);

            if (
              !isNaN(parseFloat(newData.output)) &&
              isFinite(Number(newData.output))
            ) {
              modal.show(
                <RequestQuoteModal
                  policy={policyData}
                  formData={data}
                  premium={parseFloat(newData.output)}
                />,
              );
            } else {
              alert("Invalid output type received from the policy");
            }

            clearInterval(intervalId);
          }
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      alert("Error while calculating premium!");
    }
  };

  if (!policyAddress || !isAddress(policyAddress)) {
    return <Navigate to="/policies" />;
  }

  return (
    <>
      <DocTitle title="Buy Policy" />
      <div className="p-page relative flex gap-x-6 py-8">
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex animate-pulse flex-col items-center rounded-lg border border-border bg-zinc-200 p-8">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-0 border-primary" />
              <p className="mt-2 font-semibold text-primary">
                Calculating Premium
              </p>
              <p className="text-mute">Please wait...</p>
            </div>
          </div>
        )}

        <DataForm
          callback={handleFormSubmit}
          className="mobile:p-page flex flex-1 flex-col gap-y-7"
        >
          <div className="flex basis-1/2 flex-col">
            <h1 className="border-b border-front/20 pb-1 text-xl">
              Premium Function
            </h1>
            <div className="scrollbar-primary mt-4 flex max-h-[30vh] w-full flex-col overflow-y-scroll rounded-xl border border-front/40 p-4 text-secondary duration-300 hover:bg-foreground/30">
              <pre className="font-mono text-xs">{policyData?.premiumFunc}</pre>
            </div>
          </div>

          <div>
            <Heading
              className=""
              tooltip="Make sure it is in range of the maximum and minimum claim issued by the marketer"
            >
              Claim value for the policy
            </Heading>
            <input
              className={twMerge(
                twInputStyle,
                "w-full",
                isClaimInRange ? "" : "border-red-500",
              )}
              placeholder="Claim value"
              name="claimValue"
              value={claimValue}
              onChange={(e) => {
                if (policyData) {
                  const isClaimInRange = checkRange(
                    policyData?.minimumClaim,
                    policyData?.maximumClaim,
                    parseFloat(e.currentTarget.value),
                  );
                  setClaimValue(e.target.value);
                  setIsClaimInRange(isClaimInRange);
                }
              }}
              type="number"
            />
            <p className="text-red-500">
              {!isClaimInRange &&
                `Claim value must be between ${policyData?.minimumClaim} and ${policyData?.maximumClaim}`}
            </p>
          </div>

          <div>
            <Heading
              className=""
              tooltip="Make sure it is in range of the maximum and minimum duration given by the marketer"
            >
              Duration for the policy
            </Heading>
            <DurationInput
              className={twMerge(
                "w-1/2",
                twInputStyle,
                isDurationInRange ? "" : "border-red-500",
              )}
              name="claimDuration"
              defaultValue={1000 * 60 * 60 * 24}
              setter={setDuration}
            />
            <p className="text-red-500">
              {!isDurationInRange &&
                policyData &&
                `Duration value must be between ${closestTimeUnit(
                  policyData?.minimumDuration,
                )} and ${closestTimeUnit(policyData?.maximumDuration)}`}
            </p>
          </div>

          <div className="w-full">
            <h1>Premium calculation function arguments</h1>
            <div className="mt-2 flex flex-col gap-y-4 rounded-xl bg-secondary/5 p-4">
              {policyData?.premiumFuncArgs &&
                policyData?.premiumFuncArgs.length > 0 &&
                policyData?.premiumFuncArgs.map((arg: any, key: number) => {
                  if (arg.name === "claimValue" || arg.name === "claimDuration")
                    return null;

                  return (
                    <div key={key} className="flex w-full flex-col gap-y-2">
                      <div className="flex gap-x-2">
                        <Heading className="capitalize">{arg.name}:</Heading>
                        <p className="text-front/80">{arg.description}</p>
                      </div>
                      <input
                        type={arg.htmlType}
                        className={twMerge(twInputStyle, "w-full")}
                        placeholder={arg.htmlType}
                        name={arg.name}
                        required
                      />
                    </div>
                  );
                })}
            </div>
          </div>
          <button
            type="submit"
            className="w-max rounded-md bg-primary px-6 py-2 font-medium text-front"
          >
            Request Quote
          </button>
        </DataForm>
      </div>
    </>
  );
}
