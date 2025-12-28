// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GuideCertificationNFT
 * @dev ERC-721 NFT contract for guide certifications
 * Only platform admin can mint certificates for verified guides
 */
contract GuideCertificationNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Mapping from guide address to token ID
    mapping(address => uint256) public guideToToken;
    
    // Mapping from token ID to certification data
    mapping(uint256 => CertificationData) public tokenCertificationData;
    
    // Mapping to check if guide has certification
    mapping(address => bool) public hasCertification;
    
    // Admin addresses who can mint certificates
    mapping(address => bool) public admins;
    
    struct CertificationData {
        address guideAddress;
        string guideName;
        string guideId;
        string specialization;
        uint256 issuedAt;
        uint256 expiresAt; // 0 means never expires
        bool isActive;
        string[] verifiedSkills;
    }
    
    event CertificationMinted(
        uint256 indexed tokenId,
        address indexed guide,
        string guideName,
        uint256 expiresAt
    );
    
    event CertificationRevoked(uint256 indexed tokenId, address indexed guide);
    event CertificationRenewed(uint256 indexed tokenId, uint256 newExpiresAt);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    constructor() ERC721("YatriAI Guide Certification", "YATRI-GUIDE") Ownable(msg.sender) {
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
     * @dev Mint certification NFT for a guide
     * @param guide Address of the guide
     * @param guideName Name of the guide
     * @param guideId Platform guide ID
     * @param specialization Guide's specialization
     * @param expiresAt Expiration timestamp (0 for no expiration)
     * @param verifiedSkills Array of verified skills
     * @param tokenURI IPFS URI for NFT metadata
     */
    function mintCertification(
        address guide,
        string memory guideName,
        string memory guideId,
        string memory specialization,
        uint256 expiresAt,
        string[] memory verifiedSkills,
        string memory tokenURI
    ) external onlyAdmin returns (uint256) {
        require(guide != address(0), "Invalid guide address");
        require(!hasCertification[guide], "Guide already has certification");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(guide, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        guideToToken[guide] = newTokenId;
        hasCertification[guide] = true;
        
        tokenCertificationData[newTokenId] = CertificationData({
            guideAddress: guide,
            guideName: guideName,
            guideId: guideId,
            specialization: specialization,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            isActive: true,
            verifiedSkills: verifiedSkills
        });
        
        emit CertificationMinted(newTokenId, guide, guideName, expiresAt);
        
        return newTokenId;
    }
    
    /**
     * @dev Revoke certification
     */
    function revokeCertification(address guide) external onlyAdmin {
        require(hasCertification[guide], "Guide has no certification");
        
        uint256 tokenId = guideToToken[guide];
        tokenCertificationData[tokenId].isActive = false;
        hasCertification[guide] = false;
        
        emit CertificationRevoked(tokenId, guide);
    }
    
    /**
     * @dev Renew certification
     */
    function renewCertification(address guide, uint256 newExpiresAt) external onlyAdmin {
        require(hasCertification[guide], "Guide has no certification");
        
        uint256 tokenId = guideToToken[guide];
        tokenCertificationData[tokenId].expiresAt = newExpiresAt;
        tokenCertificationData[tokenId].isActive = true;
        
        emit CertificationRenewed(tokenId, newExpiresAt);
    }
    
    /**
     * @dev Check if certification is valid
     */
    function isCertificationValid(address guide) external view returns (bool) {
        if (!hasCertification[guide]) {
            return false;
        }
        
        uint256 tokenId = guideToToken[guide];
        CertificationData memory cert = tokenCertificationData[tokenId];
        
        if (!cert.isActive) {
            return false;
        }
        
        if (cert.expiresAt > 0 && block.timestamp > cert.expiresAt) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Get certification data
     */
    function getCertificationData(uint256 tokenId) external view returns (CertificationData memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenCertificationData[tokenId];
    }
    
    /**
     * @dev Get guide's certification token ID
     */
    function getGuideTokenId(address guide) external view returns (uint256) {
        require(hasCertification[guide], "Guide has no certification");
        return guideToToken[guide];
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
}






