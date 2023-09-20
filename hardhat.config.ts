import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-abi-exporter";
require("dotenv").config();

const { PRIVATE_KEY, BSCSCAN_KEY, POLYGON_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    gasPrice: 100,
    enabled: true,
  },
  abiExporter: {
    clear: true,
    path: "./abi",
    runOnCompile: true,
    flat: true,
    spacing: 2,
    pretty: false,
  },
  paths: {
    sources: "./contracts",
    tests: "./test/",
  },
  mocha: {
    timeout: 0,
    parallel: false,
    fullTrace: true,
  },
  networks: {
    hardhat: {
      accounts: {
        count: 10,
      },
    },
    bsctest: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [PRIVATE_KEY || ""],
    },
    polygon_mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [PRIVATE_KEY || ""],
      gasPrice: 5000000000,
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: BSCSCAN_KEY || "",
      polygonMumbai: POLYGON_KEY || "",
    },
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
