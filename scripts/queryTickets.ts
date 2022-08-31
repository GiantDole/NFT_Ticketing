import { ethers } from "ethers";
import * as eventJson from "../artifacts/contracts/ERC1155Ticket.sol/ERC1155Ticketing.json";
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
    eventAddress:string,
    signer:ethers.Wallet
) {
    const eventContract = new ethers.Contract(
        eventAddress,
        eventJson.abi,
        signer
    );

    const block = await eventContract.provider.getBlock("latest");

    const filter = eventContract.filters.TokentypeCreated();

    const result = await eventContract.queryFilter(filter, block.number - 3000, block.number);

    let arr = [];
    
    for(let i=0; i<result.length; i++) {
        let di = {
            id: result[i].args!.tokenId.toNumber(),
            capacity: result[i].args!.capacity.toNumber(),
            price: result[i].args!.price.toNumber(),
            uri: result[i].args![3],
        }
        arr.push(di);
    }

    return arr;
}

async function main() {
    console.log(await queryEvents(
        process.env.EVENT_CONTRACT!,
        setupSigner()
    ))
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });