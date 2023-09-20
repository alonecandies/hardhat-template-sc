import { ethers, network, run } from "hardhat";
import { NetworkConfig } from "./networkConfig";
import { Vault, Token, VaultImpl, TokenImpl } from "../typechain-types";
import { BaseContract, ContractTransactionResponse } from "ethers";
import { IConfig } from "./configUtils";
import { sleep } from "./helpers";

const networkConfig = NetworkConfig[network.name];
if (!networkConfig) {
  throw new Error(`Missing deploy config for ${network.name}`);
}

export interface Contracts {
  vault?: Vault;
  vaultImplementation?: VaultImpl;

  token?: Token;
  tokenImplementation?: TokenImpl;
}

export const deploy = async (existingContract: Record<string, any> | undefined = undefined): Promise<Contracts> => {
  const [deployer] = await ethers.getSigners();

  const deployerAddress = await deployer.getAddress();

  log(0, "Start deployin contracts");
  log(0, "======================\n");

  let upgradeVault = false;
  let upgradeToken = false;

  if (!existingContract?.["vault"]) {
    upgradeVault = true;
  }

  if (!existingContract?.["token"]) {
    upgradeToken = true;
  }

  let deployedContracts = await deployContracts(existingContract, deployerAddress);

  // if (upgradeVault) {
  //   log(0, "Updating vault config");
  //   log(0, "======================\n");
  //   await updateVaultProxy(deployedContracts);
  // } else {
  //   log(0, "Vault contracts already exists, skipping update");
  // }

  // if (upgradeToken) {
  //   log(0, "Updating token config");
  //   log(0, "======================\n");
  //   await updateTokenProxy(deployedContracts);
  // } else {
  //   log(0, "Token contracts already exists, skipping update");
  // }

  // Summary
  log(0, "Summary");
  log(0, "=======\n");

  log(0, JSON.stringify(convertToAddressObject(deployedContracts), null, 2));

  console.log("\nDeployment complete!");
  return deployedContracts;
};

async function deployContracts(
  existingContract: Record<string, any> | undefined = undefined,
  deployer: string,
): Promise<Contracts> {
  let step = 0;

  return {
    ...(await deployTokenContract(++step, existingContract)),
    ...(await deployVaultContract(++step, existingContract, deployer)),
  };
}

export const deployVaultContract = async (
  step: number,
  existingContract: Record<string, any> | undefined,
  deployer: string,
  customNetworkConfig?: IConfig,
): Promise<Contracts> => {
  const config = { ...networkConfig, ...customNetworkConfig };

  let vault, vaultImplementation;
  if (config.vault?.enabled) {
    vaultImplementation = (await deployContract(
      `${step} >>`,
      config.vault?.autoVerifyContract,
      "VaultImpl",
      existingContract?.["vaultImplementation"],
      undefined,
    )) as VaultImpl;

    if (String(vaultImplementation.target) !== String(existingContract?.["vaultImplementation"])) {
      let initData = (await vaultImplementation.initialize(config.adminMultisig ?? deployer)).data?.toString() ?? "0x";

      vault = (await deployContract(
        `${step} >>`,
        config.vault?.autoVerifyContract,
        "Vault",
        existingContract?.["vault"],
        "contracts/Vault.sol:Vault",
        vaultImplementation.target,
        config.proxyAdminMultisig ?? deployer,
        initData,
      )) as Vault;
    }
  }
  return {
    vault: vault || existingContract?.["vault"],
    vaultImplementation,
  };
};

export const deployTokenContract = async (
  step: number,
  existingContract: Record<string, any> | undefined,
  customNetworkConfig?: IConfig,
): Promise<Contracts> => {
  const config = { ...networkConfig, ...customNetworkConfig };

  let token;
  if (config.token?.enabled) {
    token = (await deployContract(
      `${step} >>`,
      config.token?.autoVerifyContract,
      "Token",
      existingContract?.["token"],
      "contracts/token/Token.sol:Token",
    )) as Token;
  }
  return {
    token,
  };
};

