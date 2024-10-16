import { useState } from "react";
import { Link } from "react-router-dom";
import SwapBTTtoUSDJ from "./SwapBTTtoUSDJ";
import TestnetBTT from "./TestnetBTT";
import { twMerge } from "tailwind-merge";

export default function Hero() {
  const [showSwap, setShowSwap] = useState(false);

  return (
    <section className="relative flex flex-col items-center gap-y-10 bg-background py-16 text-white">
      <div className="flex w-full flex-col gap-y-16 px-16">
        <div className="self-end">
          <button
            className={twMerge(
              "border px-4 py-2",
              !showSwap
                ? "bg-front/90 text-black"
                : "duration-150 hover:bg-front/10",
            )}
            onClick={() => setShowSwap(false)}
          >
            BTT Faucet
          </button>
          <button
            className={twMerge(
              "border px-4 py-2",
              showSwap
                ? "bg-front/90 text-black"
                : "duration-150 hover:bg-front/10",
            )}
            onClick={() => setShowSwap(true)}
          >
            Swap BTT to USDJ
          </button>
        </div>
        {showSwap ? (
          <SwapBTTtoUSDJ />
        ) : (
          <div className="flex flex-col items-center gap-y-10">
            <TestnetBTT />
            <div className="w-max rounded-md bg-yellow-200 p-2 text-sm text-yellow-900">
              You will receive these tokens on the{" "}
              <Link
                to="https://testfaucet.bt.io/#/"
                target="_blank"
                className="underline underline-offset-2 duration-150 hover:no-underline"
              >
                BTTC Donau Testnet
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-28 w-[60%] text-center text-gray-300">
        Here is a gift from Soparu, A Faucet for BTTC and USDJ, made just for
        you. So that you don't have to roam around looking for testnet tokens.
      </div>
      <img
        src="/images/soparu.webp"
        alt="soparu"
        className="absolute bottom-0 right-3 h-[30vh]"
      />
    </section>
  );
}
