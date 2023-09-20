import { IConfig } from "./configUtils";
import { BscConfig } from "./config_bsc";
import { PolygonConfig } from "./config_polygon";

const NetworkConfig: Record<string, IConfig> = {
  ...BscConfig,
  ...PolygonConfig,
};

NetworkConfig.hardhat = {
  // In case of testing, fork the config of the particular chain to hardhat
  ...NetworkConfig["bsc_mainnet"],
  autoVerifyContract: false,
};

export { NetworkConfig };
