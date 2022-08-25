import { expect } from "chai";
// eslint-disable-next-line node/no-unpublished-import
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { ERC1155Ticketing } from "../typechain";

describe("Testing ERC1155 Ticketing", () => {
    let tokenContract: ERC1155Ticketing;
    let accounts: any[];

    beforeEach( async () => {
        accounts = await ethers.getSigners();
        const tokenFactory = await ethers.getContractFactory(
          "ERC1155Ticketing"
        );
        //USDC token address
        tokenContract = await tokenFactory.deploy("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
        await tokenContract.deployed();
    });

    describe("When the contract is deployed", () => {
        it("Includes ERC-165", async () => {
            const supportsInterface = await tokenContract.supportsInterface(ethers.utils.hexZeroPad(ethers.utils.hexlify(0xd9b67a26), 4));
            expect(supportsInterface).to.be.true;
        });

        it("has zero total tickets", async () => {
            const amount = tokenContract;
        });
    })
})