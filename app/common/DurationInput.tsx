import { useEffect, useState } from "react";

export default function DurationInput(props: {
  className: string;
  name: string;
  defaultValue: number;
  setter?: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [millis, setMillis] = useState(0);
  const [multiplier, setMultiplier] = useState(props.defaultValue);
  const [inp, setInp] = useState(0);

  useEffect(() => {
    setMillis(inp * multiplier);
  }, [inp, multiplier]);

  useEffect(() => {
    if (props.setter) {
      props.setter(millis);
    }
  }, [millis, props.setter]);

  return (
    <div className="flex gap-x-2">
      <input
        required
        onChange={(e) => {
          setInp(Number(e.currentTarget.value));
        }}
        className={props.className}
        type="number"
        placeholder="Number of"
      />
      <select
        className={props.className}
        defaultValue={props.defaultValue}
        onChange={(e) => setMultiplier(Number(e.currentTarget.value))}
      >
        <option id="hours" value={1000 * 60 * 60}>
          Hours
        </option>
        <option id="days" value={1000 * 60 * 60 * 24}>
          Days
        </option>
        <option id="months" value={1000 * 60 * 60 * 24 * 30}>
          Months
        </option>
        <option id="years" value={1000 * 60 * 60 * 24 * 365}>
          Years
        </option>
      </select>

      <input
        className="hidden"
        type="number"
        name={props.name}
        value={millis}
        readOnly
      />
    </div>
  );
}
