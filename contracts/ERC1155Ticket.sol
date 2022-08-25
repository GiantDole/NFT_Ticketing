// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
 * @title Extension for ERC1155 optimized for ticketing
 * @author Adrian Koegl
 * @notice mint a
 * @dev minting and burning 
 * 
 */

contract ERC1155Ticketing is ERC1155, Ownable {

    //Mapping from token ID to its total available amount
    mapping(uint256 => uint256) public _availableAmount;

    //Mapping from token ID to its total amount of minted tokens
    mapping(uint256 => uint256) private _amounts;

    /**
     * @notice This function can only be used by the owner to mint new tickets
     */
    function mint(address to, uint256 id, uint256 amount, bytes memory data) external onlyOwner {
        _mint(to, id, amount, data);
        _amounts[id] += amount;
    }

    /**
     * @notice organizer has to buy tickets back to burn them
     * @dev only the event organizer can burn tickets of one type that they own
     */
    function burn(
        address account,
        uint256 id,
        uint256 amount
    ) external override onlyOwner {
        require(
            account == _msgSender() || isApprovedForAll(account, _msgSender()),
            "ERC1155: caller is not token owner or approved"
        );

        _burn(account, id, amount);
        _amounts[id] -= amount;
    }
}