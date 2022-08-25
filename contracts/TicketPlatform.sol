// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ERC1155Ticketing";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title A smart contract representing tickets for an event
 * @author Adrian Koegl
 * @notice token ids map to different ticket types
 * @dev ToDo: transact tickets 
 * 
 */

contract TicketPlatform is ERC1155Ticketing {

    //The token that will be used to pay these tickets
    IERC20 paymentToken;

    mapping(uint256 => uint256) public ticketPrice;

    //Max number of tickets that can be owned by one address
    uint8 private _maxtickets;

    
    constructor(uint256 ticketPrice_, address token_, uint8 maxtickets_) ERC1155("https://example.com/{id}.json") {
        _maxtickets = maxtickets_;
        paymentToken = IERC20(token_);
        _ticketPrice = ticketPrice_;

    }
    

    function getAmount(uint256 _token) external view returns(uint256 amount) {
        return _amounts[_token];
    }

    /**
     * @notice Users can buy tickets using this function
     * @dev the purchase has to be meeting the constraints set by the organizer
     */
    function purchaseTicket(address to, uint256 id, uint256 amount, ) {
        require(
            _balances[id][to] + amount <= _maxtickets && paymentToken.transferFrom(msg.sender, address(this), _ticketPrice);
        );
        _mint(to, id, amount, data);
        _amounts[id] += amount;
    }

}
