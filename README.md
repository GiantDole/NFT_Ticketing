# ERC1155 Ticketing

An NFT ticketing system optimized for configuration by the event organizer while maintaining user fairness. Implementing the novel ERC1155 standard to reduce gas cost of creating events and minting tickets.

In traditional ticketing systems, organizers have to make a decision regarding ticket personalization. If they personalize tickets, the end consumer would have a disadvantage if unable or uninteresd to attend. On the other hand, if tickets are unpersonalized, people could buy more than one ticket and take advantage of increasing prices.

Using the blockchain technology transparently solves this issue: tickets are attached to a digital identity such that it can be transferred to another identity adhering to policies set by the organizer - and all of that without any third party interference. These policies could comprise a minimum price or a royalty fee of transferral so that the organizer also benefits from increase in demand while maintaing user flexibility. 

User fairness is generally achieved by a locked escrow for tickets. This implies that if the organizer cancels the event / ticket, or the user wants to cancel a ticket within the cancellation policy, the user can immediately retrieve those funds. Our smart contracts enforces that the organizer can only cancel tickets or event if sufficient funds are in escrow. Furthermore, they ensure that there's sufficient escrow at all times for the every ticket within the cancellation policy potentially being cancelled. Only if, e.g., enough time passes beyond a possible cancellation for a ticket the organizer can withdraw that money. 

Another advantage is the community effect that can be created with events having access or price conditions based on past attendances.

## Core Functionality

Event organizers can 
- create events with different ticket types
- modify events and ticket types
- cancel events or tickets
- set policies for every event and ticket type as, e.g., the royalty fees, minimum resell price, and cancellation policy.

Users can, in adherance to the set policies,
- buy a ticket
- resell tickets
- upgrade tickets
- cancel tickets

In order to protect the users, the ticket system provider (us) can constrain the organizers in their 
- set policies
- ability to cancel tickets & events

## Smart Contracts

To implement those functionalities, we'll use 3 classes of smart contracts: the event manager, ERC1155 events, and a marketplace. 

The event manager offers verified event organizers the possibility to create, manage, and cancel events. It functions as interface for us and the organizers to manage and keep track of events and, mostly, to interact with events. 
Every time an organizer creates an event, an ERC1155 is deployed owned by the manager contract. This is to prevent the owner of stealing the escrow or fron other unfair activities. 
The marketplace is specifically designed to trade NFTs representing tickets. Nothing keeps users from trading their tickets elsewhere, but through this marketplace smart contract we can ensure other non-web3 users to safely purchase unexpired and unused tickets.

## Structure

The event manager contract is the owner of every ERC1155Ticket contract. Event organizers manage their events, i.e., create ticket types, mint tickets, cancel tickets, burn tickets, ... through the manager contract. 

Tickets are minted into the ERC1155Ticket contract. Organizers have to first create a ticket type by setting its capacity, price, and URL. These types are static and cannot be altered except for the capacity. This is to ensure price stability of a ticket type for fair refund etc. Nevertheless, an organizer can create a new ticket type with the same URI and change the capacity of an existing one. In the ERC1155, the event organizer can also burn tickets without constraints so far. Only after a user has purchased a ticket the organizer can only cancel the ticket with immediate refund.

## Check-in

Managing check-in solely on-chain would allow for the following attack vector: A ticket owner could check themselves in and share their credentials such that another person could check in as well until it is finally captured on chain.

Therefore, we suggest the following method: For user authenticity, the user signs their ticket which generates a QR Code to check in. Through this QR code we can verify that the user has access to their wallet private key. To avoid the attack vector mentioned above, it is necessary to register a check-in in a centralized way until it is finalized on-chain.

## Launch Web App

cd app
npm run dev
App is available under http://localhost:3000

## Example metadata

### Event metadata
Metadata for one ERC1155 / Event. fee_recipient refers to the address that receives the royalties. This should be set to the contract address of the ERC1155 so the organizer can withdraw those royalties there.
```
{
  "id": 15,
  "name": "Festival",
  "description": "Reggae and Techno",
  "date": "08/25/2022",
  "image": "ipfs://...", # Link to collection image
  "external_link": "https://festival.io", # Link to website
  "royalties": 100, # Indicates a 1% seller fee
}
```

### Ticket metadata
Metadata for a ticket type. A ticket type can have a parent ticket type, e.g., when a new id is generated for the same ticket type after a price increase. 
```
{
  "id": 5,
  "event_id": 15,
  "parent_id": None
  "name": "Gold Ticket",
  "description": "VIP Entrance",
  "image": "ipfs://...", # Link to collection image
  "external_link": "https://festival.io/user", # Link to schedule
}
```

## Examples
Event image IPFS URI: ipfs://bafybeiavffno6sx352s2vbouh25pihnzxkncvo4fgfi5enfwnmt25jnidi
Event metadata URI: ipfs://bafkreih6msixx2aoqllqj62mgnxmliajdlwte4erfyxtkcpb5tyfvzoxku

Ticket metadata URI: ipfs://bafkreifvjfebya7weu5giu4bgiakscneg2jbrlmvi7zgkzgbmkurmql36q

Deployed on Polygon Mumbai testnet contracts:

MANAGER_CONTRACT=0xe46aa7eF2e23210a314c7f72bC1E720f25660E5E
TOKEN_CONTRACT=0x014E6cb6f7c846581538a5ec49C5b32E64c90978
EVENT_CONTRACT=0x3bf5f74A9be4551A7eAAFC375BBd779f8DAe2424 (uses the metadata URL above)
