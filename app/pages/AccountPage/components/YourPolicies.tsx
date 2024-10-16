import { useState } from "react";
import useModal from "../../../hooks/useModal";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useAccount, useReadContract } from "wagmi";
import useWeb3 from "../../../contexts/web3context";
import { Holder, Policy } from "../../../types";
import contractDefinitions from "../../../contracts";
import { Address } from "viem";
import moment from "moment";
import RequestClaimModal from "./RequestClaimModal";
import ClipboardWrapper from "../../../common/ClipboardWrapper";
import { formatEvmAddress } from "../../../utils";
import Icon from "../../../common/Icon";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function YourPolicies() {
  const [parent] = useAutoAnimate();
  const { address } = useAccount();
  const { policies } = useWeb3();
  const [viewMoreActive, setViewMoreActive] = useState(false);
  const [viewMoreClaimed, setViewMoreClaimed] = useState(false);

  const activePolicies: any[] = [];
  const claimedPolicies: any[] = [];

  policies?.map((p) => {
    p.holders.some((h) => {
      if (address === h.address) {
        activePolicies.push({
          ...p,
          holderDetails: h,
        });
      }
    });

    p.claims.some((c) => {
      if (address === c.address) {
        claimedPolicies.push({
          ...p,
          claimDetails: c,
        });
      }
    });
  });

  return (
    <div className="flex flex-col">
      <div
        ref={parent}
        className="mt-10 flex flex-col gap-y-2 rounded-lg border border-border/20 bg-mute/5 p-2"
      >
        <div className="flex items-center justify-between p-2">
          <div>
            <h1 className="text-2xl font-semibold">Active Policies</h1>
            <p className="mt-1 text-sm text-mute">
              These are your currently active policies, providing ongoing
              coverage based on the terms you selected. You can review their
              details and manage them as needed throughout the coverage period.
            </p>
          </div>
        </div>

        {activePolicies.length === 0 ? (
          <div className="flex h-[20vh] items-center justify-center">
            <h1 className="text-2xl font-semibold text-mute">
              Nothing to show..
            </h1>
          </div>
        ) : (
          activePolicies.map((policy, key) => {
            console.log(policy);

            return (
              (viewMoreActive || key < 2) && (
                <PolicyCard policy={policy} active={true} key={key} />
              )
            );
          })
        )}

        {activePolicies.length > 2 && (
          <button
            className="mr-2 w-max self-end rounded-lg border border-border bg-background px-4 py-2 font-bold text-front transition-all hover:bg-zinc-900"
            onClick={() => setViewMoreActive(!viewMoreActive)}
          >
            {viewMoreActive ? "View Less" : "View More"}{" "}
          </button>
        )}
      </div>

      {/* Policies Claimed */}
      <div
        ref={parent}
        className="mt-10 flex flex-col gap-y-2 rounded-lg border border-border/20 bg-mute/5 p-2"
      >
        <div className="flex items-center justify-between p-2">
          <div>
            <h1 className="text-2xl font-semibold">Inactive Policies</h1>
            <h2 className="mt-1 text-sm text-mute">
              These are your inactive policies, which are no longer providing
              coverage as it might have expired or you have claimed it. You can
              review their details here.
            </h2>
          </div>
        </div>

        {claimedPolicies.length === 0 ? (
          <div className="flex h-[20vh] items-center justify-center">
            <h1 className="text-2xl font-semibold text-mute">
              Nothing to show..
            </h1>
          </div>
        ) : (
          claimedPolicies.map((policy, key) => {
            return (
              (viewMoreClaimed || key < 2) && (
                <PolicyCard policy={policy} key={key} active={false} />
              )
            );
          })
        )}

        {claimedPolicies.length > 2 && (
          <button
            className="mr-2 w-max self-end rounded-lg border border-border bg-background px-4 py-2 font-bold text-front transition-all hover:bg-zinc-900"
            onClick={() => setViewMoreClaimed(!viewMoreClaimed)}
          >
            {viewMoreClaimed ? "View Less" : "View More"}{" "}
          </button>
        )}
      </div>
    </div>
  );
}

