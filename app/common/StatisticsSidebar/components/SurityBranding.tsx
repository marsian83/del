// @ts-nocheck
import React from "react";

export default function SurityBranding() {
  return (
    <div className="my-10 flex flex-col items-center opacity-20">
      {[
        "J",
        "U",
        "S",
        "T",
        "I",
        "N",
        "S",
        "U",
        "R",
        "E",
        " ",
        " ",
        " ",
        " ",
        "J",
        "U",
        "S",
        "T",
        "I",
        "N",
        "S",
        "U",
        "R",
        "E",
        " ",
        " ",
        " ",
        " ",
        "J",
        "U",
        "S",
        "T",
        "I",
        "N",
        "S",
        "U",
        "R",
        "E",
      ]
        .toReversed()
        .map((word, key) => (
          <div className="-my-1 -rotate-90 text-[1.26vw] font-bold" key={key}>
            {word}
          </div>
        ))}
    </div>
  );
}
