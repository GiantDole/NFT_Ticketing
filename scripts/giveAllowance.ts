import { ethers, Signer } from "ethers";
import * as tokenJson from "../artifacts/contracts/ERC20Ticket.sol/ERC20Ticket.json";
import * as managerJson from "../artifacts/contracts/TicketManager.sol/TicketManager.json";
import 'dotenv/config'

const tokenAddress = "0x014E6cb6f7c846581538a5ec49C5b32E64c90978";
const eventAddr = process.env.EVENT_CONTRACT!;

function setupProvider() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_RPC_URL);
  return provider;
}

function setupSigner() {
    const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC_MARC!);
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

    console.log(`Giving rights to address ${signer.address}`);

    const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenJson.abi,
        signer
    );

    console.log("Approving tokens...");

    return await tokenContract.approve(
        ticketAddress,
        amount
    );
}

async function main() {
    console.log(await tokenAllowance(
        setupSigner(),
        tokenAddress,
        eventAddr,
        2000
    ))
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });