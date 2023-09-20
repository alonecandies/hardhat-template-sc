import { IConfig } from "./configUtils";

export const PolygonConfig: Record<string, IConfig> = {
  polygon_mainnet: {
    autoVerifyContract: true,
    sleepTime: 60 * 1000,

    vault: {
      enabled: true,
      autoVerifyContract: false,
    },
    token: {
      enabled: true,
      autoVerifyContract: false,
    },

    proxyAdminMultisig: "0x1d8197e9c63b1cbf16ea2896f3eb4241c6a29347",
    adminMultisig: "0x6d3a524873865d72f0534fa593ba1ce9813cc01d",
    maintainerMultisig: "0x1d8197e9c63b1cbf16ea2896f3eb4241c6a29347",
  },

  polygon_staging: {
    sleepTime: 60 * 1000,
    vault: {
      enabled: true,
    },
    token: {
      enabled: true,
      autoVerifyContract: false,
    },
    autoVerifyContract: true,
  },

  polygon_mumbai: {
    sleepTime: 60 * 1000,
    vault: {
      enabled: true,
      autoVerifyContract: true,
    },

    token: {
      enabled: true,
      autoVerifyContract: true,
    },
    autoVerifyContract: true,
    // This is the mainnet one as gnosis doesnt support bsc-testnet, but it doesnt matter on testnet anw
    proxyAdminMultisig: "0x1d8197e9c63b1cbf16ea2896f3eb4241c6a29347",
    adminMultisig: "0x6d3a524873865d72f0534fa593ba1ce9813cc01d",
    maintainerMultisig: "0x1d8197e9c63b1cbf16ea2896f3eb4241c6a29347",
  },
};
