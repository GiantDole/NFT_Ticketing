// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Ticket_Platform is ERC1155Burnable, Ownable {

    //Mapping from token ID to its amount
    mapping(uint256 => uint256) private _amounts;
    
    constructor() ERC1155("https://example.com/{id}.json") {
    }

    function getAmount(uint256 _token) external view returns(uint256 amount) {
        return _amounts[_token];
    }

    function mint(address to, uint256 id, uint256 amount, bytes memory data) external onlyOwner {
        _mint(to, id, amount, data);
        _amounts[id] += amount;
    }

}
