import { ethers } from "ethers";
import 'dotenv/config'
import * as managerJson from "../artifacts/contracts/TicketManager.sol/TicketManager.json";


function setupProvider() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_RPC_URL);
  return provider;
}

function setupSigner() {
    const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC!);
    console.log(`Using address ${wallet.address}`);
    const provider = setupProvider();
    return wallet.connect(provider);
}

function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
  }

async function createEvent(
    signer:ethers.Wallet,
    managerAddress:string,
    eventID:number,
    tokenAddress:string,
    ipfs_uri:string,
    royalties:number
) {
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
    
    const role = await managerContract.CREATOR_ROLE();
    const hasCreatorRole = await managerContract.hasRole(role, signer.address);
    if(!hasCreatorRole) {
        throw new Error("Provided signer does not have the creator role");
    }

    const test = await managerContract.getEventByID(eventID);
    console.log(test);
    if (test != ethers.constants.AddressZero) {
        throw new Error("An event with this ID already exists!");
    }

    console.log(`Creating new event with ID ${eventID}`);
    const result = await managerContract.createEvent(
        eventID,
        tokenAddress,
        ipfs_uri,
        royalties,
    );
    console.log(result);

    const addr = await managerContract.getEventByID(eventID);
    console.log(`Created new ERC1155 with address ${addr}`);
  }

  async function main() {
    createEvent(
        setupSigner(),
        process.env.MANAGER_CONTRACT!,
        15,
        process.env.TOKEN_CONTRACT!,
        "ipfs://bafkreih6msixx2aoqllqj62mgnxmliajdlwte4erfyxtkcpb5tyfvzoxku",
        1000
    )
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });