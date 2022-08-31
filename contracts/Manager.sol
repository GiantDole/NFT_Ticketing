//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./ERC1155Ticket.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Manager is Ownable{
    
    //how many tickets an address owns
    mapping(address => mapping(uint256 => bool)) private eventIdByCreator;
    mapping(uint256 => ERC1155Ticketing) private eventIdToTicket;
    mapping(address => bool) private authorizedCreator;
    
    //event TicketMinted(uint256 indexed _eventId, uint256 indexed _ticketId, address _buyer, uint256 _amt);
    //event TicketBurned(uint256 indexed _eventId, uint256 indexed _ticketId, address _burner, uint256 _amt);
    event EventCreated(uint256 indexed _eventId, address _contractAddress, string _uri);

    modifier onlyEventCreator(){
        require(
            authorizedCreator[msg.sender], 
            "Manager: Not an authorized event creator"
        );
        _;
    }

    modifier onlyEventOwner(uint256 _eventId){
        require(
            eventIdByCreator[msg.sender][_eventId], 
            "Manager: Not an authorized manager for this event"
        );
        _;
    }

    //modifier onlyTicketHolder(uint256 _eventId, uint256 _id){
    //    require(eventIdToTicket[_eventId].balanceOf(msg.sender, _id) > 0, "not a ticket holder");
    //    _;
    //}
    
    /*
    deployERC1155 - deploys a ERC1155 token with given parameters - returns deployed address

    _contractName - name of our ERC1155 token
    _uri - URI resolving to our hosted metadata
    _ids - IDs the ERC1155 token should contain
    _name - Names each ID should map to. Case-sensitive.
    */
    function createEvent(
        uint eventID_, 
        address token_, 
        string memory uri_, 
        uint royalties_
    ) external onlyEventCreator returns (address) {
        require(
            address(eventIdToTicket[eventID_]) == address(0),
            "Manager: Event with this ID already exists"
        );

        ERC1155Ticketing userEvent = new ERC1155Ticketing(
            token_,
            uri_,
            uint24(royalties_)
        );

        eventIdToTicket[eventID_] = userEvent;
        eventIdByCreator[msg.sender][eventID_] = true;
        return address(userEvent);
    }

    function createTicketType(
        uint eventID_, 
        uint ticketID_, 
        uint maxCap_, 
        uint price_,
        string memory tokenURI_
    ) external onlyEventOwner(eventID_){
        eventIdToTicket[eventID_].createTicketType(
            ticketID_,
            maxCap_,
            price_,
            tokenURI_
        );
    }

    function changeTicketCap(
        uint256 eventID_,
        uint256 ticketID_,
        uint256 maxCap_) 
    public onlyEventOwner(eventID_) {
        eventIdToTicket[eventID_].changeCap(
            ticketID_, 
            maxCap_
        );
    }

    function addAdditonalTicket(
        uint256 _eventId, 
        uint256 id, 
        uint256 maxCap_, 
        uint256 price, 
        string memory tokenURI_)
    public onlyEventOwner(_eventId) {
        eventIdToTicket[_eventId].createTicketType(id, maxCap_, price, tokenURI_);
    }
    
    
    function buyTicket(
        address to,
        uint256 _eventID, 
        uint256 _ticketID, 
        uint256 _amt) 
    public {
        eventIdToTicket[_eventID].mint(to, _ticketID, _amt);
    }

    function batchBuyTickets(
        address to,
        uint256 _eventID, 
        uint256[] memory _ticketIds, 
        uint256[] memory _amounts
    ) external {
        eventIdToTicket[_eventID].mintBatch(to, _ticketIds, _amounts);
    }

    function getEventByID(
        uint _eventID
    ) external view returns(address) {
        return address(eventIdToTicket[_eventID]);
    }

    function authorizeCreator(
        address[] memory creators
    ) external onlyOwner {
        for(uint i=0; i<creators.length; i++) {
            authorizedCreator[creators[i]]=true;
        }
    }

    function addEventOrganizer(
        uint _eventID,
        address[] memory organizers
    ) external onlyEventOwner(_eventID) {
        for(uint i=0; i<organizers.length;i++) {
            eventIdByCreator[organizers[i]][_eventID] = true;
        }
    }

    // function cancelTicket(uint256 _eventId, uint256 _id, uint256 _amt) public onlyTicketHolder(_eventId, _id) {
        //check for timelock
    //    eventIdToTicket[_eventId].burn(_id);
    //    emit TicketBurned(_eventId, _id, msg.sender, _amt);
    //}

    //function cancelEvent(uint256 _eventId) public onlyEventOwner(_eventId) {
        //check for timelock
    //    eventIdToTicket[_eventId].burnAll();
    //    eventIdByCreator[msg.sender][_eventId] = false;
    //}

    //function withdrawProfits(uint256 _eventId) public onlyEventOwner(_eventId) {
    //    eventIdToTicket[_eventId].withdraw();
    //}

}

