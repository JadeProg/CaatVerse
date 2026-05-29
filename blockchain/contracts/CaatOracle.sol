// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract CaatOracle {
    AggregatorV3Interface internal priceFeed;

    constructor(address priceFeedAddress) {
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function getLatestETHPrice() public view returns (int256) {
        (
            ,
            int256 price,
            ,
            ,
            
        ) = priceFeed.latestRoundData();

        return price;
    }

    function getPriceFeedDecimals() public view returns (uint8) {
        return priceFeed.decimals();
    }
}