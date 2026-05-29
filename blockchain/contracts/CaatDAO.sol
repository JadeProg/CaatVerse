// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CaatDAO is Ownable {
    IERC20 public immutable caatToken;

    struct Proposal {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        bool active;
    }

    Proposal[] public proposals;

    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed proposalId, string description);
    event VoteRegistered(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votingPower
    );
    event ProposalClosed(uint256 indexed proposalId);

    constructor(address tokenAddress, address initialOwner)
        Ownable(initialOwner)
    {
        caatToken = IERC20(tokenAddress);
    }

    function createProposal(string calldata description) external onlyOwner {
        require(bytes(description).length > 0, "Description cannot be empty");

        proposals.push(
            Proposal({
                description: description,
                votesFor: 0,
                votesAgainst: 0,
                active: true
            })
        );

        emit ProposalCreated(proposals.length - 1, description);
    }

    function vote(uint256 proposalId, bool support) external {
        require(proposalId < proposals.length, "Proposal does not exist");

        Proposal storage proposal = proposals[proposalId];

        require(proposal.active, "Proposal is not active");
        require(!hasVoted[proposalId][msg.sender], "You already voted");

        uint256 votingPower = caatToken.balanceOf(msg.sender);
        require(votingPower > 0, "You need CAAT tokens to vote");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.votesFor += votingPower;
        } else {
            proposal.votesAgainst += votingPower;
        }

        emit VoteRegistered(proposalId, msg.sender, support, votingPower);
    }

    function closeProposal(uint256 proposalId) external onlyOwner {
        require(proposalId < proposals.length, "Proposal does not exist");

        Proposal storage proposal = proposals[proposalId];
        require(proposal.active, "Proposal already closed");

        proposal.active = false;

        emit ProposalClosed(proposalId);
    }

    function totalProposals() external view returns (uint256) {
        return proposals.length;
    }
}