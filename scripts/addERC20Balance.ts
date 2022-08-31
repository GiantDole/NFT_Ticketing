import { ethers } from "ethers";
import * as tokenJson from "../artifacts/contracts/ERC20Ticket.sol/ERC20Ticket.json";
import 'dotenv/config'

const tokenAddress = process.env.TOKEN_CONTRACT!;

function setupProvider() {
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

    const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenJson.abi,
        signer
    );
    const addr = process.argv[2];
    console.log(`Minting to given address ${addr}`);
    if (!ethers.utils.isAddress(addr)) {
        throw new Error("Invalid address");
    }
    await tokenContract.mint(addr, 1000);
    const bal = await tokenContract.balanceOf(addr);
    console.log(`New token balance of ${addr} is ${bal}\nThis might not update immediately.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });