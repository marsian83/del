// TradingViewWidget.jsx
import React, { useEffect, useRef, memo, useState } from "react";
import { twMerge } from "tailwind-merge";
import Icon from "./Icon";

function TradingViewWidget(props: {
  className?: string;
  chartType?: string;
  symbol: string;
  maLength?: number;
}) {
  const container = useRef() as React.MutableRefObject<HTMLDivElement>;
  const flag = useRef(false);

  useEffect(() => {
    if (!flag.current) {
      flag.current = true;
      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        symbols: [[props.symbol]],
        chartOnly: false,
        width: "100%",
        height: "100%",
        locale: "en",
        colorTheme: "dark",
        autosize: true,
        showVolume: false,
        showMA: props.maLength ? true : false,
        maLength: props.maLength,
        valuesTracking: "1",
        hideDateRanges: false,
        hideMarketStatus: false,
        hideSymbolLogo: false,
        scalePosition: "right",
        scaleMode: "Normal",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
        fontSize: "10",
        noTimeScale: false,
        changeMode: "price-and-percent",
        allow_symbol_change: false,
        chartType: props.chartType || "area",
        maLineColor: "#2962FF",
        maLineWidth: 1,
        headerFontSize: "medium",
        lineWidth: 2,
        lineType: 0,
        backgroundColor: "rgba(0, 0, 0, 0)",
        dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
      });
      container?.current?.appendChild(script);
    }
  }, []);

  return (
    <div
      className={twMerge(
        props.className,
        "tradingview-widget-container",
        "relative",
      )}
      ref={container}
    >
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow"
          target="_blank"
        >
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
