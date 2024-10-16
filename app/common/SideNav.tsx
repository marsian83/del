import { NavLink } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import Icon, { IconType } from "./Icon";
import useWeb3 from "../contexts/web3context";
import { useState } from "react";

export default function Navbar() {
  const { user } = useWeb3();
  const [showNav, setShowNav] = useState(false);

  return (
    <>
      <nav className="flex w-[16rem] flex-col border-r border-border p-6 mobile:hidden">
        <div
          className="relative flex cursor-pointer items-center gap-x-2"
          role="button"
          onClick={() => null}
        >
          <img src="/logo.png" alt="logo" className="aspect-square w-10" />
          <div className="flex flex-col items-start gap-y-1">
            <div className="relative">
              <h1 className="text-2xl font-black tracking-wider">JustInsure</h1>
              {user?.marketer && (
                <div className="group">
                  <p className="absolute left-full top-0 -translate-y-1/4 translate-x-1 rounded-full bg-primary px-1 text-[10px] font-bold text-zinc-100">
                    Pro
                  </p>

                  <p className="pointer-events-none absolute left-10 z-20 translate-y-full whitespace-nowrap rounded-lg border border-border bg-background p-2 text-xs opacity-0 duration-300 group-hover:translate-y-1/2 group-hover:opacity-100">
                    "Pro" indicates that you are a marketer and you can list
                    <br />
                    policies on our platform
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs font-semibold text-secondary">
              Rest assured on Web3
            </p>
          </div>
        </div>

        <div role="list" className="flex flex-col gap-y-2 py-4">
          {navItems.map((item, key) => (
            <NavLink
              to={item.link}
              key={key}
              role="listitem"
              className={({ isActive, isPending }) =>
                twMerge(
                  "rounded-lg p-2",
                  isActive && "pointer-events-none bg-primary text-zinc-100",
                  !isActive && "hover:outline hover:outline-[1.5px]",
                  isPending && "pointer-events-none animate-pulse",
                  item.marketersOnly && (user?.marketer ? "" : "hidden"),
                )
              }
            >
              <span className="flex items-center gap-x-2 text-base font-semibold">
                <Icon icon={item.icon} className="text-lg" />
                {item.title}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>

      <button
        className="absolute right-4 top-[12px] z-[102] rounded-lg border border-border bg-foreground p-[6px] text-2xl text-front widescreen:hidden"
        onClick={() => setShowNav(!showNav)}
      >
        <Icon icon="menu" />
      </button>

      {showNav && (
        <nav className="absolute right-0 top-0 z-30 mt-12 flex h-full w-[16rem] flex-col border-l border-border bg-background p-6 widescreen:hidden">
          <div
            className="relative flex cursor-pointer items-center gap-x-2"
            role="button"
            onClick={() => null}
          >
            <img src="/logo.png" alt="logo" className="aspect-square w-10" />
            <div className="flex flex-col items-start gap-y-1">
              <div className="relative">
                <h1 className="text-2xl font-black tracking-wider">
                  JustInsure
                </h1>
                {user?.marketer && (
                  <div className="group">
                    <p className="absolute left-full top-0 -translate-y-1/4 translate-x-1 rounded-full bg-primary px-1 text-[10px] font-bold text-zinc-100">
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
              <p className="text-xs font-semibold text-secondary">
                Rest assured on Web3
              </p>
            </div>
          </div>

          <div role="list" className="flex flex-col gap-y-2 py-4">
            {navItems.map((item, key) => (
              <NavLink
                onClick={() => setShowNav(false)}
                to={item.link}
                key={key}
                role="listitem"
                className={({ isActive, isPending }) =>
                  twMerge(
                    "rounded-lg p-2 transition-all hover:bg-zinc-800",
                    isActive && "pointer-events-none bg-primary text-zinc-100",
                    !isActive &&
                      "outline-zinc-500 hover:outline hover:outline-[1px]",
                    isPending && "pointer-events-none animate-pulse",
                    item.marketersOnly && (user?.marketer ? "" : "hidden"),
                  )
                }
              >
                <span className="flex items-center gap-x-2 text-base font-semibold">
                  <Icon icon={item.icon} className="text-lg" />
                  {item.title}
                </span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}

const navItems: Array<{
  title: string;
  link: string;
  icon: IconType;
  marketersOnly?: boolean;
}> = [
  { title: "Home", link: "/", icon: "home" },
  { title: "Account", link: "/account", icon: "person" },
  {
    title: "Dashboard",
    link: "/dashboard",
    icon: "analytics",
    marketersOnly: true,
  },
  { title: "Policies", link: "/policies", icon: "description" },
  {
    title: "Marketing",
    link: "/new-policy",
    icon: "filter",
    marketersOnly: true,
  },
  {
    title: "Swap",
    link: "/swap",
    icon: "swap",
  },
  { title: "SureCoin", link: "/surecoin", icon: "accountBalance" },
  { title: "Settings", link: "/settings", icon: "settings" },
  {
    title: "Developers",
    link: "/developers",
    icon: "code",
    marketersOnly: true,
  },
  { title: "Accessibility", link: "/accessibility", icon: "accessibility" },
];
