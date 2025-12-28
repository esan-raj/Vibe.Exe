// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MarketplaceEscrow
 * @dev Escrow contract for marketplace purchases
 * Holds funds until delivery confirmation or timeout
 */
contract MarketplaceEscrow is Ownable, ReentrancyGuard {
    struct Escrow {
        uint256 escrowId;
        address buyer;
        address seller;
        uint256 amount;
        string productId;
        uint256 createdAt;
        uint256 releaseTime;
        bool released;
        bool disputed;
        EscrowStatus status;
    }
    
    enum EscrowStatus {
        Pending,
        Confirmed,
        Released,
        Refunded,
        Disputed
    }
    
    mapping(uint256 => Escrow) public escrows;
    mapping(address => uint256[]) public buyerEscrows;
    mapping(address => uint256[]) public sellerEscrows;
    
    uint256 private _escrowCounter;
    uint256 public constant DEFAULT_RELEASE_TIME = 7 days;
    uint256 public platformFee = 250; // 2.5% (basis points)
    address public platformWallet;
    
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        string productId
    );
    
    event EscrowReleased(uint256 indexed escrowId, address indexed seller);
    event EscrowRefunded(uint256 indexed escrowId, address indexed buyer);
    event EscrowDisputed(uint256 indexed escrowId);
    
    constructor(address _platformWallet) Ownable(msg.sender) {
        platformWallet = _platformWallet;
    }
    
    /**
     * @dev Create escrow for a purchase
     */
    function createEscrow(
        address seller,
        string memory productId
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(seller != address(0), "Invalid seller address");
        require(seller != msg.sender, "Cannot buy from yourself");
        
        _escrowCounter++;
        uint256 escrowId = _escrowCounter;
        
        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            productId: productId,
            createdAt: block.timestamp,
            releaseTime: block.timestamp + DEFAULT_RELEASE_TIME,
            released: false,
            disputed: false,
            status: EscrowStatus.Pending
        });
        
        buyerEscrows[msg.sender].push(escrowId);
        sellerEscrows[seller].push(escrowId);
        
        emit EscrowCreated(escrowId, msg.sender, seller, msg.value, productId);
        
        return escrowId;
    }
    
    /**
     * @dev Confirm delivery and release funds to seller
     */
    function confirmDelivery(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.buyer == msg.sender, "Only buyer can confirm");
        require(escrow.status == EscrowStatus.Pending, "Invalid status");
        require(!escrow.released, "Already released");
        
        escrow.status = EscrowStatus.Confirmed;
        escrow.released = true;
        
        uint256 fee = (escrow.amount * platformFee) / 10000;
        uint256 sellerAmount = escrow.amount - fee;
        
        payable(escrow.seller).transfer(sellerAmount);
        payable(platformWallet).transfer(fee);
        
        emit EscrowReleased(escrowId, escrow.seller);
    }
    
    /**
     * @dev Release funds after timeout (automatic release)
     */
    function releaseAfterTimeout(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(block.timestamp >= escrow.releaseTime, "Release time not reached");
        require(escrow.status == EscrowStatus.Pending, "Invalid status");
        require(!escrow.released, "Already released");
        
        escrow.status = EscrowStatus.Released;
        escrow.released = true;
        
        uint256 fee = (escrow.amount * platformFee) / 10000;
        uint256 sellerAmount = escrow.amount - fee;
        
        payable(escrow.seller).transfer(sellerAmount);
        payable(platformWallet).transfer(fee);
        
        emit EscrowReleased(escrowId, escrow.seller);
    }
    
    /**
     * @dev Refund to buyer (before timeout)
     */
    function refund(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.buyer == msg.sender || msg.sender == owner(), "Unauthorized");
        require(escrow.status == EscrowStatus.Pending, "Invalid status");
        require(block.timestamp < escrow.releaseTime, "Use releaseAfterTimeout");
        require(!escrow.released, "Already released");
        
        escrow.status = EscrowStatus.Refunded;
        escrow.released = true;
        
        payable(escrow.buyer).transfer(escrow.amount);
        
        emit EscrowRefunded(escrowId, escrow.buyer);
    }
    
    /**
     * @dev Dispute escrow (requires admin)
     */
    function disputeEscrow(uint256 escrowId) external onlyOwner {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Pending, "Invalid status");
        
        escrow.status = EscrowStatus.Disputed;
        escrow.disputed = true;
        
        emit EscrowDisputed(escrowId);
    }
    
    /**
     * @dev Get escrow details
     */
    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }
    
    /**
     * @dev Get buyer's escrows
     */
    function getBuyerEscrows(address buyer) external view returns (uint256[] memory) {
        return buyerEscrows[buyer];
    }
    
    /**
     * @dev Get seller's escrows
     */
    function getSellerEscrows(address seller) external view returns (uint256[] memory) {
        return sellerEscrows[seller];
    }
    
    /**
     * @dev Update platform fee (owner only)
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        platformFee = _fee;
    }
    
    /**
     * @dev Update platform wallet (owner only)
     */
    function setPlatformWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        platformWallet = _wallet;
    }
}






