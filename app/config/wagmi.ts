import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { optimism } from "wagmi/chains";

const wagmiConfig = getDefaultConfig({
  appName: "JustInsure",
  projectId: "756f8ad5a4c44ce4fbd9897445a10187",
  chains: [optimism],
});

export default wagmiConfig;
