//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./ERC1155Ticket.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Manager is Ownable{

    address private admin;
    uint256 private eventId;
    
    //how many tickets an address owns
    mapping(address => mapping(uint256 => bool)) public eventIdByCreator;
    mapping(uint256 => ERC1155Ticketing) eventIdToTicket;
    mapping(address => bool) authorizedCreator;
    
    event TicketMinted(uint256 indexed _eventId, uint256 indexed _ticketId, address _buyer, uint256 _amt);
    event TicketBurned(uint256 indexed _eventId, uint256 indexed _ticketId, address _burner, uint256 _amt);

    struct Event{
        uint256 id;
        address eventOwner;
        ERC1155Ticketing ticket; 
        uint256 ticketCap; 
        uint256 creationTime;
        uint256 closingTime;
    }

    modifier onlyEventCreator(){
        require(authorizedCreator[msg.sender], "not authorzed to create event");
        _;
    }

    modifier onlyEventOwner(uint256 _eventId){
        require(eventIdToTicket[msg.sender] != 0, "no event");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin || msg.sender == owner, "not the admin");
        _;
    }

    modifier onlyTicketHolder(uint256 _eventId, uint256 _id){
        require(eventIdToTicket[_eventId].balanceOf(msg.sender, _id) > 0, "not a ticket holder");
        _;
    }

    function setAdmin(address _admin) onlyOwner public {
        admin = _admin;
    }

    function generateEventId() internal returns (uint256) {
        return eventId ++;
    }
    
    /*
    deployERC1155 - deploys a ERC1155 token with given parameters - returns deployed address

    _contractName - name of our ERC1155 token
    _uri - URI resolving to our hosted metadata
    _ids - IDs the ERC1155 token should contain
    _name - Names each ID should map to. Case-sensitive.
    */
    function createEvent(uint _weeks) internal returns (Event memory) {
        
        uint256 eventId = generateEventId();

        Event memory userEvent = Event({
            id: eventId,
            eventOwner: msg.sender,
            eventToken: ,
            ticketCap: 0, 
            block.timestamp, 
            block.timestamp + weeks
        });

        eventIdByCreator[msg.sender][eventId] = true;
        return userEvent;
    }

    function addTicketToEvent(
        uint256 _eventId,
        address paymentToken_, 
        uint24 royalties_,
        uint256 id,
        uint256 maxCap_,
        uint256 price,
        string memory tokenURI_) public onlyEventOwner(_eventId) {
        ERC1155Ticketing memory ticket = ERC1155Ticketing(
            paymentToken_,
            tokenURI_, 
            royalties_
        );
        ticket.createTicketType(id, maxCap_, price, tokenURI_);
        eventIdToTicket[_eventId] = id;
    }

    function addAdditonalTicket(
        uint256 _eventId, 
        uint256 id, 
        uint256 maxCap_, 
        uint256 price, 
        string memory tokenURI_) public onlyEventOwner(_eventId) {
    
        eventIdToTicket[_eventId].createTicketType(id, maxCap_, price, tokenURI_);
    }
    
    
    function buyTicket(uint256 _eventId, uint256 _id, uint256 _amt) public {
        eventIdToTicket[_eventId].mint(_id, _amt);
        emit TicketMinted(_eventId, _id, msg.sender, _amt);
    }

    function batchBuyTickets(uint256[] memory _eventIds, uint256[] memory _ticketIds, uint256[] memory _amounts) public {
        for (uint256 i; i < _eventIds.length; i++){
            eventIdToTicket[_eventIds[i]].mint(_ticketIds[i], _amounts[i]);
            emit TicketMinted(_eventIds, _ticketIds[i], msg.sender, _amounts[i]); 
        }
    }

    function cancelTicket(uint256 _eventId, uint256 _id, uint256 _amt) public onlyTicketHolder(_eventId, _id) {
        //check for timelock
        eventIdToTicket[_eventId].burn(_id);
        emit TicketBurned(_eventId, _id, msg.sender, _amt);
    }

    function cancelEvent(uint256 _eventId) public onlyEventOwner(_eventId) {
        //check for timelock
        eventIdToTicket[_eventId].burnAll();
        eventIdByCreator[msg.sender][_eventId] = false;
    }

    function withdrawProfits(uint256 _eventId) public onlyEventOwner(_eventId) {
        eventIdToTicket[_eventId].withdraw();
    }

    function withdrawCanceledTicket();


}

