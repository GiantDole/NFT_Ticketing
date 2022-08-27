import { expect } from "chai";
// eslint-disable-next-line node/no-unpublished-import
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { ERC1155Ticketing } from "../typechain";
// eslint-disable-next-line node/no-unpublished-import
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Testing ERC1155 Ticketing", () => {
    let tokenContract: ERC1155Ticketing;
    let owner:SignerWithAddress;
    let organizer:SignerWithAddress;
    let user1;SignerWithAddress;

    beforeEach( async () => {
        const accounts : SignerWithAddress[] = await ethers.getSigners();
        //The owner will later on be the manager contract
        [ owner, organizer, user1 ] = accounts; 

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

        it("sets the correct owner", async () => {
            const owner_ = await tokenContract.owner();
            expect(owner_).to.eq(owner.address);
        })

        it("sets dynamic URI correctly", async () => {
            const uri = await tokenContract.uri(1);
            expect(uri).to.eq("https://example.com/{id}.json");
        });

        xit("has zero total tickets", async () => {
            const amount = tokenContract;
        });
    });

    describe("When the organizer creates new ticket types", async () => {
        let tokenID1 = 5;
        let tokenID2 = 549;
        let amount1 = 50;
        let amount2 = 160;

        beforeEach( async () => {
            //Mints 50 tickets of type 1
            await tokenContract.mint(tokenID1, amount1);
            await tokenContract.mint(tokenID2, amount2);
        });

        it("All minted tickets are owned by this contract", async () => {
            const balance1 = await tokenContract.balanceOf(tokenContract.address, tokenID1);
            expect(balance1).to.eq(amount1);
            const balance2 = await tokenContract.balanceOf(tokenContract.address, tokenID2);
            expect(balance2).to.eq(amount2);
        })

        it("Ticket number updates correctly", async () => {
            const tickets1 = await tokenContract.totalSupply(tokenID1);
            expect(tickets1).to.eq(amount1);
            const tickets2 = await tokenContract.totalSupply(tokenID2);
            expect(tickets2).to.eq(amount2);
        })

        xdescribe("When the organizer mints additional tickets of a ticket type", async () => {

        });
    });
})