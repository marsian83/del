import React, { useState } from "react";
import DocTitle from "../../common/DocTitle";
import { Link } from "react-router-dom";
import useWeb3 from "../../contexts/web3context";
import { AuroraBackground } from "../../components/ui/aurora-background";

export default function HomePage() {
  const { user } = useWeb3();

  return (
    <div>
      <DocTitle title="What's New" />

      {/* Mobile */}
      <div className="p-page py-8">
        {/* Logo on Mobile */}
        <div className="relative mb-4 hidden w-full items-center justify-center rounded-md border border-border bg-white p-4 bg-dot-black/[0.2] sm:pr-12 mobile:flex dark:bg-background dark:bg-dot-white/[0.2]">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-background" />

          <img src="/logo.png" alt="logo" className="w-12 sm:w-32" />

          <div className="flex flex-col items-start gap-y-1 sm:pb-4">
            <div className="relative">
              <h1 className="text-2xl font-black tracking-wider sm:text-4xl">
                JustInsure
              </h1>
              {user?.marketer && (
                <div className="group">
                  <p className="absolute left-full top-0 -translate-y-1/4 translate-x-1 rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    Pro
                  </p>

                  <p className="pointer-events-none absolute -right-7 -top-2 z-20 translate-y-full whitespace-nowrap rounded-lg border border-border bg-background p-2 text-xs opacity-0 duration-300 group-hover:translate-y-1/2 group-hover:opacity-100">
                    "Pro" indicates that you are a marketer and you can list
                    <br />
                    policies on our platform
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs font-semibold text-primary">
              Rest assured on Web3
            </p>
          </div>
        </div>

        <div className="flex gap-6 mobile:flex-col-reverse">
          <article className="relative flex h-[60vh] w-1/4 flex-col items-center gap-y-4 overflow-hidden rounded-lg border border-zinc-700 bg-mute/20 px-3 py-4 text-center text-zinc-100 bg-dot-white/[0.1] mobile:w-full mobile:gap-y-2">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-background" />

            <p className="z-10 text-lg font-bold">Soparu the Rabbit</p>
            <p className="z-10">
              Has an interesting backstory of how she went from being a farmer
              to working with Insurances on Web3 with JustInsure...
            </p>

            <p className="z-10 -mb-1 mt-1 font-medium">Did you know?</p>
            <p className="z-10 -my-1 text-xs">Soparu the Rabbit is a Robbot</p>
            <p className="z-10 -my-1 text-xs">
              Soparu the Rab(bit) is holding BTTC
            </p>

            <img
              className="aspect-square translate-y-[10%] scale-[115%]"
              src="/images/soparu-on-farm.jpg"
            />
          </article>
          <div className="flex w-3/4 flex-col gap-6 mobile:w-full">
            <article className="rounded-xl border border-border">
              <AuroraBackground className="rounded-xl">
                <div className="overflow-b-hidden flex">
                  <img
                    src="/images/soparu.webp"
                    alt="sopo mascot"
                    className="w-1/4 -translate-y-3 scale-125 mobile:hidden mobile:w-1/2"
                  />
                  <div className="flex flex-col gap-y-5 px-4 py-4 text-zinc-100/90">
                    <p className="flex items-start text-3xl font-medium">
                      JustInsure Early Access
                      <span className="pl-1 text-sm font-normal">
                        * testnet
                      </span>
                    </p>

                    <p className="text-sm">
                      We would really appreciate if you could take out some time
                      to fill out a survey. We are bringing insurance to
                      blockchain and we would love to hear about it from you!
                    </p>

                    <div className="flex">
                      <button
                        onClick={() =>
                          window.open("https://forms.gle/eKgCiw8u9R5haZK86")
                        }
                        className="rounded-md border border-border bg-background px-6 py-2 font-medium transition-all hover:bg-zinc-800"
                      >
                        Take Survey
                      </button>
                    </div>
                  </div>
                </div>
              </AuroraBackground>
            </article>

            <article
              onClick={() => {
                window.open("https://bttc.bittorrent.com/");
              }}
              className="group relative flex h-[50rem] w-full flex-1 cursor-pointer items-center justify-center rounded-lg border border-border bg-white bg-dot-black/[0.2] mobile:py-16 dark:bg-background dark:bg-dot-white/[0.2]"
            >
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-background" />

              <div className="relative z-10 flex items-center gap-x-2 rounded-full border border-border bg-zinc-900/80 px-5 py-3 text-white duration-200 hover:bg-zinc-800/80">
                Powered By
                <img src="/icons/bttc.png" alt="bttc" className="h-[2em]" />
                BitTorrent Chain
              </div>

              <p className="absolute bottom-3 right-2 z-10 flex items-center gap-x-1 rounded-full bg-red-100 px-3 text-xs text-accent2">
                Coming soon to the
                <img src="/icons/tron.svg" alt="tron" className="h-[2em]" />
                Tron Network
              </p>
            </article>
          </div>
        </div>
        <Link
          to="https://t.me/surity_bot"
          target={`_newABC`}
          className="mt-8 flex w-full items-start justify-center"
        >
          <div className="group relative">
            <div className="absolute -inset-0.5 animate-tilt rounded-lg bg-gradient-to-r from-primary to-secondary opacity-75 blur transition duration-100 group-hover:opacity-100 group-hover:duration-200"></div>
            <button className="relative flex items-center rounded-lg border border-primary bg-background px-7 py-4 leading-none mobile:flex-col mobile:gap-y-2 widescreen:divide-x widescreen:divide-zinc-600">
              <span className="flex items-center space-x-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-6 w-6 text-secondary"
                >
                  <path d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56-.72 0-.6-.27-.84-.95L6.3 13.7l-5.45-1.7c-1.18-.35-1.19-1.16.26-1.75l21.26-8.2c.97-.43 1.9.24 1.53 1.73z" />
                </svg>

                <span className="whitespace-nowrap pr-6 text-gray-100">
                  We are live on Telegram
                </span>
              </span>
              <span className="whitespace-nowrap pl-6 text-secondary transition duration-200 group-hover:text-gray-100">
                Click here to try it &rarr;
              </span>
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
}

function MappedOptions(props: { options: Array<Option> }) {
  const { options } = props;

  const [selected, setSelected] = useState(0);

  const furtherOptions = options[selected].options;

  return (
    <div className="flex flex-col">
      <div className="flex gap-x-2">
        <select
          className="text-front"
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

        <div className="flex gap-x-2">
          {options[selected].customElements?.map((ele, key) => (
            <div key={key}>{ele}</div>
          ))}
        </div>

        <div className="flex gap-x-2">
          {options[selected].additionalInputs?.map((inp, key) => (
            <input key={key} {...inp} className="px-2 text-front" />
          ))}
        </div>
      </div>

      {options[selected].info && <p>{options[selected].info}</p>}

      <div className="">
        {furtherOptions?.length && <MappedOptions options={furtherOptions} />}
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
    info: "Triggers when any amount is received in the pool, whether from Staking or by recieving premium.",
    options: [
      {
        title: "Recieved amout greater than",
        additionalInputs: [{ type: "number" }],
      },
    ],
    additionalInputs: [{ type: "date" }],
    customElements: [
      <select key="durationFormat" className="text-front">
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
    info: "Triggers when any amount is received in the pool, whether from Staking or by recieving premium.",
    options: [
      {
        title: "Recieved amout greater than",
        additionalInputs: [{ type: "number" }],
      },
      {
        title: "Recieved amout in range of",
        additionalInputs: [{ type: "number" }, { type: "number" }],
      },
    ],
  },
  {
    title: "Received Deposit In Pool through premium",
    info: "Triggers when any amount is received in the pool, whether from Staking or by recieving premium.",
    options: [
      {
        title: "Recieved amout greater than",
        additionalInputs: [{ type: "number" }],
      },
      {
        title: "Recieved amout in range of",
        additionalInputs: [{ type: "number" }, { type: "number" }],
      },
    ],
  },
  {
    title: "Received general deposit In Pool",
    info: "Triggers when any amount is received in the pool, whether from Staking or by recieving premium.",
    options: [
      {
        title: "Recieved amout greater than",
        additionalInputs: [{ type: "number" }],
      },
      {
        title: "Recieved amout in range of",
        additionalInputs: [{ type: "number" }, { type: "number" }],
      },
    ],
  },
];

// {
//   (
//     <div className="flex flex-col gap-y-4 mt-4 p-page w-max">
//       <div className="flex gap-x-2">
//         <span>When should this be run</span>
//         <select className="text-front ml-2" onChange={handleOption1Change}>
//           <option value="">Select an option</option>
//           {Object.keys(options).map((option, i) => (
//             <option key={i} value={option}>
//               {option}
//             </option>
//           ))}
//         </select>
//       </div>

//       {selectedOption1 && (
//         <div className="flex gap-x-2">
//           <span>Additional Condition</span>
//           <select className="text-front ml-2" onChange={handleOption2Change}>
//             <option value="">Select an option</option>
//             {options[selectedOption1] &&
//               Object.keys(options[selectedOption1]).map((option, i) => (
//                 <option key={i} value={option}>
//                   {option}
//                 </option>
//               ))}
//           </select>
//         </div>
//       )}

//       {selectedOption2 && (
//         <div className="flex gap-x-2">
//           <span>invest in</span>
//           <select className="text-front ml-2" onChange={handleOption3Change}>
//             <option value="" className="px-2">
//               Select an option
//             </option>
//             {options[selectedOption1] &&
//               options[selectedOption1][selectedOption2] &&
//               options[selectedOption1][selectedOption2].map((option, i) => (
//                 <option key={i} value={option}>
//                   {option}
//                 </option>
//               ))}
//           </select>
//         </div>
//       )}
//     </div>
//   );
// }
