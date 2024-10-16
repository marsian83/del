import { twMerge } from "tailwind-merge";
import useModal from "../../../hooks/useModal";
import AutomatedInvestingModal, {
  MappedOptions,
} from "./AutomatedInvestingModal";
import { twInputStyle } from "../../../utils";

export default function AutomatedInvestment() {
  const modal = useModal();
  return (
    <div className="flex flex-col gap-y-3 pb-6">
      <h1 className="text-xl font-bold">Automated Investment Triggers</h1>
      {/* {AutomatedInvestmentTriggers.map((trigger, key) => (
          <div className="flex flex-col gap-y-3 bg-background p-4 rounded-xl">
            <h1 className="text-lg font-bold">
              Trigger Event {key + 1}
            </h1>
            <h2>
              Event:{" "}
              <span className="bg-front/5 rounded-md border border-front/10 px-2 py-1 text-primary">
                {trigger.title}
              </span>
            </h2>
            <h3 className="">
              {trigger.optionTitle}:{" "}
              <span className="bg-front/5 rounded-md border border-front/10 px-2 py-1 text-primary">
                ${trigger.optionValue}{" "}
              </span>
            </h3>
          </div>
        ))} */}

      <div>
        <MappedOptions options={triggers} disabled={true} />
      </div>

      <button
        className="w-max self-end rounded-lg bg-primary px-3 py-1 text-sm font-bold text-front"
        onClick={() => modal.show(<AutomatedInvestingModal />)}
      >
        Edit Automated Investing
      </button>
    </div>
  );
}

const triggers = [
  {
    title: "Time Duration Passed",
    value: "Time Duration Passed",
    info: "Triggers when any amount is received in the pool, whether from Staking or by receiving premium.",
    options: [
      {
        title: "Received amount greater than",
        additionalInputs: [{ type: "number", value: 550 }],
      },
    ],
    additionalInputs: [{ type: "number", value: 456 }],
    customElements: [
      <select
        key="durationFormat"
        className={twMerge("", twInputStyle)}
        value="Days"
        disabled
      >
        <option value="">Select duration format</option>
        {["Days", "Weeks", "Months", "Years"].map((format, index) => (
          <option key={index} value={format}>
            {format}
          </option>
        ))}
      </select>,
    ],
  },
  {
    title: "Received Deposit In Pool through Staking",
    value: "Received Deposit In Pool through Staking",
    info: "Triggers when any amount is received in the pool, whether from Staking or by receiving premium.",
    options: [
      {
        title: "Received amount greater than",
        additionalInputs: [{ type: "number", value: 2345 }],
      },
      {
        title: "Received amount in range of",
        additionalInputs: [
          { type: "number", value: 3434 },
          { type: "number", value: 4398 },
        ],
      },
    ],
  },
  {
    title: "Received Deposit In Pool through premium",
    info: "Triggers when any amount is received in the pool, whether from Staking or by receiving premium.",
    options: [
      {
        title: "Received amount greater than",
        additionalInputs: [{ type: "number" }],
      },
      {
        title: "Received amount in range of",
        additionalInputs: [{ type: "number" }, { type: "number" }],
      },
    ],
  },
  {
    title: "Received general deposit In Pool",
    info: "Triggers when any amount is received in the pool, whether from Staking or by receiving premium.",
    options: [
      {
        title: "Received amount greater than",
        additionalInputs: [{ type: "number" }],
      },
      {
        title: "Received amount in range of",
        additionalInputs: [{ type: "number" }, { type: "number" }],
      },
    ],
  },
];
