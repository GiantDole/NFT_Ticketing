import { ethers } from "ethers";
import 'dotenv/config'
import * as managerJson from "../artifacts/contracts/TicketManager.sol/TicketManager.json";


function setupProvider() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_RPC_URL);
  return provider;
}

async function giveCreatorRole(
    managerAddress:string,
    creator:string,
) {
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


  const managerContract = new ethers.Contract(
    managerAddress,
    managerJson.abi,
    signer
  );

  console.log(`Giving creator rights to ${creator}`);
  await managerContract.authorizeCreator([creator]);

  const role = await managerContract.CREATOR_ROLE();
  const hasCreatorRole = await managerContract.hasRole(role, signer.address);
  console.log(`Now has creator rights: ${hasCreatorRole}`);
}

async function main() {
    const creator = "0x4AdeF044692817daa6bB18CE1f8D3594EaBc6dC0";
    giveCreatorRole(
        process.env.MANAGER_CONTRACT!,
        creator
    );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});