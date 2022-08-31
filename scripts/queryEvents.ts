import { ethers } from "ethers";
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

async function queryEvents(
    managerAddress:string,
    signer:ethers.Wallet
) {
    const managerContract = new ethers.Contract(
        managerAddress,
        managerJson.abi,
        signer
    );

    const block = await managerContract.provider.getBlock("latest");

    const filter = managerContract.filters.EventCreated();

    const result = await managerContract.queryFilter(filter, block.number - 2000, block.number);

    let arr = [];
    
    for(let i=0; i<result.length; i++) {
        let di = {
            id: result[i].args!._eventId.toNumber(),
            uri: result[i].args![2],
        }
        arr.push(di);
    }

    return arr;
}

async function main() {
    console.log(await queryEvents(
        process.env.MANAGER_CONTRACT!,
        setupSigner()
    ))
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });