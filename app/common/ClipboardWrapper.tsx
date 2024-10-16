import React from "react";
import { twMerge } from "tailwind-merge";

export default function (props: {
  children?: React.ReactNode;
  textToBeCopied?: string;
  className?: string;
}) {
  return (
    <div
      className={twMerge("group/tiny relative cursor-pointer", props.className)}
      onClick={(e) => {
        props.textToBeCopied &&
          navigator.clipboard.writeText(props.textToBeCopied);
      }}
    >
      <span className="delay-500 duration-300 group-active/tiny:opacity-0 group-active/tiny:delay-0 group-active/tiny:duration-0">
        {props.children}
      </span>
      <span className="absolute-cover select-none whitespace-nowrap text-[0.9em] font-medium opacity-0 brightness-125 saturate-200 delay-500 duration-300 group-active/tiny:opacity-100 group-active/tiny:delay-0 group-active/tiny:duration-0">
        Copied to clipboard
      </span>
    </div>
  );
}
