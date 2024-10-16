import moment from "moment";
import useUsdjHook from "../../../hooks/useUsdj";
import Heading from "../../NewPolicyPage/components/Heading";
import useModal from "../../../hooks/useModal";
import Icon from "../../../common/Icon";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";
import api from "../../../utils/api";
import { useAccount, useSignMessage } from "wagmi";
import DataForm from "../../../common/DataForm";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

type ClaimData = {
  premiumFunctionDetails: {
    function: string;
    desc: string;
    args: object[];
  };
  policyDetails: {
    address: string | undefined;
    premium: number | undefined;
    status: string | undefined;
    claimExpiry: Date | undefined;
    args: object | undefined;
  };
  claimFuctionDetails: {
    function: string;
    desc: string;
    args: object[];
  };
};

export default function RequestClaimModal({
  claimData,
}: {
  claimData: ClaimData;
}) {
  const usdjHook = useUsdjHook();
  const modal = useModal();
  const [loading, setLoading] = useState(false);
  const { address: userAddress } = useAccount();
  const { signMessage, data: sign, error } = useSignMessage();
  const [signedData, setSignedData] = useState<any>();
  const navigate = useNavigate();

  async function checkValidity(data: Record<string, string>) {
    const toastID = toast("Validating Claim..", {
      type: "info",
      isLoading: true,
    });

    try {
      if (!claimData.policyDetails.address) {
        toast.warning("No Policy Addess Found..", {
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
        return;
      }

      if (!claimData.policyDetails.args) {
        toast.warning("No Premium Arguments Found..", {
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
        return;
      }

      const { key } = await api.policy.validateClaim(
        claimData.policyDetails.address,
        data,
        claimData.policyDetails.args,
      );

      const intervalId = setInterval(async () => {
        const newData = await api.policy.getExecutedKey(key);

        if (newData.completed && newData.output) {
          setLoading(false);

          if (newData.output === -1) {
            toast.update(toastID, {
              render: "Invalid Output, Contact Owner..",
              type: "error",
              isLoading: false,
              autoClose: 2000,
            });
            return;
          }

          if (newData.output === "True") {
            toast.update(toastID, {
              render: "Claim is valid..",
              type: "success",
              isLoading: false,
              autoClose: 2000,
            });
            signNonce(data);
          } else if (newData.output === "False") {
            toast.update(toastID, {
              render: "Claim is not valid..",
              type: "error",
              isLoading: false,
              autoClose: 2000,
            });
          } else {
            toast.update(toastID, {
              render: "Something went wrong..",
              type: "error",
              isLoading: false,
              autoClose: 2000,
            });
          }
          clearInterval(intervalId);
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.update(toastID, {
        render: "Something went wrong..",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  }

  async function signNonce(data: Record<string, string>) {
    setLoading(true);

    if (!claimData.policyDetails.args || !data) {
      toast.warning("Something is not right, please try again..");
      return;
    } else if (!userAddress) {
      toast.warning("Connect your wallet!");
      return;
    }

    setSignedData({
      claimArgs: data,
      premiumArgs: claimData.policyDetails.args,
    });

    try {
      const nonce = await api.policy.requestNonce(userAddress);
      toast.info("Please sign the message to continue...");

      signMessage({
        message:
          JSON.stringify({
            claimArgs: data,
            premiumArgs: claimData.policyDetails.args,
          }) + nonce,
      });
    } catch (error) {
      setLoading(false);
      toast.error("Error while signing the message!");
      console.error(error);
    }
  }

  useEffect(() => {
    async function validateClaim() {
      try {
        if (!userAddress || !claimData.policyDetails.address || !sign) {
          return toast.error("Error while signing message!");
        }

        await api.policy.claimPolicy(
          claimData.policyDetails.address,
          userAddress,
          signedData,
          sign,
        );

        setLoading(false);
        toast.success("Claim approved..");
        modal.hide();
        navigate(0);
      } catch (error) {
        setLoading(false);
        toast.error("Error while validating claim!");
      }
    }

    if (sign) {
      validateClaim();
    } else if (error) {
      setLoading(false);
      toast.error("Error while signing the message!");
    }
  }, [sign, error]);

  return (
    <div className="scrollbar-primary relative max-h-[90vh] w-[80vw] max-w-[720px] overflow-auto rounded-xl border border-border bg-background p-10 text-zinc-200">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="flex animate-pulse flex-col items-center rounded-lg border border-border bg-zinc-200 p-8">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-0 border-primary" />
            <p className="mt-2 font-semibold text-primary">
              Processing Request..
            </p>
            <p className="text-mute">Please wait...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <div className="mb-4 flex w-full items-center justify-between">
          <Heading className="text-2xl">Claim Details</Heading>
          <button
            className="rounded-full border border-red-500 p-1 text-red-500"
            onClick={() => modal.hide()}
          >
            <Icon icon="close" />
          </button>
        </div>
        <div className="flex justify-between mobile:flex-col widescreen:flex-row widescreen:gap-5">
          <div className="flex items-center gap-2">
            <Heading>Status:</Heading>
            <p className="font-semibold uppercase text-secondary">
              {claimData.policyDetails.status}
            </p>
          </div>
          {claimData.policyDetails.claimExpiry && (
            <div className="mt-1 flex items-center gap-2">
              <Heading>Expires:</Heading>
              <p className="font-semibold uppercase text-secondary">
                {moment(claimData.policyDetails.claimExpiry).fromNow()}
              </p>
            </div>
          )}
          {claimData.policyDetails.premium && (
            <div className="mt-1 flex items-center gap-2">
              <Heading>Premium Amount:</Heading>
              <p className="font-semibold uppercase text-secondary">
                {usdjHook.divideByDecimals(
                  BigInt(claimData.policyDetails.premium || 0n),
                )}{" "}
                USDJ
              </p>
            </div>
          )}
        </div>

        {claimData.policyDetails.args && (
          <div className="mt-2 flex flex-col gap-1">
            <Heading>Premium Function Arguments:</Heading>
            <div className="rounded-xl border border-border p-2">
              {Object.entries(claimData.policyDetails.args).map(
                ([key, value]) => (
                  <p
                    key={key}
                    className="font-mono text-xs font-semibold text-secondary"
                  >
                    {key}: {value}
                  </p>
                ),
              )}
            </div>
          </div>
        )}

        <div className="mt-2 flex flex-col gap-1">
          <Heading>Claim Function:</Heading>
          <div className="rounded-xl border border-border p-2">
            <pre className="font-mono text-xs font-semibold text-secondary">
              {claimData.claimFuctionDetails.function}
            </pre>
          </div>
        </div>

        <DataForm
          className="mt-2 flex w-full flex-col"
          callback={checkValidity}
        >
          <div className="flex flex-col gap-1">
            <Heading>Claim Function Arguments:</Heading>
            <div className="mt-2 flex flex-col gap-y-4 rounded-xl border border-border bg-secondary/5 p-4">
              {claimData.claimFuctionDetails.args &&
              claimData.claimFuctionDetails.args.length > 0 ? (
                claimData.claimFuctionDetails.args.map(
                  (arg: any, key: number) => {
                    if (
                      arg.name === "claimValue" ||
                      arg.name === "claimDuration"
                    )
                      return null;

                    return (
                      <div key={key} className="flex w-full flex-col gap-y-2">
                        <div className="flex gap-x-2">
                          <Heading className="capitalize">{arg.name}:</Heading>
                          <p className="text-front/80">{arg.description}</p>
                        </div>
                        <input
                          type={arg.htmlType}
                          className={twMerge(
                            "rounded-md border border-border bg-background p-2 text-lg shadow shadow-mute/30",
                            "w-full",
                          )}
                          placeholder={arg.htmlType}
                          name={arg.name}
                          required
                        />
                      </div>
                    );
                  },
                )
              ) : (
                <p className="text-front/80 text-mute">No Arguments required</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 self-end">
            <button
              className={twMerge(
                "mt-6 w-max rounded-lg border border-white/70 px-6 py-2 font-bold text-white/70 transition-all duration-75 ease-in hover:bg-white/10 hover:text-zinc-400",
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
                "mt-6 w-max rounded-lg border border-secondary px-6 py-2 font-bold text-secondary transition-all duration-75 hover:bg-secondary/30 hover:text-zinc-100",
                loading ? "animate-pulse" : "",
              )}
              type="submit"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Submit Claim"}
            </button>
          </div>
        </DataForm>
      </div>
    </div>
  );
}
