// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title HeritageNFT
 * @dev ERC-721 NFT contract for heritage location badges
 * Users can mint NFTs when they visit heritage locations
 */
contract HeritageNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Mapping from location ID to token ID
    mapping(string => uint256) public locationToToken;
    
    // Mapping from token ID to location data
    mapping(uint256 => LocationData) public tokenLocationData;
    
    // Mapping to track if user already minted for a location
    mapping(address => mapping(string => bool)) public userMintedLocation;
    
    struct LocationData {
        string locationId;
        string locationName;
        string category;
        string rarity;
        uint256 visitTimestamp;
        uint256 points;
    }
    
    event HeritageNFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string locationId,
        string locationName,
        string rarity
    );
    
    constructor() ERC721("YatriAI Heritage NFT", "YATRI") Ownable(msg.sender) {}
    
    /**
     * @dev Mint NFT for a heritage location visit
     * @param to Address to mint NFT to
     * @param locationId Unique identifier for the location
     * @param locationName Name of the heritage location
     * @param category Category (Monument, Temple, etc.)
     * @param rarity Rarity level (Common, Rare, Epic, Legendary)
     * @param points Points awarded for this location
     * @param tokenURI IPFS URI for NFT metadata
     */
    function mintHeritageNFT(
        address to,
        string memory locationId,
        string memory locationName,
        string memory category,
        string memory rarity,
        uint256 points,
        string memory tokenURI
    ) external returns (uint256) {
        require(!userMintedLocation[to][locationId], "Already minted for this location");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        locationToToken[locationId] = newTokenId;
        userMintedLocation[to][locationId] = true;
        
        tokenLocationData[newTokenId] = LocationData({
            locationId: locationId,
            locationName: locationName,
            category: category,
            rarity: rarity,
            visitTimestamp: block.timestamp,
            points: points
        });
        
        emit HeritageNFTMinted(newTokenId, to, locationId, locationName, rarity);
        
        return newTokenId;
    }
    
    /**
     * @dev Get location data for a token
     */
    function getLocationData(uint256 tokenId) external view returns (LocationData memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenLocationData[tokenId];
    }
    
    /**
     * @dev Check if user has minted for a location
     */
    function hasMintedLocation(address user, string memory locationId) external view returns (bool) {
        return userMintedLocation[user][locationId];
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
}






