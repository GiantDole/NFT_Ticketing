import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import dotenv from 'dotenv';
import "@typechain/hardhat";
import "solidity-coverage";
import 'solidity-docgen';

dotenv.config({ path: '../.env' });


const config: HardhatUserConfig = {
  defaultNetwork: "mumbai",
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    },
  },
  paths: {tests: "matic"},
  networks: {
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!]
    },
  }
};

export default config;
