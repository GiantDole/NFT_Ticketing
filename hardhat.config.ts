import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "solidity-coverage";
import 'solidity-docgen';

const config: HardhatUserConfig = {
  solidity: "0.8.9"
};

export default config;
