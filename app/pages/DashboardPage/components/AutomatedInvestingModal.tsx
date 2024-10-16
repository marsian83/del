import { useState } from "react";
import { twMerge } from "tailwind-merge";
import Heading from "../../NewPolicyPage/components/Heading";
import Icon from "../../../common/Icon";
import useModal from "../../../hooks/useModal";

const twInputStyle =
  "text-lg rounded-md p-2 bg-background border border-border shadow shadow-mute/30";

export default function AutomatedInvestingModal() {
  const modal = useModal();
  const [mappedOptions, setMappedOptions] = useState([
    <InitialMappedOption key={1} />,
  ]);

  const addTriggerEvent = () => {
    const newIndex = mappedOptions.length + 1;
    const newMappedOption = (
      <div
        key={newIndex}
        className="relative rounded-lg border border-front/20 bg-front/5 p-4"
      >
        <button
          className="absolute right-2 top-2"
          onClick={() => removeTriggerEvent(newIndex)}
        >
          <Icon icon="close" />
        </button>{" "}
        <Heading className="text-lg">Trigger Event {newIndex}</Heading>
        <MappedOptions options={options} disabled={false} />
      </div>
    );
    setMappedOptions([...mappedOptions, newMappedOption]);
  };

  const removeTriggerEvent = (indexToRemove: number) => {
    const filteredOptions = mappedOptions.filter(
      (option, index) => index + 1 !== indexToRemove,
    );
    setMappedOptions(filteredOptions);
  };

  return (
    <div className="scrollbar-primary relative flex max-h-[70vh] flex-col gap-y-6 overflow-scroll rounded-xl border border-front/60 bg-background px-6 pt-6 mobile:max-w-[90vw]">
      <button
        className="absolute right-4 top-4 rounded-full border border-red-500 p-1 text-red-500"
        onClick={() => modal.hide()}
      >
        <Icon icon="close" className="text-[1.5rem]" />
      </button>
      <h1 className="text-2xl font-bold">Automate Investing</h1>
      {mappedOptions}
      <button
        className="o flex w-max cursor-pointer items-center gap-x-3 rounded-lg border border-front/20 bg-front/5 px-3 py-3 hover:bg-front/10"
        onClick={addTriggerEvent}
      >
        Add another Trigger event{" "}
        <span className="rounded-full border p-1">
          <Icon icon="add" />
        </span>{" "}
      </button>
      <button className="self-end rounded-lg bg-primary px-3 py-1 text-lg font-bold text-front">
        Submit
      </button>
    </div>
  );
}

function InitialMappedOption() {
  return (
    <div
      key={1}
      className="rounded-lg border border-front/20 bg-front/5 px-4 py-2"
    >
      <Heading className="text-lg">Trigger Event 1</Heading>
      <MappedOptions options={options} disabled={false} />
    </div>
  );
}

export function MappedOptions(props: {
  options: Array<Option>;
  disabled: boolean;
}) {
  const { options } = props;
  const [selected, setSelected] = useState(0);
  const furtherOptions = options[selected].options;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-wrap items-end gap-x-2 gap-y-2">
          <select
            disabled={props.disabled}
            className={twMerge("mobile:w-[90vw]", twInputStyle)}
            defaultValue={options[0].value || options[0].title}
            onChange={(e) => {
              options.forEach(
                (o, i) =>
                  (o.value || o.title) === e.currentTarget.value &&
                  setSelected(i),
              );
            }}
          >
            {options.map((option, key) => (
              <option key={key} value={option.value || option.title}>
                {option.title}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-x-2">
            <div className="flex gap-x-2">
              {options[selected].additionalInputs?.map((inp, key) => (
                <input
                  key={key}
                  {...inp}
                  className={twMerge("w-max mobile:w-[30vw]", twInputStyle)}
                  disabled={props.disabled}
                />
              ))}
            </div>

            <div className="flex gap-x-2">
              {options[selected].customElements?.map((ele, key) => (
                <div key={key}>{ele}</div>
              ))}
            </div>
          </div>
        </div>

        {options[selected].info && (
          <p className="mobile:text-sm">{options[selected].info}</p>
        )}
      </div>

      <div className="mt-4">
        {furtherOptions?.length && (
          <MappedOptions options={furtherOptions} disabled={props.disabled} />
        )}
      </div>
    </div>
  );
}

interface Option {
  title: string;
  value?: string;
  info?: string;
  additionalInputs?: Array<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >
  >;
  options?: Array<Option>;
  customElements?: JSX.Element[];
}

const options: Array<Option> = [
  {
    title: "Time Duration Passed",
    info: "Triggers when any amount is received in the pool, whether from Staking or by receiving premium.",
    options: [
      {
        title: "Received amount greater than",
        additionalInputs: [{ type: "number" }],
      },
    ],
    additionalInputs: [{ type: "number" }],
    customElements: [
      <select key="durationFormat" className={twMerge("w-max", twInputStyle)}>
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
