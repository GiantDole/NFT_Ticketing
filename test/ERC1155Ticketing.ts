import { expect } from "chai";
// eslint-disable-next-line node/no-unpublished-import
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { ERC1155Ticketing } from "../typechain";
// eslint-disable-next-line node/no-unpublished-import
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

//TODO: test batch minting and burning

describe("Testing ERC1155 Ticketing", () => {
    let ticketContract: ERC1155Ticketing;
    let managerContract:SignerWithAddress;
    let organizer:SignerWithAddress;
    let user1:SignerWithAddress;
    let user2:SignerWithAddress;

    beforeEach( async () => {
        const accounts : SignerWithAddress[] = await ethers.getSigners();
        //The managerContract will later on be the manager contract
        [ managerContract, organizer, user1, user2 ] = accounts; 

        const ticketFactory = await ethers.getContractFactory(
          "ERC1155Ticketing"
        );

        //USDC token address
        ticketContract = await ticketFactory.deploy("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
        await ticketContract.deployed();
    });

    describe("When the contract is deployed", () => {
        it("Includes ERC-165 support", async () => {
            const supportsInterface = await ticketContract.supportsInterface(ethers.utils.hexZeroPad(ethers.utils.hexlify(0xd9b67a26), 4));
            expect(supportsInterface).to.be.true;
        });

        it("sets the manager contract as owner", async () => {
            const managerContract_ = await ticketContract.owner();
            expect(managerContract_).to.eq(managerContract.address);
        })

        it("sets the dynamic URI correctly", async () => {
            const uri = await ticketContract.uri(1);
            expect(uri).to.eq("https://example.com/{id}.json");
        });

        xit("holds zero total tickets", async () => {

        });
    });

    describe("Access control checks", async () => {
        
        it("Only the manager contract can mint new tickets", async () => {
            await expect(ticketContract.connect(organizer).mint(1,5))
            .to.be.revertedWith("Ownable: caller is not the owner");
            await expect(ticketContract.connect(user1).mint(11,50))
            .to.be.revertedWith("Ownable: caller is not the owner");
        })
    })

    describe("When the manager contract creates new ticket types", async () => {
        let tokenID1 = 5;
        let tokenID2 = 549;
        let amount1 = 50;
        let amount2 = 160;

        beforeEach( async () => {
            //Mints 50 tickets of type 1
            await ticketContract.mint(tokenID1, amount1);
            await ticketContract.mint(tokenID2, amount2);
        });

        it("Mints tickets into the ticket contract", async () => {
            const balance1 = await ticketContract.balanceOf(ticketContract.address, tokenID1);
            expect(balance1).to.eq(amount1);
            const balance2 = await ticketContract.balanceOf(ticketContract.address, tokenID2);
            expect(balance2).to.eq(amount2);
        })

        it("Ticket numbers update correctly", async () => {
            const tickets1 = await ticketContract.totalSupply(tokenID1);
            expect(tickets1).to.eq(amount1);
            const tickets2 = await ticketContract.totalSupply(tokenID2);
            expect(tickets2).to.eq(amount2);
        })

        xit("Emits TokentypeCreated events", async () => {
            //TODO: same as below
            expect(ticketContract).to.emit(ticketContract, "TokentypeCreated");
        })

        describe("When the organizer mints additional tickets of a ticket type", async () => {
            let amountAdded = 70;

            beforeEach( async () => {
                await ticketContract.mint(tokenID1,amountAdded);
            })

            it("Adds tickets to the ticket contract", async () => {
                const balance = await ticketContract.balanceOf(ticketContract.address, tokenID1);
                expect(balance).to.eq(amount1 + amountAdded);
            })

            it("Ticket numbers update correctly", async () => {
                const tickets1 = await ticketContract.totalSupply(tokenID1);
                expect(tickets1).to.eq(amount1 + amountAdded);
                const tickets2 = await ticketContract.totalSupply(tokenID2);
                expect(tickets2).to.eq(amount2);
            })

            xit("Doesn't emit a TokentypeCreated event", async () => {
                //TODO: to.not.emit and to.emit both work... ?
                expect(ticketContract).to.emit(ticketContract, "TokentypeCreated");
                expect(ticketContract).to.not.emit(ticketContract, "TokentypeCreated");
            })
        });

        describe("When the organizer deletes / burns tickets", async () => {
            const burn1 = 20;
            const burn2 = 100;

            beforeEach( async () => {
                await ticketContract.burn(tokenID1, burn1);
                await ticketContract.burn(tokenID2, burn2);
            })

            it("Updates the contract's balance", async () => {
                const balance1 = await ticketContract.balanceOf(ticketContract.address, tokenID1);
                expect(balance1).to.eq(amount1 - burn1);
                const balance2 = await ticketContract.balanceOf(ticketContract.address,tokenID2);
                expect(balance2).to.eq(amount2 - burn2);
            })

            it("Updates the amount of total tickets", async () => {
                const tickets1 = await ticketContract.totalSupply(tokenID1);
                expect(tickets1).to.eq(amount1 - burn1);
                const tickets2 = await ticketContract.totalSupply(tokenID2);
                expect(tickets2).to.eq(amount2 - burn2);
            })

            it("Cannot burn more tickets than exist", async () => {
                await expect(ticketContract.burn(tokenID1, amount1-burn1+1))
                .to.be.revertedWith("ERC1155: burn amount exceeds totalSupply");
            })
        })

        describe("When users purchase tickets", async () => {

            it("Ticket contract received USDC", async () => {

            })

            it("The user received the ticket", async () => {
                
            })

            it("Cannot burn purchased ticket", async () => {

            })

            describe("When the organizer cancels tickets", async () => {

                it("Users are refunded", async () => {

                })

                it("Number of tickets is updated", async () => {

                })
            })
        })
    });
})