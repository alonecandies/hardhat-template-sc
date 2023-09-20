export interface IConfig {
  autoVerifyContract?: boolean;
  sleepTime?: number;

  vault?: {
    enabled?: boolean;
    autoVerifyContract?: boolean;
  };

  token?: {
    enabled?: boolean;
    autoVerifyContract?: boolean;
  };

  // For proxy admin
  proxyAdminMultisig?: string;
  // For managing the config and admin jobs
  adminMultisig?: string;
  // For maintaining, minting and some executing jobs
  maintainerMultisig?: string;
}
