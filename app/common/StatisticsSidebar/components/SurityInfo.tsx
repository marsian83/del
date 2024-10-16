import React, { useEffect, useState } from "react";
import Icon, { IconType } from "../../Icon";
import { Link } from "react-router-dom";

export default function SurityInfo() {
  const [seed, setSeed] = useState(Date.now());

  useEffect(() => {
    setInterval(() => {
      setSeed(Date.now());
    }, 500);
  }, []);

  return (
    <div className="flex flex-col gap-y-1 border-t border-border px-6 py-4 text-sm font-semibold">
      <div className="relative mb-3 overflow-hidden rounded-lg bg-primary p-2">
        <div className="absolute-cover bg-gradient-to-r from-transparent to-front/50" />

        <div className="relative z-10 flex">
          <div className="items-centers flex w-1/4 flex-col">
            <img src="/logo.png" alt="logo" className="brightness-0 invert" />
            <p className="text-lg font-black">JustInsure</p>
          </div>

          <figure role="separator" className="flex-1" />

          {/* <div className="flex flex-col text-red-500 text-end font-bold">
            <figure role="separator" className="flex-1" />

            <p className="pl-2 text-xs">Powered by</p>
            <div className="flex items-center">
              <img
                src="/icons/tron.svg"
                alt="tron"
                className="aspect-square w-[1.5em]"
              />
              <p className="text-sm">TRON Network</p>
            </div>
          </div> */}
        </div>
      </div>

      <div className="flex gap-x-2 text-xs" key={seed} translate="no">
        <p>{new Date(Date.now()).toLocaleTimeString()}</p>
        <p>{new Date(Date.now()).toDateString()}</p>
      </div>

      <div className="mt-1 flex items-center gap-x-2">
        Socials
        {socialLinks.map((social, key) => (
          <Link to={social.link} key={key}>
            <div className="flex items-center justify-center overflow-hidden rounded-full object-cover">
              <img
                src={social.imgUrl}
                className="w-[1.5vw] rounded-full object-cover"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const socialLinks: Array<{ link: string; imgUrl: string }> = [
  {
    link: "https://github.com/justinsure-dapp/core",
    imgUrl:
      "https://cdn.pixabay.com/photo/2022/01/30/13/33/github-6980894_1280.png",
  },
  {
    link: "https://forum.trondao.org/t/justinsure-decentralized-insurance-market-platform/27019",
    imgUrl:
      "https://cdn.iconscout.com/icon/premium/png-256-thumb/tron-4441424-3679719.png?f=webp",
  },
  {
    link: "https://devpost.com/software/justinsure",
    imgUrl:
      "https://seeklogo.com/images/D/devpost-logo-95FF685C5D-seeklogo.com.png",
  },
  {
    link: "https://x.com/JustInsureDapp",
    imgUrl: "https://m.media-amazon.com/images/I/61w1Q5OxE2L.jpg",
  },
];
