"use client";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import type { Transport } from "viem";
import { createConfig, http } from "wagmi";
import {
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
  optimism,
  optimismGoerli,
  arbitrum,
  arbitrumGoerli,
  zkSync,
  zkSyncSepoliaTestnet,
  linea,
  lineaTestnet,
  base,
  baseGoerli,
  bsc,
  bscTestnet,
} from "wagmi/chains";

// import linea_logo from "../public/img/linea_logo.png";
import lineaTesnet_logo from "../public/img/lineaTesnet_logo.png";
import zksync_logo from "../public/img/zksync_logo.svg";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error(
    "WalletConnect project ID is not defined. Please check your environment variables.",
  );
}

const hardhat = {
  id: 31337,
  name: "Hardhat Local",
  network: "hardhat",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
    public: {
      http: ["http://127.0.0.1:8545"],
    }
  },
  blockExplorers: {
    default: { name: "Hardhat Explorer", url: "http://127.0.0.1:8545" },
  },
  testnet: true,
};

const goChainTestnet = {
  id: 60,  // GoChain mainnet ID is 60, testnet should be different
  name: "GoChain Testnet",
  network: "gochain-testnet",
  nativeCurrency: {
    name: "GoChain",
    symbol: "GO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.gochain.io"],
    },
  },
  blockExplorers: {
    default: { name: "GoChain Explorer", url: "https://testnet-explorer.gochain.io" },
  },
  testnet: true,
};

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
        ledgerWallet,
        rabbyWallet,
        coinbaseWallet,
        argentWallet,
        safeWallet,
      ],
    },
  ],
  { appName: "Next-Web3-Boilerplate", projectId: walletConnectProjectId },
);

// Fix missing icons
// const customZkSyncSepoliaTestnet = { ...zkSyncSepoliaTestnet, iconUrl: zksync_logo.src };
// const customLinea = { ...linea, iconUrl: linea_logo.src };
// const customLineaTestnet = { ...lineaTestnet, iconUrl: lineaTesnet_logo.src };

const transports: Record<number, Transport> = {
  [goChainTestnet.id]: http(),
  [hardhat.id]: http(),
  [mainnet.id]: http(),
  [sepolia.id]: http(),
  [polygon.id]: http(),
  [polygonMumbai.id]: http(),
  [optimism.id]: http(),
  [optimismGoerli.id]: http(),
  [arbitrum.id]: http(),
  [arbitrumGoerli.id]: http(),
  // [zkSync.id]: http(),
  // [zkSyncSepoliaTestnet.id]: http(),
  // [linea.id]: http(),
  // [lineaTestnet.id]: http(),
  [base.id]: http(),
  [baseGoerli.id]: http(),
  [bsc.id]: http(),
  [bscTestnet.id]: http(),
};

export const wagmiConfig = createConfig({
  chains: [
    hardhat,  
    goChainTestnet,  
    mainnet,
    sepolia,
    polygon,
    polygonMumbai,
    optimism,
    optimismGoerli,
    arbitrum,
    arbitrumGoerli,
    zkSync,
    zkSyncSepoliaTestnet,
    linea,
    lineaTestnet,
    base,
    baseGoerli,
    bsc,
    bscTestnet,
  ],
  transports: {
    [hardhat.id]: http(),  
    [goChainTestnet.id]: http(),  
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
    [optimism.id]: http(),
    [optimismGoerli.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumGoerli.id]: http(),
    [zkSync.id]: http(),
    [zkSyncSepoliaTestnet.id]: http(),
    [linea.id]: http(),
    [lineaTestnet.id]: http(),
    [base.id]: http(),
    [baseGoerli.id]: http(),
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
  connectors: connectorsForWallets(
    [
      {
        groupName: "Recommended",
        wallets: [
          metaMaskWallet,
          rabbyWallet,
          walletConnectWallet,
          coinbaseWallet,
          safeWallet,
          ledgerWallet,
          argentWallet,
          rainbowWallet,
        ],
      },
    ],
    {
      appName: "IPFS Storage dApp",
      projectId: walletConnectProjectId,
    },
  ),
});
