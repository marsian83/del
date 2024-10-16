import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useNavigate } from "react-router-dom";
import useModal from "../../hooks/useModal";
import useUsdjHook from "../../hooks/useUsdj";
import { Policy } from "../../types";
import api from "../../utils/api";
import Icon from "../../common/Icon";
import Heading from "../NewPolicyPage/components/Heading";
import { toast } from "react-toastify";
import useWeb3 from "../../contexts/web3context";
import { extractErrorFromTx } from "../../utils";

export default function RequestQuoteModal({
  policy,
  premium,
  formData,
}: {
  premium: number;
  policy: Policy;
  formData: Record<string, string>;
}) {
  const modal = useModal();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    allowance,
    approve,
    decimals,
    multiplyWithDecimals,
    divideByDecimals,
  } = useUsdjHook();
  const { address: userAddress } = useAccount();
  const { signMessage, data: sign, error: signError } = useSignMessage();
  const { fetchUser } = useWeb3();

  const formattedPremium = multiplyWithDecimals(premium);

  async function handleSubmit() {
    if (!decimals || !userAddress) {
      toast.error("Something went wrong, please try again..", {
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      return;
    }

    setLoading(true);
    try {
      if (
        allowance === BigInt(0) ||
        Number(allowance) < Number(formattedPremium)
      ) {
        await approve();
      }

      const nonce = await api.policy.requestNonce(userAddress);
      signMessage({ message: JSON.stringify({ ...formData }) + nonce });

      toast.info("Sign the message to proceed..", {
        type: "info",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Something went wrong, please try again..", {
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  }

  useEffect(() => {
    async function buyPolicy() {
      try {
        if (!userAddress || !sign) {
          return alert("Error while signing the message!");
        }

        await api.policy.buyPolicy(
          policy.address,
          userAddress,
          formData,
          sign,
          formattedPremium.toString(),
        );
        setLoading(false);
        toast.success("Policy bought successfully..", {
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        modal.hide();
        fetchUser();
        navigate("/account");
      } catch (error) {
        console.error(error);
        setLoading(false);
        toast.error("Error while buying policy..", {
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    }

    if (sign) {
      buyPolicy();
    }

    if (signError) {
      setLoading(false);
      const errorMsg = extractErrorFromTx(signError.message);
      toast.error(errorMsg, {
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      console.error(signError);
    }
  }, [sign, signError]);

  return (
    <div className="relative flex w-[40vw] flex-col gap-y-1 rounded-lg border border-primary/60 bg-background px-8 py-8 mobile:w-[80vw] mobile:px-8">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex animate-pulse flex-col items-center rounded-lg border border-border bg-zinc-200 p-8">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-0 border-primary" />
            <p className="mt-2 font-semibold text-primary">
              Processing Request..
            </p>
            <p className="text-mute">Please wait...</p>
          </div>
        </div>
      )}

      <button
        className="absolute right-3 top-3 rounded-full border border-red-500 p-1 text-red-500 opacity-50 duration-300 ease-in hover:opacity-100"
        onClick={() => modal.hide()}
      >
        <Icon icon="close" className="text-[1rem] mobile:text-[1rem]" />
      </button>

      <div className="flex flex-col gap-y-1">
        <h1 className="text-2xl font-bold">
          Calculated Premium for {policy.name}
        </h1>
        <p className="text-sm text-mute">
          The premium has been calculated based on the formula provided by the
          marketer, using the parameters and duration you specified. If the
          quoted premium meets your expectations, you can proceed with
          purchasing the policy. However, if the quote is not satisfactory, feel
          free to adjust the parameters or policy duration to explore
          alternative pricing options.
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Heading>Calculated Premium:</Heading>
        <div className="w-fit rounded-md border border-border bg-background px-4 py-1">
          <p>{divideByDecimals(formattedPremium)} USDJ</p>
        </div>
      </div>
      <div className="mt-6 flex gap-4 self-end">
        <button
          className={twMerge(
            "w-max rounded-sm bg-red-800/80 px-6 py-1 duration-150 ease-in hover:bg-red-800",
            loading ? "animate-pulse" : "",
          )}
          onClick={() => {
            modal.hide();
          }}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className={twMerge(
            "rounded-sm bg-primary/80 px-6 py-1 duration-150 ease-in hover:bg-primary",
            loading ? "animate-pulse" : "",
          )}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : "Buy Policy"}
        </button>
      </div>
    </div>
  );
}
