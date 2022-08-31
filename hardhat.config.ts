import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import dotenv from 'dotenv';
import "@typechain/hardhat";
import "solidity-coverage";
import 'solidity-docgen';

dotenv.config({ path: '../.env' });


const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    },
  },
};

export default config;
