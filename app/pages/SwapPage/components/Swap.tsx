import React, { useEffect, useState } from "react";
import Icon from "../../../common/Icon";
import useSureCoinHook from "../../../hooks/useSurecoin";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import contractDefinitions from "../../../contracts";
import { isAddress, zeroAddress } from "viem";
import { toast } from "react-toastify";
import useUsdjHook from "../../../hooks/useUsdj";
import { extractErrorFromTx } from "../../../utils";
import Heading from "../../NewPolicyPage/components/Heading";

export default function Swap() {
  const usdj = useUsdjHook();
  const surecoin = useSureCoinHook();
  const { address: userAddress } = useAccount();
  const [amount, setAmount] = useState<string>("");
  const [isSurecoinToUsdj, setIsSurecoinToUsdj] = useState(true);
  const surecoinBalance = surecoin.getUserBalance();
  const usdjBalance = usdj.getUserBalance();
  const balance = isSurecoinToUsdj ? surecoinBalance : usdjBalance;
  const [slippage, setSlippage] = useState<number>(0.5);
  const [status, setStatus] = useState<{
    isApproving: boolean;
    isSwapping: boolean;
  }>({
    isApproving: false,
    isSwapping: false,
  });

  // APPROVAL LOGIC
  const { data: txHash, error: txError, writeContract } = useWriteContract();
  const { error: receiptError, isSuccess: receiptSuccess } =
    useWaitForTransactionReceipt({
      confirmations: 2,
      hash: txHash,
      onReplaced: () => {
        toast.info("Transaction replaced");
      },
    });

  function ensureApproval() {
    setStatus({ ...status, isApproving: true });
    try {
      if (isSurecoinToUsdj) {
        // Selling SURE - Approve SURE
        if (Number(surecoin.allowance) < BigInt(amount)) {
          writeContract({
            ...contractDefinitions.surecoin,
            functionName: "approve",
            args: [contractDefinitions.surecoin.address, BigInt(amount)],
          });
        }
      } else {
        // Buying SURE - Approve USDJ
        if (Number(usdj.allowance) < BigInt(amount)) {
          writeContract({
            ...contractDefinitions.usdj,
            functionName: "approve",
            args: [contractDefinitions.surecoin.address, BigInt(amount)],
          });
        }
      }
    } catch (error) {
      setStatus({ ...status, isApproving: false });
      toast.error("Something went wrong..");
      console.error(error);
    }
  }

  // SWAP LOGIC
  const { data: liquidity, refetch: refetchLiquidity } = useReadContract({
    address: contractDefinitions.surecoin.address,
    abi: contractDefinitions.surecoin.abi,
    functionName: "liquidity",
  });

  const { data: reserve, refetch: refetchReserve } = useReadContract({
    address: contractDefinitions.surecoin.address,
    abi: contractDefinitions.surecoin.abi,
    functionName: "reserve",
  });

  const amountWithDecimals =
    Number(amount) * Math.pow(10, surecoin.decimals || 6);
  let calculatedAmount = 0;

  if (isSurecoinToUsdj) {
    calculatedAmount =
      (Number(liquidity) * amountWithDecimals) /
      (Number(reserve) + amountWithDecimals);
  } else {
    calculatedAmount =
      (amountWithDecimals * Number(reserve)) /
      (Number(liquidity) + amountWithDecimals);
  }

  function swap() {
    setStatus({ ...status, isSwapping: true });

    try {
      // Swap
      if (isSurecoinToUsdj) {
        // Sell SURE
        const Amount = Number(amount) * Math.pow(10, surecoin.decimals || 6);
        const AmountOutMin =
          calculatedAmount - (calculatedAmount * slippage) / 100;

        if (Amount === 0 || isNaN(Amount)) {
          toast.error("Invalid amount");
          return;
        } else if (
          Amount > surecoin.multiplyWithDecimals(BigInt(surecoinBalance))
        ) {
          toast.error("Insufficient SURE balance");
          return;
        } else if (!userAddress)
          return toast.error("Please connect your wallet");

        // Transaction to sell SURE
        writeContract({
          ...contractDefinitions.surecoin,
          functionName: "sell",
          args: [BigInt(Amount), BigInt(AmountOutMin)],
        });
      } else {
        // Buy SURE
        const Amount = Math.round(
          Number(amount) * Math.pow(10, usdj.decimals || 6),
        );
        const AmountOutMin = Math.round(
          calculatedAmount - (calculatedAmount * slippage) / 100,
        );

        if (Amount === 0 || isNaN(Number(amount))) {
          toast.error("Invalid amount");
          return;
        } else if (Amount > usdj.multiplyWithDecimals(Amount)) {
          toast.error("Insufficient USDJ balance");
          return;
        } else if (!userAddress)
          return toast.error("Please connect your wallet");

        // Transaction to buy SURE
        writeContract({
          ...contractDefinitions.surecoin,
          functionName: "buy",
          args: [BigInt(Amount), BigInt(AmountOutMin)],
        });
      }
    } catch (error) {
      setStatus({ ...status, isSwapping: false });
      toast.error("Something went wrong..");
      console.error(error);
    }
  }

  useEffect(() => {
    if (status.isApproving && receiptSuccess) {
      setStatus({ ...status, isApproving: false });
      swap();
    } else if (status.isApproving && receiptError) {
      setStatus({ ...status, isApproving: false });
      toast.error(extractErrorFromTx(receiptError.message));
    }

    if (status.isSwapping && receiptSuccess) {
      setStatus({ ...status, isSwapping: false });
      toast.success("Swap successful");
      refetchLiquidity();
      refetchReserve();
    } else if (status.isSwapping && receiptError) {
      setStatus({ ...status, isSwapping: false });
      toast.error(extractErrorFromTx(receiptError.message));
    }
  }, [status]);

  return (
    <div className="relative h-max rounded-lg border border-border p-4 shadow-md">
      <div className="flex w-full items-center justify-between px-1">
        <Heading className="text-xl"> Swap </Heading>
        <div className="flex items-center justify-end gap-1 text-sm">
          <p>Slippage:</p>
          <input
            type="text"
            name="slippage"
            value={slippage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (!isNaN(Number(e.target.value))) {
                setSlippage(Number(e.target.value));
              }
            }}
            className="w-16 rounded-md border border-border bg-transparent bg-zinc-900 p-2 text-center text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Sell section */}
      <div className="mt-4 rounded-md border border-border bg-zinc-900 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm">Sell</p>
          <p className="text-xs">
            Max: {balance.toFixed(2)} {isSurecoinToUsdj ? "Surecoin" : "USDJ"}
          </p>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            name="amount"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (!isNaN(Number(e.target.value))) {
                setAmount(e.target.value);
              }
            }}
            placeholder="0.00"
            className="w-full border-none bg-transparent text-right text-2xl text-white focus:outline-none"
          />
          <span className="ml-2 text-sm">
            {isSurecoinToUsdj ? "Surecoin" : "USDJ"}
          </span>
        </div>
      </div>

      {/* Swap toggle */}
      <div className="text-center">
        <button
          onClick={() => {
            setIsSurecoinToUsdj(!isSurecoinToUsdj);
            setAmount("");
          }}
          className="rounded-full bg-transparent p-2 text-xl text-white duration-300 hover:bg-primary/20"
        >
          <Icon icon="arrow_forward" className="rotate-90" />
        </button>
      </div>

      {/* Buy section */}
      <div className="rounded-md border border-border bg-zinc-900 p-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm">Buy</p>
          <p className="text-xs">
            Balance:{" "}
            {(isSurecoinToUsdj ? usdjBalance : surecoinBalance).toFixed(2)}{" "}
            {isSurecoinToUsdj ? "USDJ" : "Surecoin"}
          </p>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            name="calculatedAmount"
            value={
              isSurecoinToUsdj
                ? usdj.divideByDecimals(calculatedAmount).toFixed(6)
                : surecoin.divideByDecimals(calculatedAmount).toFixed(6)
            }
            disabled
            className="w-full border-none bg-transparent text-right text-2xl text-white focus:outline-none"
          />
          <span className="ml-2 text-sm">
            {isSurecoinToUsdj ? "USDJ" : "Surecoin"}
          </span>
        </div>
      </div>

      {/* Buy button */}
      <button
        className="mt-4 w-full rounded-md bg-primary/80 py-2 text-center font-bold duration-100 ease-in hover:bg-primary disabled:opacity-50"
        disabled
        title="Coming soon"
        onClick={ensureApproval}
      >
        Swap
      </button>
    </div>
  );
}
