// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockPriceFeed {
    int256 private price;
    uint8 private priceDecimals;

    constructor(uint8 decimals_, int256 initialPrice) {
        priceDecimals = decimals_;
        price = initialPrice;
    }

    function decimals() external view returns (uint8) {
        return priceDecimals;
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            1,
            price,
            block.timestamp,
            block.timestamp,
            1
        );
    }

    function updatePrice(int256 newPrice) external {
        price = newPrice;
    }
}