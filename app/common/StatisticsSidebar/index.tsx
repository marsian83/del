import { useEffect, useRef, useState } from "react";
import StakingStats from "./components/StakingStats";
import SurityInfo from "./components/SurityInfo";
import { twMerge } from "tailwind-merge";
import SurityBranding from "./components/SurityBranding";
import useSureCoinHook from "../../hooks/useSurecoin";
import useModal from "../../hooks/useModal";
import WithdrawSurecoinModal from "./components/WithdrawSurecoinModal";
import { useWatchAsset } from "wagmi";
import evmConfig from "../../../evmConfig";
import { toast } from "react-toastify";
import { formatCompactNumber } from "../../utils";

export default function StatisticsSidebar() {
  const [hidden, setHidden] = useState(false);
  const surecoin = useSureCoinHook();
  const modal = useModal();
  const { watchAsset } = useWatchAsset();

  const balance = surecoin.getUserBalance();
  const earned = surecoin.getUserEarned();

  const flag = useRef(true);
  useEffect(() => {
    if (flag.current) {
      flag.current = false;
      setInterval(() => {
        surecoin.refreshEarned();
      }, 5000);
    }
  }, []);

  return (
    <section className="relative flex h-screen max-w-[20vw] flex-col border-l border-border mobile:hidden">
      {!hidden && (
        <>
          <div className="flex flex-col gap-y-2 px-6 py-3">
            <div className="flex items-center justify-between text-base font-bold text-mute">
              <h1 className="">SureCoin Balance</h1>
              <button
                onClick={() => setHidden(true)}
                className="text-sm text-secondary disabled:hidden"
                disabled={hidden}
              >
                Hide
              </button>
            </div>
            <div className="flex flex-col gap-2 xl:flex-row xl:justify-between">
              <button
                title="Add SURE to your wallet"
                className="flex items-center gap-2 rounded-xl text-sm"
                onClick={() => {
                  toast.info("Adding SURE to your wallet..");
                  watchAsset({
                    type: "ERC20",
                    options: {
                      address: evmConfig.surecoin.address,
                      symbol: "SURE",
                      decimals: surecoin.decimals || 6,
                    },
                  });
                }}
              >
                Balance:
                <p className="font-mono text-xl font-medium text-secondary">
                  {balance ? formatCompactNumber(balance) : "0"}
                </p>
              </button>

              <button
                title="Withdraw SureCoin"
                onClick={() => modal.show(<WithdrawSurecoinModal />)}
                className="flex items-center gap-2 rounded-xl text-sm"
              >
                Earned:
                <p className="animate-pulse font-mono text-xl font-medium text-secondary">
                  {earned ? formatCompactNumber(earned) : "0"}
                </p>
              </button>
            </div>
          </div>

          <StakingStats />

          <figure role="separator" className="flex-1" />

          <SurityInfo />
        </>
      )}

      <div
        className={twMerge(
          "flex flex-col overflow-y-clip",
          hidden ? "h-full" : "",
        )}
      >
        <button
          onClick={() => setHidden(!true)}
          className="px-4 pt-7 text-sm font-bold text-secondary disabled:hidden"
          disabled={!hidden}
        >
          Expand
        </button>

        {hidden && <SurityBranding />}
      </div>
    </section>
  );
}
