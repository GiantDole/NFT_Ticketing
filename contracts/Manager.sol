//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./ERC1155Ticket.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Manager is Ownable{

    address private admin;

    mapping(address => Event[]) public events;
    mapping(address => Event[]) public ticketHolders;
    //how many tickets an address owns
    mapping(address => Event => uint256) public nbrTicketsOwned;

    struct Event{
        uint256 id;
        address eventOwner;
        ERC1155Ticketing eventToken; 
        uint256 ticketCap; 
    }

    modifier onlyEventOwner(uint256 _id){
        Event[] memory userEvents = events[msg.sender];
        require(userEvents.length > 0, "not an event owner");
        for (uint256 i; i < userEvents.length; i++){
            if (userEvents[i].id == _id){
                _;
            } else {
                revert("not an event owner");
            }
        }
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "not the admin");
    }

    modifier onlyTicketHolder(uint256 _id){
        require(ticketHolders[msg.sender].length > 0, "not a ticket holder");
        for (uint256 i; i < ticketHolders[msg.sender].length; i++){
            if (ticketHolders[msg.sender][i].id == _id){
                _;
            } else {
                revert("not a ticket holder");
            }
        }
    }

    function setAdmin(address _admin) onlyOwner public {
        admin = _admin;
    }
    
    /*
    deployERC1155 - deploys a ERC1155 token with given parameters - returns deployed address

    _contractName - name of our ERC1155 token
    _uri - URI resolving to our hosted metadata
    _ids - IDs the ERC1155 token should contain
    _name - Names each ID should map to. Case-sensitive.
    */
    function createEvent(
        address _token, 
        string memory _uri, 
        uint24 _royalties,
        uint256 _id, 
        uint256 _maxCap, 
        uint256 _price) internal returns (ERC1155Ticketing) {

        ERC1155Ticketing ticket = new ERC1155Ticketing(_token, _uri, _royalties);
        ticket.createTicketType(_id, _maxCap, _price, _uri);

        Event memory userEvent = Event({
            id: _id,
            eventOwner: msg.sender,
            eventToken: ticket,
            ticketCap: _maxCap
        });

        events[msg.sender].push(userEvent);


        return ticket;
    }
    //every erc1155 is one event
    //tokenid can appear more than once across events
    //give event unique ID


    function buyTicket(Event memory _event) public payable {
        _event.eventToken.mint(msg.sender, _event.id, msg.value);
        ticketHolders[msg.sender].push(_event);
    }

    function batchBuyTickets(Event[] memory _events, uint256[] memory _amounts) public payable {
        for (uint256 i; i < _events.length; i++){
            buyTicket(_events[i]);
        }
    }

    function cancelTicket(Event memory _event) public onlyTicketHolder(_event.id) {
        _event.eventToken.cancel(msg.sender, _event.id, nbrTicketsOwned[msg.sender][_event]);
        ticketHolders[msg.sender].remove(_event);
    }

}

