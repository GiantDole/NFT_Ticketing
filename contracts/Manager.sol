//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./ERC1155Factory.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Manager is ERC1155Factory, Ownable{

    //every erc1155 is one event
    //tokenid can appear more than once across events
    //give event unique ID


}

