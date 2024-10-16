import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount, WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import wagmiConfig from "../config/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import api, { clearAddress, setAddress } from "../utils/api";
import { Policy, User } from "../types";

interface Web3ContextType {}

const Web3Context = createContext<Web3ContextType>({} as Web3ContextType);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#18181b",
              overlayBlur: "small",
              fontStack: "system",
            })}
          >
            <Wrapper>{children}</Wrapper>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const value = {};
  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export default function useWeb3() {
  return useContext(Web3Context);
}
