import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Policy } from "../../../types";
import { useEffect, useState } from "react";
import useModal from "../../../hooks/useModal";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Address } from "viem";
import contractDefinitions from "../../../contracts";
import { extractErrorFromTx } from "../../../utils";
import { twMerge } from "tailwind-merge";
import Icon from "../../../common/Icon";

export default function DisablePolicyComponent({ policy }: { policy: Policy }) {
  const { writeContract, data, error: writeError } = useWriteContract();
  const [loading, setLoading] = useState<boolean>(false);
  const modal = useModal();
  const navigate = useNavigate();

  const {
    isLoading,
    isSuccess,
    error: recieptError,
  } = useWaitForTransactionReceipt({
    hash: data,
  });

  function handleDisable() {
    toast.info("Sign the messgae to continue");
    setLoading(true);
    try {
      writeContract({
        ...contractDefinitions.insuranceController,
        address: policy.address as Address,
        functionName: "pause",
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error("Error disabling policy");
    }
  }

  useEffect(() => {
    if (isSuccess) {
      setLoading(false);
      navigate(0);
      toast.success("Policy Disabled Successfully");
    }

    if (recieptError) {
      setLoading(false);
      const errorMsg = extractErrorFromTx(recieptError.message);
      toast.error(errorMsg);
    }

    if (writeError) {
      setLoading(false);
      const errorMsg = extractErrorFromTx(writeError.message);
      toast.error(errorMsg);
    }
  }, [isLoading, writeError]);

  return (
    <div className="relative flex flex-col gap-y-1 rounded-lg border border-primary/60 bg-background px-8 py-8 mobile:w-[80vw] mobile:px-4 widescreen:w-[40vw]">
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

      <div className="flex w-full items-center justify-between">
        <h1 className="mb-2 text-2xl font-bold">Disable Policy</h1>
        <button
          className="rounded-full border border-red-500 p-1 text-red-500 opacity-50 duration-300 ease-in hover:opacity-100"
          onClick={() => modal.hide()}
        >
          <Icon icon="close" className="text-[1rem] mobile:text-[1rem]" />
        </button>
      </div>
      {policy.description && (
        <div className="flex flex-col gap-y-1 text-sm text-mute">
          <div className="flex flex-col gap-y-1 text-sm text-mute">
            <p className="mt-2 rounded-md bg-red-500/10 px-2 py-1 text-red-500/80">
              Are you sure you want to disable the policy?
            </p>
            <p className="px-1 py-1">
              Disabling the policy will stop all the transactions and the policy
              will be inactive. You can always enable the policy later if you
              want to.
            </p>
          </div>
          <div className="flex w-full justify-end gap-2">
            <button
              className={twMerge(
                "mt-3 w-max self-end rounded-lg bg-zinc-900 px-6 py-2 font-bold text-zinc-300 duration-300 ease-in hover:bg-zinc-800 hover:text-front disabled:pointer-events-none disabled:opacity-50",
              )}
              onClick={() => modal.hide()}
            >
              Cancel
            </button>

            <button
              className={twMerge(
                "mt-3 w-max self-end rounded-lg border border-primary px-6 py-2 font-bold text-secondary duration-300 ease-in hover:bg-primary hover:text-front disabled:pointer-events-none disabled:opacity-50",
                loading ? "animate-pulse" : "",
              )}
              onClick={handleDisable}
            >
              {loading ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
