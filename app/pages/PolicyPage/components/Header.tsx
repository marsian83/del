import React from "react";
import { Policy } from "../../../types";
import useApiResponse from "../../../hooks/useApiResponse";
import api from "../../../utils/api";
import marketer from "../../../utils/api/marketer";
import { calculateAverageRating, formatEvmAddress } from "../../../utils";
import { Link, useNavigate } from "react-router-dom";
import useModal from "../../../hooks/useModal";
import StakeModal from "./StakeModal";
import { useAccount, useReadContract } from "wagmi";
import contractDefinitions from "../../../contracts";
import { Address } from "viem";
import StarRating from "../../../common/StarRating";
import Icon from "../../../common/Icon";
import Heading from "../../NewPolicyPage/components/Heading";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";

export default function Header({ policy }: { policy: Policy }) {
  const { data: user } = useApiResponse(api.user.get, policy.creator);
  const { address } = useAccount();
  const modal = useModal();

  const { data: isPolicyOwner } = useReadContract({
    ...contractDefinitions.insuranceController,
    address: policy.address as Address,
    functionName: "isPolicyOwner",
    args: [address as Address],
  });

  return (
    <div className="flex w-full flex-col items-end gap-2">
      <div className="relative flex w-full flex-col justify-between gap-1 bg-foreground/50 px-6 py-4">
        <div className="flex w-full gap-4 rounded-md">
          <div className="flex w-full max-w-[10rem] flex-col items-center gap-4">
            <img
              src={policy.image}
              className="aspect-square rounded-md object-cover"
              alt="Policy"
            />
            <p className="h-max w-max rounded-xl border border-mute px-3 text-sm md:hidden">
              Category: {policy.category}
            </p>
          </div>
          <div className="flex w-full flex-col justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex w-full flex-col justify-between gap-2 widescreen:flex-row">
                <div>
                  <h1 className="truncate whitespace-nowrap text-3xl font-bold tracking-wider">
                    {policy.name}
                  </h1>
                  <div className="mt-1 flex items-center rounded-xl">
                    <p className="mr-1">
                      {calculateAverageRating({ ratings: policy?.ratings })}
                    </p>
                    <StarRating
                      rating={calculateAverageRating({
                        ratings: policy?.ratings,
                      })}
                    />
                    {isPolicyOwner && (
                      <button
                        className="ml-2 rounded-md bg-primary/80 px-2 py-1 text-sm font-semibold transition-all hover:bg-primary"
                        onClick={() => {
                          modal.show(<RatePolicy policy={policy} />);
                        }}
                      >
                        Rate
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 hidden h-max w-max self-start rounded-xl border border-mute px-3 text-sm md:flex">
                  Category: {policy.category}
                </p>
              </div>
              <p className="mt-1 text-sm text-front/60">
                {`${policy.description.slice(0, 200)}${policy.description.length > 200 ? "..." : ""}`}
              </p>
            </div>

            <div className="flex w-full items-end justify-between">
              <div className="mt-4 flex gap-x-4">
                <img
                  src={user?.marketer?.image}
                  className="aspect-square w-12 rounded-full object-cover shadow-sm"
                />
                <div className="flex flex-col gap-y-1 text-sm">
                  <p>Marketer: {user?.marketer?.name}</p>
                  <p className="text-xs">
                    {user && formatEvmAddress(user?.address)}
                  </p>
                </div>
              </div>

              <div className="hidden gap-x-2 text-sm md:flex">
                <Link
                  to={`/buy-policy/${policy.address}`}
                  className="rounded-2xl border border-border bg-front px-4 py-1 font-semibold text-back transition-all hover:bg-front/80"
                >
                  Buy Policy
                </Link>
                <button
                  className="rounded-2xl border border-border bg-primary px-6 py-1 font-semibold text-front transition-all hover:bg-primary/80"
                  onClick={() => {
                    modal.show(<StakeModal policy={policy} />);
                  }}
                >
                  Stake
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-x-2 md:hidden">
        <Link
          to={`/buy-policy/${policy.address}`}
          className="rounded-2xl border border-border bg-front px-4 py-1 font-semibold text-back transition-all hover:bg-front/80"
        >
          Buy Policy
        </Link>
        <button
          className="rounded-2xl border border-border bg-primary px-6 py-1 font-semibold text-front transition-all hover:bg-primary/80"
          onClick={() => {
            modal.show(<StakeModal policy={policy} />);
          }}
        >
          Stake
        </button>
      </div>
    </div>
  );
}

function RatePolicy({ policy }: { policy: Policy }) {
  const modal = useModal();
  const [rating, setRating] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { address } = useAccount();
  const navigate = useNavigate();

  async function handleRatePolicy() {
    if (!address) {
      toast.error("Connect your wallet.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await api.policy.ratePolicy(
        policy.address,
        address,
        rating,
      );
      toast.success("Rated successfully..");
      console.log(result);
      modal.hide();
      navigate(0);
    } catch (error: any) {
      console.error(error);
      error.response.data.message
        ? toast.error(error.response.data.message)
        : toast.error("Error occurred. Please try again.");
    }
  }

  return (
    <div className="relative flex w-[80vw] max-w-[28rem] flex-col gap-y-1 rounded-lg border border-primary/60 bg-background px-8 py-8">
      <div className="flex items-center justify-between">
        <Heading className="text-xl">Rate Policy</Heading>
        <button
          className="rounded-full border border-red-500 p-1 text-red-500 opacity-50 duration-300 ease-in hover:opacity-100"
          onClick={() => modal.hide()}
        >
          <Icon icon="close" className="text-[1rem] mobile:text-[1rem]" />
        </button>
      </div>

      <div className="flex flex-col">
        <h1 className="flex flex-col gap-y-1 text-sm text-mute">
          How would you rate this policy?
        </h1>
        <div className="mt-2 flex w-fit items-center gap-2 rounded-lg bg-zinc-800 p-2">
          {rating}
          <RatingInputComponent rating={rating} setRating={setRating} />
        </div>
      </div>

      <button
        className={twMerge(
          "mt-3 w-max self-end rounded-lg border border-zinc-400 px-6 py-2 font-bold text-zinc-400 transition-all hover:bg-zinc-800 hover:text-front disabled:pointer-events-none disabled:opacity-50",
          loading ? "animate-pulse" : "",
        )}
        onClick={handleRatePolicy}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}

function RatingInputComponent({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (rating: number) => void;
}) {
  function handleClick(index: number) {
    setRating(index + 1);
  }

  function Star({ filled, onClick }: { filled: boolean; onClick: () => void }) {
    return (
      <svg
        onClick={onClick}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={filled ? "gold" : "gray"}
        width="24px"
        height="24px"
        className="cursor-pointer"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    );
  }

  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          filled={index < rating}
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
}
