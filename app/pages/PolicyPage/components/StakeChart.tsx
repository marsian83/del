import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import useApiResponse from "../../../hooks/useApiResponse";
import api from "../../../utils/api";
import { Policy } from "../../../types";
import { isAddress } from "viem";
import { ApexOptions } from "apexcharts";
import useUsdjHook from "../../../hooks/useUsdj";

export default function StakeChart({ policy }: { policy: Policy }) {
  if (!isAddress(policy.address)) return <></>;

  const feed = useApiResponse(api.policy.getStakeHistory, policy.address);
  const usdj = useUsdjHook();

  console.log(feed.data, "Feed");

  const [chartData, setChartData] = useState<{
    series: { name: string; data: { x: Date; y: number }[] }[];
    options: ApexOptions;
  }>({
    series: [{ name: "Stake", data: [] }],
    options: {
      chart: {
        type: "area",
        stacked: false,
        height: 350,
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true,
        },
        toolbar: {
          autoSelected: "zoom",
        },
      },
      grid: {
        borderColor: "#444",
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 7,
        colors: ["#09090b"],
        strokeColors: "#fefefe",
        strokeWidth: 1,
      },
      stroke: {
        colors: ["#71717a"],
        curve: "smooth",
        width: 2,
      },
      yaxis: {
        labels: {
          style: {
            colors: "#c4cdd3",
          },
          formatter: function (val) {
            return val.toFixed(0);
          },
        },
        title: {
          text: "Stake Amount",
          style: {
            color: "#71717a",
          },
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeFormatter: {
            hour: "HH:mm",
          },
          style: {
            colors: "#71717a",
          },
        },
      },
      tooltip: {
        shared: false,
        theme: "dark",
        style: {
          fontSize: "12px",
        },
        y: {
          formatter: function (val) {
            return val + " USDJ";
          },
        },
      },

      annotations: {
        points: [],
      },
    },
  });

  useEffect(() => {
    if (feed.data) {
      const baseTimestamp = new Date("1970-01-01").getTime();

      const seriesData = feed.data.feed
        .filter((entry: { amount: number | null }) => entry.amount !== null)
        .map((entry: { amount: number; timestamp: number }) => ({
          x: new Date(baseTimestamp + entry.timestamp * 1000),
          y: entry.amount / Math.pow(10, Number(usdj.decimals)) || 0,
        }));

      const transactionPoints = seriesData.map(
        (point: { x: number; y: number }) => ({
          x: point.x,
          y: point.y,
          marker: {
            size: 8,
            fillColor: "#50798c",
            strokeColor: "#fff",
            radius: 3,
          },
          label: {
            text: "Transaction",
            style: {
              color: "#000",
              background: "#50798c",
              fontSize: "12px",
            },
          },
        }),
      );

      setChartData((prevData) => ({
        ...prevData,
        series: [{ name: "Stake", data: seriesData }],
        options: {
          ...prevData.options,
          annotations: {
            points: transactionPoints, // Adding annotations for transactions
          },
        },
      }));
    }
  }, [feed.data]);

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          height={350}
        />
      </div>
    </div>
  );
}
