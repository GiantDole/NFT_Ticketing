// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "./ERC2981Base.sol";

/**
 * @title A smart contract managing tickets for an event
 * @author Adrian Koegl
 * @notice token ids map to different ticket types; contract is owned by Ticket Manager contract
 * @dev own the payment token as escrow for the tickets
 * @dev potentially implement cancellation policy for the future
 * @dev limitation: the price has to be constant for a created ticket type (otherwise returning tickets won't work)
 * @dev implement withdraw constraints (centralized vs timestamp vs ...)
 */


contract ERC1155Ticketing is ERC1155Supply, ERC2981Base, IERC1155Receiver, Ownable {

    //The token that will be used to pay these tickets
    IERC20 paymentToken;

    //The organizer can set the royalties to a max of 3000 = 30 %
    uint public constant max_royalties = 3000;

    //Royalties set by the organizer
    RoyaltyInfo private _royalties;

    //Mapping of token ID to its URI
    //Every token has its URI in addition to the event URI
    mapping (uint256 => string) private _tokenURI;

    //Mapping of token ID to its price per token/ticket
    mapping(uint256 => uint256) private _ticketPrice;

    //Mapping of token ID to its maximum capacity
    mapping(uint256 => uint256) private _maxCap;

    event TokentypeCreated(uint256 id, uint256 capacity, uint256 price, string uri);

    /**
     * @notice this is the IPFS address for the event alone
     */
    constructor(address token_, string memory uri_, uint24 royalties_) ERC1155(uri_) {
        require(
            royalties_ <= max_royalties,
            "Ticketing: set royalties are above the maximum!"
        );
        _setRoyalties(address(this), royalties_);
        paymentToken = IERC20(token_);
    }

    /**
     * @notice creates a new ticket type that doesn't exist yet
     * @dev ticket types cannot be changed
     * @param id the token ID 
     * @param maxCap_ the maximum capacity available - can be changed
     * @param price the ticket price in payment token - cannot be changed
     * @param tokenURI_ the IPFS URI for the ticket type - cannot be changed
     */
    function createTicketType(
        uint256 id,
        uint256 maxCap_,
        uint256 price,
        string memory tokenURI_
    ) external onlyOwner {
        require(
            _maxCap[id] == 0 && maxCap_ > 0,
            "Ticketing: Ticket type exists already or the maximum capacity is not greater than 0"
        );
        _maxCap[id] = maxCap_;
        _tokenURI[id] = tokenURI_;
        emit TokentypeCreated(id, maxCap_, price, tokenURI_);
    }

    /**
     * @notice change the maximum capacity of a ticket type
     * @dev maximum capacity can be set lowe than current supply to stop selling this type
     * @dev maximum capacity cannot be set to 0 - set to -1 to stop selling
     * @param id ticket type ID
     * @param maxCap_ the new maximum ticket type capacity, cannot be 0
     */
    function changeCap(
        uint256 id,
        uint256 maxCap_
    ) external onlyOwner {
        require(
            _maxCap[id] > 0 && maxCap_ != 0,
            "Ticketing: Ticket type doesn't exist yet or you're trying to set the maximum capacity to 0. Try -1 instead!"
        );
        _maxCap[id] = maxCap_;
    }

    /**
     * @notice Users can buy and mint tickets up to the _maxCap
     * @dev the user needs to have enough funding for this purchase and approve this contract to use their payment tokens
     * @param to the address the tickets should be minted to
     * @param id the ticket id that should be minted
     * @param amount the amount of tickets to be minted
     */
    function mint(
        address to,
        uint256 id, 
        uint256 amount
    ) external {
        require(
            totalSupply(id) + amount <= _maxCap[id] &&
            paymentToken.transferFrom(msg.sender, address(this), _ticketPrice[id] * amount),
            "Ticketing: Ticket type not created, _maxCap reached, or payment failed"
        );
        _mint(to, id, amount, "");
    }

    /**
     * @notice Users can buy and mint tickets of different types up to the _maxCap
     * @dev the user needs to have enough funding for this purchase and approve this contract to use their payment tokens
     * @param to the address the tickets should be minted to
     * @param ids the ticket ids that should be minted
     * @param amounts the amount of tickets to be minted per type
     */
    function mintBatch(
        address to,
        uint256[] memory ids, 
        uint256[] memory amounts
    ) external {
        uint256 total = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            require( 
                totalSupply(ids[i]) + amounts[i] <= _maxCap[ids[i]], 
                "Ticketing: One of the ticket types was not created or its _maxCap was reached"
            );
            total += (amounts[i] * _ticketPrice[ids[i]]);
        }
        require(
            paymentToken.transferFrom(msg.sender, address(this), total),
            "Ticketing: Payment for tickets failed"
        );
        _mintBatch(to, ids, amounts, "");
    }

    /**
     * @notice the organizer can cancel purchased tickets and repay them
     * @dev can only be called by organizer and admin through manager contract
     * @param addr the address to cancel the tickets from
     * @param id the ticket type the organizer wants to cancel
     * @param amount the number of tickets to cancel
     */
    function cancel(
        address addr,
        uint256 id,
        uint256 amount
    ) external onlyOwner {
        require(
            paymentToken.approve(addr, _ticketPrice[id] * amount),
            "Ticketing: Couldn't perform token payment to cancel tickets"
        );
        safeTransferFrom(addr, address(this), id, amount, "");
    }

    /**
     * @notice burn unsold tickets that are owned by this contract
     * @dev only the event organizer and admin can burn tickets through the manager contract that have not been sold yet
     */
    function burn(
        uint256 id,
        uint256 amount
    ) external onlyOwner {
        _burn(address(this), id, amount);
    }

    /**
     * @notice several ticket types owned by this contract can be reduced in their amount
     * @dev only accessible by organizer and admin through manager contract
     */
    function burnBatch(
        uint256[] memory ids,
        uint256[] memory amounts
    ) external onlyOwner {
        _burnBatch(address(this), ids, amounts);
    }

    /**
     * @notice the organizer can withdraw the available funds from ticket purchases
     * @dev only accessible by organizer
     * @dev no constraints for withdraw are set yet
     */
    function withdraw(
        address to
    ) external onlyOwner {
        paymentToken.transferFrom(address(this), to, paymentToken.balanceOf(address(this)));
    }

    /**
     * @notice for backend to transfer ticket on credit card purchase
     * @dev our backend can also only transfer tickets the organizer has actually minted
     */
    function adminTransfer(
        address to,
        uint256 id,
        uint256 amount
    ) public onlyOwner {
        _safeTransferFrom(address(this), to, id, amount, "");
    }


    /**
     * @dev we need the input parameters to match IERC1155Receiver's signature, right? Without the IERC1155Receiver receiving tokens will fail.
     */
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external pure returns (bytes4) {
        return 0xf23a6e61;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external pure returns (bytes4) {
        return 0xbc197c81;
    }

    /**
     * @notice get the IPFS URI for a ticket type
     * @param tokenID the ID of the ticket type
     * @return uri the URI of the ticket metadata
     */
    function tokenURI(uint256 tokenID) public view returns (string memory uri) { 
        return(_tokenURI[tokenID]); 
    } 

    // This is just for OpenSea to find your metadata containing the royalties. 
    // This metadata is about the contract and not the individual NFTs
    function contractURI() public view returns (string memory) {
        return super.uri(0);
    }

    /**
     * @notice get the ticket price of a ticket type
     * @param tokenID the ID of the ticket type
     * @return price the price of the ticket type
     */
    function ticketPrice(uint256 tokenID) public view returns (uint256 price) {
        return(_ticketPrice[tokenID]);
    }

    /**
     * @notice get the maximum capacity for a ticket type
     * @param tokenID the ID of the ticket type
     * @return capacity the current maximum capacity of this ticket type
     */
    function maxCap(uint256 tokenID) public view returns (uint256 capacity) {
        return(_maxCap[tokenID]);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, ERC2981Base, IERC165) returns (bool) {
        return ERC2981Base.supportsInterface(interfaceId) || ERC1155.supportsInterface(interfaceId);
    }

    // Value is in basis points so 10000 = 100% , 100 = 1% etc
    function _setRoyalties(address recipient, uint256 value) internal {
        require(value <= max_royalties, 'ERC2981Royalties: Too high');
        _royalties = RoyaltyInfo(recipient, uint24(value));
    }


    function royaltyInfo(uint256, uint256 value)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        RoyaltyInfo memory royalties = _royalties;
        receiver = royalties.recipient;
        royaltyAmount = (value * royalties.amount) / 10000;
    }
}