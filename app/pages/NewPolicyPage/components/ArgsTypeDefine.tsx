import React, { useEffect, useRef, useState } from "react";
import Heading from "./Heading";
import { twMerge } from "tailwind-merge";
import Icon from "../../../common/Icon";
import useModal from "../../../hooks/useModal";

export type Args = {
  name: string;
  typeName: string;
  description: string;
  htmlType: string;
}[];

export default function ArgsTypeDefine(props: {
  args: string[];
  className?: string;
  setter?: React.Dispatch<React.SetStateAction<Args>>;
}) {
  const [res, setRes] = useState<Args>([]);

  useEffect(() => {
    props.setter && props.setter([...res]);
  }, [res]);

  useEffect(() => {
    const newRes: Args = [];
    props.args.forEach((a) => {
      if (a === "claimValue" || a === "claimDuration") {
        newRes.push({
          name: a,
          typeName: "Number",
          htmlType: "number",
          description: "",
        });
      } else {
        newRes.push({
          name: a,
          typeName: possibleTypes[0].name,
          htmlType: possibleTypes[0].value,
          description: "",
        });
      }
    });

    console.log(newRes);

    setRes([...newRes]);
  }, []);

  const modal = useModal();
  return (
    <div className={twMerge("flex flex-col gap-y-2", props.className)}>
      {props.args.length > 0 && (
        <Heading className="-mb-2 text-mute">Function Arguments</Heading>
      )}

      {props.args.map((arg, key) => (
        <div key={key} className="flex gap-x-1">
          <div className="flex w-1/2 items-center gap-x-1">
            <h1 className="truncate">{arg}</h1>
            <button
              type="button"
              onClick={() =>
                modal.show(
                  <DescriptionModal args={res} setter={setRes} arg={arg} />,
                )
              }
            >
              <Icon icon="edit" />
            </button>
          </div>
          <div className="flex basis-1/2 flex-col">
            <select
              className="rounded border border-mute/40 bg-background p-1"
              onChange={(e) => {
                const newValue = e.currentTarget.value;
                const newName = possibleTypes.find(
                  (a) => a.value === newValue,
                )?.name;
                const newRes = [...res];
                const prev = newRes.find((a) => a.name === arg);
                newName && prev && (prev.typeName = newName);
                prev && (prev.htmlType = newValue);
              }}
            >
              {possibleTypes.map((type, key) => (
                <option value={type.value} key={key}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

function DescriptionModal(props: {
  arg: string;
  args: Args;
  setter: React.Dispatch<React.SetStateAction<Args>>;
}) {
  const twInputStyle =
    "text-lg rounded-md p-2 bg-background border border-border shadow shadow-mute/30";

  const modal = useModal();

  const inpRef = useRef() as React.MutableRefObject<HTMLTextAreaElement>;

  const res = [...props.args];
  const prev = res.find((e) => e.name === props.arg);
  const description = prev?.description;

  return (
    <div className="relative flex w-[40vw] flex-col gap-y-7 rounded-xl border border-front/40 bg-background p-8">
      <button
        type="button"
        className="absolute right-2 top-2 text-[1.6rem] text-red-500"
        onClick={() => modal.hide()}
      >
        <Icon icon="close" />
      </button>
      <div className="flex flex-col">
        <h1>Argument Name</h1>
        <input className={twMerge(twInputStyle)} value={props.arg} readOnly />
      </div>
      <div className="flex flex-col">
        <h1>Argument Description</h1>
        <textarea
          className={twMerge(twInputStyle, "h-[20vh]")}
          ref={inpRef}
          defaultValue={description}
        />
      </div>
      <button
        type="button"
        className="w-max self-center rounded-lg bg-primary px-3 py-2 font-bold text-front"
        onClick={() => {
          const newDesc = inpRef.current.value;
          const newRes = [...props.args];
          const prev = newRes.find((e) => e.name === props.arg);
          prev && (prev.description = newDesc);
          modal.hide();
        }}
      >
        Save changes
      </button>
    </div>
  );
}

const possibleTypes = [
  { name: "String", value: "text" },
  { name: "Number", value: "number" },
  { name: "URL", value: "url" },
  { name: "Email", value: "email" },
  { name: "Date", value: "date" },
  { name: "Boolean", value: "checkbox" },
] as const;
