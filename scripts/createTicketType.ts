import { ethers } from "ethers";
import 'dotenv/config'
import * as managerJson from "../artifacts/contracts/TicketManager.sol/TicketManager.json";
import * as eventJson from "../artifacts/contracts/ERC1155Ticket.sol/ERC1155Ticketing.json";

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

async function createTicketType(
    signer:ethers.Wallet,
    managerAddress:string,
    eventAddress:string,
    eventID:number,
    ticketID:number,
    maxCap:number,
    price:number,
    ipfs_uri:string
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

    const test = await managerContract.getEventByID(eventID);
    if (test == ethers.constants.AddressZero) {
        throw new Error("An event with this ID doesn't exist!");
    }
    
    const role = await managerContract.getRoleKeccak(eventID);
    const hasOrganizerRole = await managerContract.hasRole(role, signer.address);
    if(!hasOrganizerRole) {
        throw new Error("Provided signer does not have the organizer role");
    }

    console.log(`Creating new ticket type with ID ${ticketID}`);
    const result = await managerContract.createTicketType(
        eventID,
        ticketID,
        maxCap,
        price,
        ipfs_uri
    );
    //console.log(result);

    const ticketContract = new ethers.Contract(
        eventAddress,
        eventJson.abi,
        signer
    )

    const cap = await ticketContract.maxCap(ticketID);

    console.log(`The max cap of the ticket id was set to ${cap}`)
  }

  async function main() {
    createTicketType(
        setupSigner(),
        process.env.MANAGER_CONTRACT!,
        process.env.EVENT_CONTRACT!,
        15,
        10,
        100,
        500,
        "ipfs://bafkreifvjfebya7weu5giu4bgiakscneg2jbrlmvi7zgkzgbmkurmql36q",
    )
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });