import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import Icon from "../../../common/Icon";
import TradingViewOverview from "../../../common/TradingViewOverview";

export default function Chart() {
  const [chartType, setChartType] = useState<"candlesticks" | "area">("area");

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-border">
      <div className="absolute right-4 top-2">
        <div className="relative flex gap-x-2 overflow-hidden rounded border border-secondary/50 bg-foreground p-1 text-2xl">
          <figure
            className={twMerge(
              "absolute top-0 z-1 h-full w-1/2 bg-secondary mix-blend-difference duration-300",
              chartType === "area" && "left-0 translate-x-0",
              chartType === "candlesticks" && "left-full -translate-x-full",
            )}
          />

          <button
            onClick={() => {
              setChartType("area");
            }}
          >
            <Icon icon="showChart" />
          </button>

          <button
            onClick={() => {
              setChartType("candlesticks");
            }}
          >
            <Icon icon="candlestickChart" />
          </button>
        </div>
      </div>

      <TradingViewOverview
        className="aspect-video"
        symbol="BINANCE:BTTCUSDT|1Y"
        chartType={chartType}
        key={chartType}
      />
    </div>
  );
}
