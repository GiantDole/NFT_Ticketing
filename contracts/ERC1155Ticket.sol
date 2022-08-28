// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title A smart contract managing tickets for an event
 * @author Adrian Koegl
 * @notice token ids map to different ticket types; contract is owned by Ticket Manager contract
 * @dev own the payment token as escrow for the tickets
 * Include total ticket number ?
 */

//TODO: implement to first create a token type before minting tickets
//Where do we define the price?

contract ERC1155Ticketing is ERC1155Supply, IERC1155Receiver, Ownable {

    //The token that will be used to pay these tickets
    IERC20 paymentToken;

    //Mapping of token ID to its price per token/ticket
    mapping(uint256 => uint256) public ticketPrice;

    event TokentypeCreated(uint256 id, uint256 amount, uint256 price);


    constructor(address token_) ERC1155("https://example.com/{id}.json") {
        paymentToken = IERC20(token_);
    }

    /**
     * @notice mint new tickets of a ticket type
     * @dev emits an event if its a new ticket type
     */
    function mint(
        uint256 id, 
        uint256 amount,
        uint256 price
    ) public onlyOwner {
        if(totalSupply(id) == 0) {
            ticketPrice[id] = price;
            emit TokentypeCreated(id, amount, price);
        }
        _mint(address(this), id, amount, "");
    }

    function mintBatch(
        uint256[] memory ids, 
        uint256[] memory amounts,
        uint256[] memory prices
    ) public onlyOwner {
        require(ids.length == prices.length, "The prices array has to be of equal length!");
        for (uint256 i = 0; i < ids.length; i++) {
            if(totalSupply(ids[i]) == 0) {
                ticketPrice[ids[i]] = prices[i];
                emit TokentypeCreated(ids[i], amounts[i], prices[i]);
            }
        }
        _mintBatch(address(this), ids, amounts, "");
    }

    /**
     * @notice Users can buy tickets using this function
     * @dev User needs to approve this contract first on the token contract
     */
    function purchaseTicket(
        address to, 
        uint256 id, 
        uint256 amount
    ) public {
        require(
            paymentToken.transferFrom(msg.sender, address(this), ticketPrice[id] * amount),
            "Couldn't transfer tokens to the ticket contract to purchase tickets"
        );
        _safeTransferFrom(address(this), to, id, amount, "");
    }

    /**
     * @notice burns one ticket of the given address and repays them
     * @dev can only be called by the manager contract; potentially save buy price to not pay a new ticket price
     */
    function cancel(
        address addr,
        uint256 id,
        uint256 amount
    ) public onlyOwner {
        require(
            paymentToken.transferFrom(address(this), addr, ticketPrice[id] * amount),
            "Couldn't perform token payment to cancel tickets"
        );
        _burn(addr, id, amount);
    }

    /**
     * @notice tickets have to be owned by this contract to burn them
     * @dev only the event organizer can burn tickets through the manager contract that have not been sold yet
     */
    function burn(
        uint256 id,
        uint256 amount
    ) public onlyOwner {
        _burn(address(this), id, amount);
    }

    /**
     * @notice several ticket types owned by this contract can be reduced in their amount
     * 
     */
    function burnBatch(
        uint256[] memory ids,
        uint256[] memory amounts
    ) public onlyOwner {
        _burnBatch(address(this), ids, amounts);
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

}