import { ethers } from "ethers";
import dotenv from "dotenv";
import * as managerJson from "../artifacts/contracts/TicketManager.sol/TicketManager.json";

dotenv.config({ path: '../.env' });

function setupProvider() {
  const infuraOptions = process.env.INFURA_API_KEY;
  const options = {
    infura: infuraOptions,
  };
  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_RPC_URL);
  return provider;
}

async function main() {
  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC!);
  console.log(`Using address ${wallet.address}`);
  const provider = setupProvider();
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }
  console.log("Deploying Token contract");
  const tokenFactory = new ethers.ContractFactory(
    managerJson.abi,
    managerJson.bytecode,
    signer
  );
  const tokenContract = await tokenFactory.deploy();
  console.log("Awaiting confirmations");
  await tokenContract.deployed();
  console.log("Completed");
  console.log(`Contract deployed at ${tokenContract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});