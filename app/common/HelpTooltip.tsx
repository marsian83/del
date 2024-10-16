import React from "react";
import { twMerge } from "tailwind-merge";

export default function HelpTooltip(props: {
  className?: string;
  symbol?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative cursor-pointer">
      <figure
        className={twMerge(
          props.className,
          "flex aspect-square h-[1.4em] items-center justify-center rounded-full bg-mute/40 p-1 text-base font-medium text-front",
        )}
      >
        {props.symbol || "?"}
      </figure>
      <div className="pointer-events-none absolute left-0 top-full min-w-[20vw] max-w-[30vw] translate-y-2 select-none rounded-lg border border-border border-front/20 bg-foreground p-2 text-base font-normal opacity-0 duration-500 group-hover:opacity-100">
        {props.children}
      </div>
    </div>
  );
}
