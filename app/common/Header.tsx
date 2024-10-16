import { useEffect, useRef, useState } from "react";
import ConnectWallet from "./ConnectWallet";
import Icon from "./Icon";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import useUsdjHook from "../hooks/useUsdj";
import { useAccount, useWatchAsset } from "wagmi";
import { formatCompactNumber } from "../utils";
import { toast } from "react-toastify";
import evmConfig from "../../evmConfig";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { address } = useAccount();
  const usdj = useUsdjHook();
  const { watchAsset } = useWatchAsset();

  const [title, setTitle] = useState("");

  const history = useRef<string[]>([]);

  useEffect(() => {
    history.current.push(location.pathname);

    if (location.pathname == "/") history.current = [];

    setTimeout(() => {
      const titleArr = document.title.split("|");
      setTitle(titleArr.at(titleArr.length - 1) || "Home");
    }, 10);
  }, [location]);

  return (
    <header className="p-page sticky top-0 z-[101] flex items-center justify-between border-b border-border bg-background py-3">
      <div className="flex items-center justify-center">
        <button
          className={twMerge(
            "group pr-2 duration-300",
            history.current.length == 0 && "w-0 scale-0 pr-0",
          )}
          onClick={() => {
            history.current.pop();
            navigate(history.current.pop() || "");
          }}
        >
          <Icon
            icon="back_ios_new"
            className="text-mute group-hover:text-front"
          />
        </button>

        <h1 className="text-xl font-black text-mute mobile:text-base">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-x-4 mobile:mr-10 mobile:scale-90 mobile:gap-x-2">
        <div className="flex items-center gap-x-4">
          <ConnectWallet />
        </div>

        <button
          title="Add USDJ to Wallet"
          className="group hidden rounded-lg border border-mute px-2 py-1 duration-150 ease-in hover:border-zinc-300 hover:text-zinc-300 sm:flex"
          onClick={() => {
            toast.info("Adding USDJ to your wallet");
            watchAsset({
              type: "ERC20",
              options: {
                address: evmConfig.usdj.address,
                symbol: "USDJ",
                decimals: usdj.decimals || 6,
              },
            });
          }}
        >
          <p className="font-sans font-bold">
            ${formatCompactNumber(usdj.getUserBalance())} USDJ
          </p>
        </button>

        <Link
          to="/faucet"
          className="group rounded-lg border border-mute px-2 py-1 duration-150 ease-in hover:border-zinc-300 hover:text-zinc-300"
        >
          <Icon
            icon="money"
            className="text-2xl duration-150 ease-in group-hover:text-zinc-300"
          />
        </Link>
      </div>
    </header>
  );
}
