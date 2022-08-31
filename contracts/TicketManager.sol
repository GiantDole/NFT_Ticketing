//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./ERC1155Ticket.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract TicketManager is AccessControl{

    bytes32 public constant CREATOR_ROLE = keccak256("EVENT_CREATOR_ROLE");
    
    mapping(uint256 => address) private eventIdToTicket;
    
    event EventCreated(uint256 indexed _eventId, address _contractAddress, string _uri);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CREATOR_ROLE, msg.sender);
    }

    modifier onlyAdminorOrganizer(uint eventID) {
        require(
            hasRole(keccak256(abi.encodePacked(eventID)), msg.sender) ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            ""
        );
        _;
    }
    
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
    ) external onlyRole(CREATOR_ROLE) returns (address) {
        require(
            address(eventIdToTicket[eventID_]) == address(0),
            "Manager: Event with this ID already exists"
        );

        ERC1155Ticketing userEvent = new ERC1155Ticketing(
            token_,
            uri_,
            uint24(royalties_)
        );

        eventIdToTicket[eventID_] = address(userEvent);
        //eventIdByCreator[msg.sender][eventID_] = true;
        bytes32 newRole = keccak256(abi.encodePacked(eventID_));
        _grantRole(newRole, msg.sender);
        emit EventCreated(eventID_, address(userEvent), uri_);
        return address(userEvent);
    }

    function createTicketType(
        uint eventID_, 
        uint ticketID_, 
        uint maxCap_, 
        uint price_,
        string memory tokenURI_
    ) external onlyRole(keccak256(abi.encodePacked(eventID_))){
        ERC1155Ticketing(eventIdToTicket[eventID_]).createTicketType(
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
    public onlyRole(keccak256(abi.encodePacked(eventID_))) {
        ERC1155Ticketing(eventIdToTicket[eventID_]).changeCap(
            ticketID_, 
            maxCap_
        );
    }

    function addAdditonalTicket(
        uint256 _eventID, 
        uint256 id, 
        uint256 maxCap_, 
        uint256 price, 
        string memory tokenURI_)
    public onlyRole(keccak256(abi.encodePacked(_eventID))) {
        ERC1155Ticketing(eventIdToTicket[_eventID]).createTicketType(id, maxCap_, price, tokenURI_);
    }
    
    
    function buyTicket(
        address to,
        uint256 _eventID, 
        uint256 _ticketID, 
        uint256 _amt) 
    public {
        ERC1155Ticketing(eventIdToTicket[_eventID]).mint(to, msg.sender, _ticketID, _amt);
    }

    function batchBuyTickets(
        address to,
        uint256 _eventID, 
        uint256[] memory _ticketIds, 
        uint256[] memory _amounts
    ) external {
        ERC1155Ticketing(eventIdToTicket[_eventID]).mintBatch(to, msg.sender, _ticketIds, _amounts);
    }

    function getEventByID(
        uint _eventID
    ) external view returns(address) {
        return address(eventIdToTicket[_eventID]);
    }

    function authorizeCreator(
        address[] memory creators
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        for(uint i=0; i<creators.length; i++) {
            _grantRole(CREATOR_ROLE, creators[i]);
        }
    }

    ///@dev taking bytes32 input is more efficient
    function addEventOrganizer(
        uint eventID_,
        address[] memory organizers
    ) external onlyAdminorOrganizer(eventID_) {
        bytes32 newRole = keccak256(abi.encodePacked(eventID_));
        for(uint i=0; i < organizers.length; i++) {
            _grantRole(newRole, organizers[i]);
        }
    }

    function getRoleKeccak(uint eventID_) external pure returns(bytes32) {
        return keccak256(abi.encodePacked(eventID_));
    }

    function getCreatorKeccak() external pure returns(bytes32) {
        return CREATOR_ROLE;
    }

    function getAdminKeccak() external pure returns(bytes32) {
        return DEFAULT_ADMIN_ROLE;
    }
}

