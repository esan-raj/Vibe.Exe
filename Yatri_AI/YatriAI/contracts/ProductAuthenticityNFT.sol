// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ProductAuthenticityNFT
 * @dev ERC-721 NFT contract for product authenticity certificates
 * Minted by verified sellers/artisans for their products
 */
contract ProductAuthenticityNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Mapping from product ID to token ID
    mapping(string => uint256) public productToToken;
    
    // Mapping from token ID to product data
    mapping(uint256 => ProductData) public tokenProductData;
    
    // Mapping to check if seller is verified
    mapping(address => bool) public verifiedSellers;
    
    // Admin addresses who can verify sellers
    mapping(address => bool) public admins;
    
    struct ProductData {
        string productId;
        string productName;
        address seller;
        string artisanName;
        string category;
        string materials;
        string origin;
        uint256 createdAt;
        bool isAuthentic;
        string certificationNumber;
    }
    
    event ProductNFTMinted(
        uint256 indexed tokenId,
        address indexed seller,
        string productId,
        string productName
    );
    
    event SellerVerified(address indexed seller, bool verified);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier onlyVerifiedSeller() {
        require(verifiedSellers[msg.sender], "Not a verified seller");
        _;
    }
    
    constructor() ERC721("YatriAI Product Authenticity", "YATRI-PROD") Ownable(msg.sender) {
        admins[msg.sender] = true;
    }
    
    /**
     * @dev Add admin address
     */
    function addAdmin(address admin) external onlyOwner {
        require(admin != address(0), "Invalid address");
        admins[admin] = true;
        emit AdminAdded(admin);
    }
    
    /**
     * @dev Remove admin address
     */
    function removeAdmin(address admin) external onlyOwner {
        admins[admin] = false;
        emit AdminRemoved(admin);
    }
    
    /**
     * @dev Verify a seller (admin only)
     */
    function verifySeller(address seller, bool verified) external onlyAdmin {
        require(seller != address(0), "Invalid address");
        verifiedSellers[seller] = verified;
        emit SellerVerified(seller, verified);
    }
    
    /**
     * @dev Mint authenticity NFT for a product
     * @param productId Platform product ID
     * @param productName Name of the product
     * @param artisanName Name of the artisan
     * @param category Product category
     * @param materials Materials used
     * @param origin Origin/location of creation
     * @param certificationNumber Certification number
     * @param tokenURI IPFS URI for NFT metadata
     */
    function mintProductNFT(
        string memory productId,
        string memory productName,
        string memory artisanName,
        string memory category,
        string memory materials,
        string memory origin,
        string memory certificationNumber,
        string memory tokenURI
    ) external onlyVerifiedSeller returns (uint256) {
        require(productToToken[productId] == 0, "Product already has NFT");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        productToToken[productId] = newTokenId;
        
        tokenProductData[newTokenId] = ProductData({
            productId: productId,
            productName: productName,
            seller: msg.sender,
            artisanName: artisanName,
            category: category,
            materials: materials,
            origin: origin,
            createdAt: block.timestamp,
            isAuthentic: true,
            certificationNumber: certificationNumber
        });
        
        emit ProductNFTMinted(newTokenId, msg.sender, productId, productName);
        
        return newTokenId;
    }
    
    /**
     * @dev Revoke authenticity (admin only)
     */
    function revokeAuthenticity(uint256 tokenId) external onlyAdmin {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        tokenProductData[tokenId].isAuthentic = false;
    }
    
    /**
     * @dev Get product data for a token
     */
    function getProductData(uint256 tokenId) external view returns (ProductData memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenProductData[tokenId];
    }
    
    /**
     * @dev Get token ID for a product
     */
    function getProductTokenId(string memory productId) external view returns (uint256) {
        uint256 tokenId = productToToken[productId];
        require(tokenId > 0, "Product has no NFT");
        return tokenId;
    }
    
    /**
     * @dev Check if product has authenticity NFT
     */
    function hasAuthenticityNFT(string memory productId) external view returns (bool) {
        return productToToken[productId] > 0;
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
}






