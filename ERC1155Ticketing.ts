import { expect } from "chai";
// eslint-disable-next-line node/no-unpublished-import
import { ethers, waffle } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { ERC1155Ticketing, IERC20 } from "../typechain";
// eslint-disable-next-line node/no-unpublished-import
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { abi as IERC20abi } from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";
import { MockContract } from "ethereum-waffle";

const { deployMockContract } = waffle;

//TODO: test batch minting and burning


xdescribe("Testing ERC1155 Ticketing", () => {
    let ticketContract: ERC1155Ticketing;
    let mockContract: MockContract;
    let managerContract:SignerWithAddress;
    let organizer:SignerWithAddress;
    let user1:SignerWithAddress;
    let user2:SignerWithAddress;
    let mockOwner:SignerWithAddress;

    beforeEach( async () => {
        const accounts : SignerWithAddress[] = await ethers.getSigners();

        //The managerContract will later on be the manager contract
        [ managerContract, organizer, user1, user2, mockOwner ] = accounts; 

        const ticketFactory = await ethers.getContractFactory(
          "ERC1155Ticketing"
        );

        mockContract = await deployMockContract(mockOwner, IERC20abi);

        //USDC token address
        ticketContract = await ticketFactory.deploy(mockContract.address);
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
            await expect(ticketContract.connect(organizer).mint(1,5, 4))
            .to.be.revertedWith("Ownable: caller is not the owner");
            await expect(ticketContract.connect(user1).mint(11,50, 10))
            .to.be.revertedWith("Ownable: caller is not the owner");
        })
    })

    describe("When the manager contract creates new ticket types", async () => {
        const tokenID1 = 5;
        const tokenID2 = 549;
        const tokenID3 = 10;
        const amount1 = 50;
        const amount2 = 160;
        const price1 = 400;
        const price2 = 600;

        beforeEach( async () => {
            //Mints 50 tickets of type 1
            await ticketContract.mint(tokenID1, amount1, price1);
            await ticketContract.mint(tokenID2, amount2, price2);
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

        it("Sets the ticket type prices", async () => {
            const setPrice1 = await ticketContract.ticketPrice(tokenID1);
            const setPrice2 = await ticketContract.ticketPrice(tokenID2);
            expect(setPrice1).to.eq(price1);
            expect(setPrice2).to.eq(price2);
        })

        it("Emits TokentypeCreated events", async () => {
            expect(await ticketContract.mint(tokenID3, amount1, price1))
            .to.emit(ticketContract, "TokentypeCreated")
            .withArgs(tokenID3, amount1, price1);
        })

        describe("When the organizer mints additional tickets of a ticket type", async () => {
            let amountAdded = 70;

            beforeEach( async () => {
                await ticketContract.mint(tokenID1,amountAdded, 10);
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

            it("Doesn't update the price", async() => {
                const setPrice = await ticketContract.ticketPrice(tokenID1);
                expect(setPrice).to.eq(price1);
            })

            it("Doesn't emit a TokentypeCreated event", async () => {
                await expect(await ticketContract.mint(tokenID2,amountAdded, 20))
                .to.not.emit(ticketContract, "TokentypeCreated");
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
                let tokenBalance = await ticketContract.balanceOf(ticketContract.address, tokenID1);
                tokenBalance = tokenBalance.add(BigNumber.from("1"));
                await expect(ticketContract.burn(tokenID1, tokenBalance))
                .to.be.revertedWith("ERC1155: burn amount exceeds totalSupply");
            })
        })

        describe("When users purchase tickets", async () => {
            const amount1 = 2;

            beforeEach( async() => {
                await mockContract.mock.transferFrom.returns(true);
                await ticketContract.connect(user1).purchaseTicket(user1.address, tokenID1, amount1);
            })

            it("The user receives the ticket after successful payment", async () => {
                const userBalance = await ticketContract.balanceOf(user1.address, tokenID1);
                expect(userBalance).to.eq(amount1);
            })

            it("The user doesn't receive tickets after payment", async () => {
                const amount = 3;
                await mockContract.mock.transferFrom.returns(false);
                await expect(ticketContract.connect(user1).purchaseTicket(user1.address, tokenID1, amount))
                .to.be.revertedWith("Couldn't transfer tokens to the ticket contract to purchase tickets");
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