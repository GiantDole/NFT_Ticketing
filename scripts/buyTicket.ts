import { ethers, Signer } from "ethers";
import * as tokenJson from "../artifacts/contracts/ERC20Ticket.sol/ERC20Ticket.json";
import * as managerJson from "../artifacts/contracts/TicketManager.sol/TicketManager.json";
import 'dotenv/config'

const tokenAddress = "0x014E6cb6f7c846581538a5ec49C5b32E64c90978";
const managerAddr = "0xe46aa7eF2e23210a314c7f72bC1E720f25660E5E"

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


//signer should be the user
//the user allows the ERC1155 smart contract to use amount of tokens for the purchase
//this is necessary before tickets can be bought
async function tokenAllowance(
    signer:ethers.Wallet,
    tokenAddress:string,
    ticketAddress:string,
    amount: number
) {
    const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenJson.abi,
        signer
    );

    tokenContract.approve(
        ticketAddress,
        amount
    );
}

async function buyTicket(
    addr:string,
    managerAddress:string, 
    eventID: number,
    ticketID: number,
    amount: number
) {
    const signer = setupProvider();

    const managerContract = new ethers.Contract(
        managerAddress,
        managerJson.abi,
        signer
    );
    
    //Buyer must have allowed the ticket contract to use their tokens
    const unsignedTx = await managerContract.populateTransaction['buyTicket'](
        addr,
        eventID,
        ticketID,
        amount
    );

    return unsignedTx;
}

async function main() {
    console.log(await buyTicket(
        setupSigner().address,
        managerAddr,
        5,
        10,
        1
    ))
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });