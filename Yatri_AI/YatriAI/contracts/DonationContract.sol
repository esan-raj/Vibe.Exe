// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DonationContract
 * @dev Transparent donation contract for Pandal committees
 * All donations are publicly visible on blockchain
 */
contract DonationContract is Ownable, ReentrancyGuard {
    struct Donation {
        uint256 donationId;
        address donor;
        address recipient;
        uint256 amount;
        string pandalId;
        string message;
        uint256 timestamp;
    }
    
    struct Pandal {
        string pandalId;
        string name;
        address wallet;
        uint256 totalRaised;
        uint256 donorCount;
        bool active;
    }
    
    mapping(uint256 => Donation) public donations;
    mapping(string => Pandal) public pandals;
    mapping(address => uint256[]) public donorDonations;
    mapping(string => uint256[]) public pandalDonations;
    
    uint256 private _donationCounter;
    uint256 public platformFee = 100; // 1% (basis points)
    address public platformWallet;
    
    event DonationMade(
        uint256 indexed donationId,
        address indexed donor,
        address indexed recipient,
        uint256 amount,
        string pandalId,
        string message
    );
    
    event PandalRegistered(string indexed pandalId, string name, address wallet);
    event PandalUpdated(string indexed pandalId, address newWallet);
    
    constructor(address _platformWallet) Ownable(msg.sender) {
        platformWallet = _platformWallet;
    }
    
    /**
     * @dev Register a new Pandal committee
     */
    function registerPandal(
        string memory pandalId,
        string memory name,
        address wallet
    ) external onlyOwner {
        require(wallet != address(0), "Invalid wallet address");
        require(bytes(pandals[pandalId].pandalId).length == 0, "Pandal already exists");
        
        pandals[pandalId] = Pandal({
            pandalId: pandalId,
            name: name,
            wallet: wallet,
            totalRaised: 0,
            donorCount: 0,
            active: true
        });
        
        emit PandalRegistered(pandalId, name, wallet);
    }
    
    /**
     * @dev Make a donation to a Pandal
     */
    function donate(
        string memory pandalId,
        string memory message
    ) external payable nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");
        Pandal storage pandal = pandals[pandalId];
        require(bytes(pandal.pandalId).length > 0, "Pandal not found");
        require(pandal.active, "Pandal not active");
        
        _donationCounter++;
        uint256 donationId = _donationCounter;
        
        // Check if first donation from this donor
        bool isNewDonor = pandalDonations[pandalId].length == 0 || 
                         donations[pandalDonations[pandalId][0]].donor != msg.sender;
        
        if (isNewDonor) {
            pandal.donorCount++;
        }
        
        donations[donationId] = Donation({
            donationId: donationId,
            donor: msg.sender,
            recipient: pandal.wallet,
            amount: msg.value,
            pandalId: pandalId,
            message: message,
            timestamp: block.timestamp
        });
        
        donorDonations[msg.sender].push(donationId);
        pandalDonations[pandalId].push(donationId);
        
        // Update total raised
        pandal.totalRaised += msg.value;
        
        // Calculate fees
        uint256 fee = (msg.value * platformFee) / 10000;
        uint256 recipientAmount = msg.value - fee;
        
        // Transfer funds
        payable(pandal.wallet).transfer(recipientAmount);
        if (fee > 0) {
            payable(platformWallet).transfer(fee);
        }
        
        emit DonationMade(donationId, msg.sender, pandal.wallet, msg.value, pandalId, message);
    }
    
    /**
     * @dev Get donation details
     */
    function getDonation(uint256 donationId) external view returns (Donation memory) {
        return donations[donationId];
    }
    
    /**
     * @dev Get Pandal details
     */
    function getPandal(string memory pandalId) external view returns (Pandal memory) {
        return pandals[pandalId];
    }
    
    /**
     * @dev Get donor's donations
     */
    function getDonorDonations(address donor) external view returns (uint256[] memory) {
        return donorDonations[donor];
    }
    
    /**
     * @dev Get Pandal's donations
     */
    function getPandalDonations(string memory pandalId) external view returns (uint256[] memory) {
        return pandalDonations[pandalId];
    }
    
    /**
     * @dev Update Pandal wallet (owner only)
     */
    function updatePandalWallet(string memory pandalId, address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid address");
        Pandal storage pandal = pandals[pandalId];
        require(bytes(pandal.pandalId).length > 0, "Pandal not found");
        
        pandal.wallet = newWallet;
        emit PandalUpdated(pandalId, newWallet);
    }
    
    /**
     * @dev Toggle Pandal active status
     */
    function togglePandalStatus(string memory pandalId) external onlyOwner {
        Pandal storage pandal = pandals[pandalId];
        require(bytes(pandal.pandalId).length > 0, "Pandal not found");
        pandal.active = !pandal.active;
    }
    
    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 500, "Fee too high"); // Max 5%
        platformFee = _fee;
    }
    
    /**
     * @dev Update platform wallet
     */
    function setPlatformWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        platformWallet = _wallet;
    }
}






