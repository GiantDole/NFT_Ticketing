import { expect } from "chai";
// eslint-disable-next-line node/no-unpublished-import
import { ethers, waffle } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { TicketManager, ERC20Ticket, ERC1155Ticketing } from "../typechain";
// eslint-disable-next-line node/no-unpublished-import
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { MockContract } from "ethereum-waffle";


//TODO: test batch minting and burning


describe("Testing ERC1155 Ticketing", () => {
    let managerContract: TicketManager;
    let paymentToken: ERC20Ticket;
    let organizer:SignerWithAddress;
    let user1:SignerWithAddress;
    let user2:SignerWithAddress;
    let admin:SignerWithAddress;

    beforeEach( async () => {
        const accounts : SignerWithAddress[] = await ethers.getSigners();

        //The managerContract will later on be the manager contract
        [ admin, organizer, user1, user2 ] = accounts; 

        const managerFactory = await ethers.getContractFactory(
          "TicketManager"
        );

        const tokenFactory = await ethers.getContractFactory(
            "ERC20Ticket"
        );

        managerContract = await managerFactory.deploy();
        paymentToken = await tokenFactory.deploy();
        await managerContract.deployed();
        await paymentToken.deployed();
    });

    describe("When the TicketManager is deployed", () => {
        it("sets the admin as owner", async () => {
            const role = await managerContract.DEFAULT_ADMIN_ROLE();
            const isOwner = await managerContract.hasRole(role, admin.address);
            expect(isOwner).to.be.true;
        });
    });

    describe("When adding new roles and creators", () => {
        beforeEach( async () => {
            await managerContract.authorizeCreator([organizer.address]);
        })

        it("can set a new creator", async () => {
            const role = await managerContract.CREATOR_ROLE();
            const isCreator = await managerContract.hasRole(role, organizer.address);
            expect(isCreator).to.be.true;
        })

        it("can add organizer role for an event", async() => {
            const eventID = 5;
            const role = await managerContract.getRoleKeccak(eventID);
            await managerContract.addEventOrganizer(eventID, [ organizer.address ]);
            await expect(await managerContract.hasRole(role, organizer.address)).to.be.true;
        })
    })

    describe("When creating new events", async() => {
        const event1 = 29;
        const royalties = 500;

        beforeEach( async () => {
            await managerContract.authorizeCreator([ organizer.address ]);

            await managerContract.connect(organizer).createEvent(
                event1,
                paymentToken.address,
                "test",
                royalties
            );
        })

        it("event ERC1155 can be queried through manager", async() => {
            const addr = await managerContract.getEventByID(event1);
            expect(addr).to.not.eq(ethers.constants.AddressZero);
        })

        it("manager contract is set as owner of new ERC1155", async() => {
            const addr = await managerContract.getEventByID(event1);
            const eventContract = await ethers.getContractAt("ERC1155Ticketing", addr);

            const owner_ = await eventContract.owner();
            expect(owner_).to.eq(managerContract.address);
        })

        it("assigns creator with organizer role of this event", async() => {
            const role = await managerContract.getRoleKeccak(event1);
            await expect(await managerContract.hasRole(role, organizer.address)).to.be.true;
        })

        describe("When creating new ticket types", async() => {
            const ticket1 = 50;
            const maxCap1 = 150;
            const price1 = 10;
            const uri = "test";
            let addr:string;
            let contract:ERC1155Ticketing;


            beforeEach(async () => {
                addr = await managerContract.getEventByID(event1);
                contract = await ethers.getContractAt("ERC1155Ticketing", addr);
                
                await managerContract.connect(organizer).createTicketType(
                    event1,
                    ticket1,
                    maxCap1,
                    price1,
                    "test"
                );

            })

            it("ERC1155 emits a Tokentype created event", async() => {
                await expect(
                    await managerContract.connect(organizer).createTicketType(
                        event1,
                        ticket1+1,
                        maxCap1,
                        price1,
                        uri
                    )
                ).to.emit(contract, "TokentypeCreated")
                .withArgs(ticket1+1, maxCap1, price1, uri);
            })

            it("sets the royalty correctly", async() => {
                const royalty = await contract.royaltyInfo(0, 200);
                expect(royalty.royaltyAmount).to.eq(200 * royalties / 10000);
            })

            it("sets maximum capacity correctly", async() => {
                const cap = await contract.maxCap(ticket1);
                await expect(cap).to.eq(maxCap1);
            })

            it("sets the ticket price correctly", async() => {
                const price = await contract.ticketPrice(ticket1);
                await expect(price).to.eq(price1);
            })

            describe("When sending the user tokens to buy tickets", async() => {
                const amount = 400;

                beforeEach(async() => {
                    await paymentToken.transfer(user1.address, amount);
                    await paymentToken.connect(user1).approve(addr, amount);
                })

                it("user received payment tokens", async() => {
                    const balance = await paymentToken.balanceOf(user1.address);
                    await expect(balance).to.eq(amount);
                })

                it("user approved ERC1155 event contract for token usage", async() => {
                    expect(await paymentToken.allowance(user1.address, contract.address)).to.eq(amount);
                })

                describe("When buying new tickets", async() => {

                    beforeEach(async() => {
                        await managerContract.connect(user1).buyTicket(
                            user1.address,
                            event1,
                            ticket1,
                            1
                        );
                    })
    
                    it("User successfully receives ticket", async() => {
                        const balance = await contract.balanceOf(user1.address, ticket1);
                        expect(balance).to.eq(1);
                    })
            
                })
            })
        })
    })
})