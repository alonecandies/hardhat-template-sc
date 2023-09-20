import { IConfig } from "./configUtils";

export const BscConfig: Record<string, IConfig> = {
  bsc_mainnet: {
    sleepTime: 6 * 1000,
    vault: {
      enabled: true,
    },
    token: {
      enabled: true,
      autoVerifyContract: true,
    },

    proxyAdminMultisig: "0x1d8197e9c63b1cbf16ea2896f3eb4241c6a29347",
    adminMultisig: "0x6d3a524873865d72f0534fa593ba1ce9813cc01d",
    maintainerMultisig: "0x1d8197e9c63b1cbf16ea2896f3eb4241c6a29347",
  },

  bsc_staging: {
    sleepTime: 6 * 1000,
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

  bsc_testnet: {
    sleepTime: 6 * 1000,
    vault: {
      enabled: true,
      autoVerifyContract: true,
    },
    token: {
      enabled: true,
      autoVerifyContract: true,
    },
    autoVerifyContract: true,
    proxyAdminMultisig: "0x1d8197e9c63b1cbf16ea2896f3eb4241c6a29347",
    adminMultisig: "0x6d3a524873865d72f0534fa593ba1ce9813cc01d",
    maintainerMultisig: "0x1d8197e9c63b1cbf16ea2896f3eb4241c6a29347",
  },
};
