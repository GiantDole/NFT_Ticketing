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