async function deployContract(
  step: number | string,
  autoVerify: boolean | undefined,
  contractName: string,
  contractAddress: string | undefined,
  contractLocation: string | undefined,
  ...args: any[]
): Promise<BaseContract> {
  log(1, `${step}. Deploying '${contractName}'`);
  log(1, "------------------------------------");

  const factory = await ethers.getContractFactory(contractName);
  let contract;

  if (contractAddress) {
    log(2, `> contract already exists`);
    log(2, `> address:\t${contractAddress}`);
    // TODO: Transfer admin if needed
    contract = factory.attach(contractAddress);
  } else {
    contract = await factory.deploy(...args);
    const tx = await contract.waitForDeployment();
    const deploymentTx = tx.deploymentTransaction();
    await printInfo(deploymentTx);
    log(2, `> address:\t${contract.target}`);
  }

  // Only verify new contract to save time or Try to verify no matter what
  if (autoVerify && !contractAddress) {
    // if (autoVerify) {
    try {
      log(3, ">> sleep first, wait for contract data to be propagated");
      await sleep(networkConfig.sleepTime ?? 60000);
      log(3, ">> start verifying");
      if (!!contractLocation) {
        await run("verify:verify", {
          address: contract.target,
          constructorArguments: args,
          contract: contractLocation,
        });
      } else {
        await run("verify:verify", {
          address: contract.target,
          constructorArguments: args,
        });
      }
      log(3, ">> done verifying");
    } catch (e) {
      log(2, "failed to verify contract", e);
    }
  }

  return contract;
}

async function updateVaultProxy({ vault, vaultImplementation }: Contracts) {
  log(1, "Update impl contract");
  if (!vault || !vaultImplementation) {
    log(2, `vault not supported`);
    return;
  }

  // Read directly from the slots. Pls refer to TransparentUpgradeableProxy
  let currentImpl = await ethers.provider.getStorage(
    vault.target,
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
  );
  let currentAdmin = await ethers.provider.getStorage(
    vault.target,
    "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103",
  );

  log(2, `currentImpl = ${currentImpl}`);
  log(2, `currentAdmin = ${currentAdmin}`);

  // bytes32 to address
  currentImpl = "0x" + currentImpl.slice(26, 66);
  if (currentImpl.toLowerCase() === String(vaultImplementation.target).toLowerCase()) {
    log(2, `Impl contract is already up-to-date at ${vaultImplementation.target}`);
  } else {
    await vault.upgradeTo(vaultImplementation.target);
    log(2, `Impl contract is updated from ${currentImpl} to  ${vaultImplementation.target}`);
  }
}

async function updateTokenProxy({ token, tokenImplementation }: Contracts) {
  log(1, "Update impl contract");
  if (!token || !tokenImplementation) {
    log(2, `token not supported`);
    return;
  }

  // Read directly from the slots. Pls refer to TransparentUpgradeableProxy
  let currentImpl = await ethers.provider.getStorage(
    token.target,
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
  );
  let currentAdmin = await ethers.provider.getStorage(
    token.target,
    "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103",
  );

  log(2, `currentImpl = ${currentImpl}`);
  log(2, `currentAdmin = ${currentAdmin}`);

  // bytes32 to address
  currentImpl = "0x" + currentImpl.slice(26, 66);
  if (currentImpl.toLowerCase() === String(tokenImplementation.target).toLowerCase()) {
    log(2, `Impl contract is already up-to-date at ${tokenImplementation.target}`);
  } else {
    await token.upgradeTo(tokenImplementation.target);
    log(2, `Impl contract is updated from ${currentImpl} to ${tokenImplementation.target}`);
  }
}

async function printInfo(tx: ContractTransactionResponse | null) {
  if (!tx) {
    log(5, `> tx is undefined`);
    return;
  }
  const receipt = await tx.wait(1);

  log(5, `> tx hash:\t${tx.hash}`);
  log(5, `> gas price:\t${tx.gasPrice?.toString()}`);
  log(5, `> gas used:\t${!!receipt && receipt.gasUsed.toString()}`);
}

export function convertToAddressObject(obj: Record<string, any> | Array<any> | BaseContract): any {
  if (obj === undefined) return obj;
  if (obj instanceof BaseContract) {
    return obj.target;
  } else if (Array.isArray(obj)) {
    return obj.map((k) => convertToAddressObject(obj[k]));
  } else if (typeof obj == "string") {
    return obj;
  } else {
    let ret = {};
    for (let k in obj) {
      // @ts-ignore
      ret[k] = convertToAddressObject(obj[k]);
    }
    return ret;
  }
}

let prevLevel: number;
function log(level: number, ...args: any[]) {
  if (prevLevel != undefined && prevLevel > level) {
    console.log("\n");
  }
  prevLevel = level;

  let prefix = "";
  for (let i = 0; i < level; i++) {
    prefix += "    ";
  }
  console.log(`${prefix}`, ...args);
}
