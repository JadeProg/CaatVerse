// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CaatNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("CaatVerse Collectibles", "CAATNFT")
        Ownable(initialOwner)
    {}

    function mintNFT(address to, string memory tokenURI)
        external
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        _nextTokenId++;

        return tokenId;
    }
}