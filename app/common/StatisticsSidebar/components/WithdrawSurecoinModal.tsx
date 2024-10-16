import React, { useEffect, useState } from "react";
import useModal from "../../../hooks/useModal";
import Icon from "../../Icon";
import { twMerge } from "tailwind-merge";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import contractDefinitions from "../../../contracts";
import useSureCoinHook from "../../../hooks/useSurecoin";
import { toast } from "react-toastify";

export default function WithdrawSurecoinModal() {
  const modal = useModal();
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const { data: hash, writeContractAsync } = useWriteContract();
  const surecoin = useSureCoinHook();
  const earned = surecoin.getUserEarned();

  const receipt = useWaitForTransactionReceipt({ hash });

  const handleClaim = async () => {
    if (!earned || earned <= 0) {
      toast.error("No rewards to claim.", { autoClose: 2000 });
      return;
    }

    setLoading(true);
    const claimToast = toast("Processing claim...", {
      type: "info",
      isLoading: true,
    });

    try {
      await writeContractAsync({
        ...contractDefinitions.surecoin,
        functionName: "claimRewards",
      });

      toast.update(claimToast, {
        render: "Transaction submitted!",
        type: "info",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (error) {
      console.error(error);
      toast.update(claimToast, {
        render: "Transaction failed.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (receipt.isSuccess) {
      toast.success("Rewards claimed successfully!", { autoClose: 2000 });
      modal.hide();
    }
    if (receipt.isError) {
      toast.error("Transaction failed.", { autoClose: 2000 });
    }
  }, [receipt.isSuccess, receipt.isError]);

  return (
    <div className="relative flex w-[40vw] flex-col gap-y-1 rounded-lg border border-primary/60 bg-background px-8 py-8 mobile:w-[80vw] mobile:px-8">
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
      <button
        className="absolute right-3 top-3 rounded-full border border-red-500 p-1 text-red-500 opacity-50 duration-300 ease-in hover:opacity-100"
        onClick={() => modal.hide()}
      >
        <Icon icon="close" className="text-[1rem] mobile:text-[1rem]" />
      </button>
      <h1 className="text-lg">
        Do you want to claim your Surecoins to your wallet?
      </h1>
      <p className="text-sm text-front/60">
        By following this process, you will be able to securely store Surecoins
        in your wallet, where they will remain stable. These Surecoins will be
        available for trade in exchange for USDJ at any time.{" "}
      </p>
      <div className="text-md mt-4 flex justify-end gap-x-4">
        <button
          onClick={() => modal.hide()}
          className="rounded-sm bg-front/80 px-4 py-1 text-back"
        >
          Cancel
        </button>
        <button
          className={twMerge(
            "w-max self-end rounded-sm bg-green-800 px-6 py-1 duration-300 ease-in disabled:pointer-events-none disabled:opacity-50",
            loading ? "animate-pulse" : "",
          )}
          onClick={handleClaim}
          disabled={loading}
        >
          {loading ? "Claiming..." : "Claim"}
        </button>
      </div>
    </div>
  );
}