function PolicyCard({ policy, active }: { policy: any; active: boolean }) {
  const modal = useModal();
  const { address } = useAccount();

  const { data: isPolicyOwner } = useReadContract({
    ...contractDefinitions.insuranceController,
    address: policy.address as Address,
    functionName: "isPolicyOwner",
    args: [address as Address],
  });

  async function requestClaim() {
    const requestClaimData = {
      premiumFunctionDetails: {
        function: policy.premiumFunc,
        desc: policy.premiumFuncDescription,
        args: policy.premiumFuncArgs,
      },

      policyDetails: {
        address: policy.address,
        premium: policy.holderDetails.premium,
        status: policy.holderDetails.status,
        claimExpiry: policy.holderDetails.claimExpiry,
        args: policy.holderDetails.args,
      },

      claimFuctionDetails: {
        function: policy.claimFunc,
        desc: policy.claimFuncDescription,
        args: policy.claimFuncArgs,
      },
    };

    try {
      modal.show(<RequestClaimModal claimData={requestClaimData} />);
    } catch (error) {
      console.error(error);
      toast.error("Failed to request claim..");
    }
  }

  console.log({
    holderDetails: policy.holderDetails,
    claimDetails: policy.claimDetails,
  });

  return (
    <div className="m-2 flex flex-col rounded-lg bg-background p-4">
      <div className="flex gap-x-4">
        <img
          src={policy.image}
          className="h-24 w-24 rounded-md border border-border/60 object-cover p-1"
        />
        <div className="flex w-full flex-col justify-between">
          <div className="flex w-full items-start justify-between gap-4">
            <div>
              <Link
                to={`/policies/${policy.address}`}
                className="text-xl font-bold capitalize tracking-wide"
              >
                {policy.name}
              </Link>
              <ClipboardWrapper
                textToBeCopied={policy.address}
                className="text-xs text-mute"
              >
                <p className="mt-1 flex items-center gap-x-1">
                  {formatEvmAddress(policy.address)}
                  <Icon icon="contentCopy" />
                </p>
              </ClipboardWrapper>
            </div>

            {active &&
              isPolicyOwner &&
              policy.holderDetails.status === "ongoing" && (
                <button
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold text-front transition-all hover:bg-mute/5"
                  onClick={requestClaim}
                >
                  Request Claim
                </button>
              )}
          </div>

          {isPolicyOwner && active ? (
            <div className="flex gap-x-2 text-sm">
              <p className="rounded-2xl border border-border px-3 py-1">
                Status:{" "}
                <span className="font-semibold text-green-600">Ongoing</span>
              </p>
              {policy.holderDetails.claimExpiry && (
                <p className="rounded-2xl border border-border px-3 py-1">
                  Expires:{" "}
                  <span className="font-semibold text-red-500">
                    {moment(policy.holderDetails.claimExpiry).fromNow()}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <div className="mt-2 text-sm">
              {policy.claimDetails &&
                policy.claimDetails?.status === "approved" && (
                  <div className="flex gap-x-2">
                    <p className="rounded-2xl border border-border px-3 py-1">
                      Status:{" "}
                      <span className="font-bold text-green-600">Claimed</span>
                    </p>
                    <p className="rounded-2xl border border-border px-3 py-1">
                      Claimed:{" "}
                      <span className="font-bold text-yellow-700">
                        {moment(policy.claimDetails.approvedAt).fromNow()}
                      </span>
                    </p>
                    <p className="rounded-2xl border border-border px-3 py-1">
                      Amount:{" "}
                      <span className="font-bold text-secondary">
                        ${policy.claimDetails.amount}
                      </span>
                    </p>
                  </div>
                )}

              {policy.claimDetails &&
                policy.holderDetails?.status === "expired" && (
                  <div className="flex gap-x-2">
                    <div className="rounded-2xl border border-border px-3 py-1">
                      Status:{" "}
                      <span className="font-semibold text-red-600">
                        Expired
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border px-3 py-1">
                      Expired:{" "}
                      <span className="font-bold text-yellow-700">
                        {moment(policy.holderDetails.claimExpiry).fromNow()}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
