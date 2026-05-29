// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {CaatOracle} from "./CaatOracle.sol";

contract CaatStaking is Ownable, ReentrancyGuard {
    IERC20 public immutable caatToken;
    CaatOracle public immutable caatOracle;

    uint256 public constant LOW_ETH_REWARD_RATE = 4;
    uint256 public constant HIGH_ETH_REWARD_RATE = 6;
    uint256 public constant ETH_PRICE_THRESHOLD_USD = 3000;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingTimestamp;

    constructor(
        address tokenAddress,
        address oracleAddress,
        address initialOwner
    ) Ownable(initialOwner) {
        caatToken = IERC20(tokenAddress);
        caatOracle = CaatOracle(oracleAddress);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");

        _claimReward(msg.sender);

        stakedBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;

        bool success = caatToken.transferFrom(
            msg.sender,
            address(this),
            amount
        );

        require(success, "Token transfer failed");
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(
            stakedBalance[msg.sender] >= amount,
            "Insufficient staked balance"
        );

        _claimReward(msg.sender);

        stakedBalance[msg.sender] -= amount;

        if (stakedBalance[msg.sender] == 0) {
            stakingTimestamp[msg.sender] = 0;
        } else {
            stakingTimestamp[msg.sender] = block.timestamp;
        }

        bool success = caatToken.transfer(msg.sender, amount);
        require(success, "Token transfer failed");
    }

    function claimReward() external nonReentrant {
        uint256 reward = _claimReward(msg.sender);
        require(reward > 0, "No reward available");
    }

    function _claimReward(address user) internal returns (uint256) {
        uint256 reward = calculateReward(user);

        if (reward == 0) {
            return 0;
        }

        stakingTimestamp[user] = block.timestamp;

        bool success = caatToken.transfer(user, reward);
        require(success, "Reward transfer failed");

        return reward;
    }

    function calculateReward(address user) public view returns (uint256) {
        uint256 balance = stakedBalance[user];

        if (balance == 0 || stakingTimestamp[user] == 0) {
            return 0;
        }

        uint256 stakingDuration =
            block.timestamp - stakingTimestamp[user];

        uint256 currentRewardRate = getCurrentRewardRate();

        return
            (balance * currentRewardRate * stakingDuration) /
            (100 * 365 days);
    }

    function getCurrentRewardRate() public view returns (uint256) {
        int256 ethPrice = caatOracle.getLatestETHPrice();
        require(ethPrice > 0, "Invalid ETH price");

        uint8 decimals = caatOracle.getPriceFeedDecimals();

        uint256 ethPriceInUSD =
            uint256(ethPrice) / (10 ** uint256(decimals));

        if (ethPriceInUSD > ETH_PRICE_THRESHOLD_USD) {
            return HIGH_ETH_REWARD_RATE;
        }

        return LOW_ETH_REWARD_RATE;
    }
}