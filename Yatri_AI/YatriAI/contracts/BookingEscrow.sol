// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BookingEscrow
 * @dev Escrow contract for guide bookings
 * Holds payment until booking completion or cancellation
 */
contract BookingEscrow is Ownable, ReentrancyGuard {
    struct Booking {
        uint256 bookingId;
        address tourist;
        address guide;
        uint256 amount;
        string bookingRef; // Platform booking reference
        uint256 createdAt;
        uint256 startDate;
        uint256 endDate;
        uint256 releaseTime; // Auto-release after this time
        bool released;
        bool cancelled;
        BookingStatus status;
    }
    
    enum BookingStatus {
        Pending,
        Confirmed,
        InProgress,
        Completed,
        Cancelled,
        Disputed
    }
    
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public touristBookings;
    mapping(address => uint256[]) public guideBookings;
    mapping(string => uint256) public bookingRefToId;
    
    uint256 private _bookingCounter;
    uint256 public constant DEFAULT_RELEASE_TIME = 3 days; // Release 3 days after end date
    uint256 public platformFee = 300; // 3% (basis points)
    address public platformWallet;
    
    event BookingCreated(
        uint256 indexed bookingId,
        address indexed tourist,
        address indexed guide,
        uint256 amount,
        string bookingRef
    );
    
    event BookingConfirmed(uint256 indexed bookingId);
    event BookingCompleted(uint256 indexed bookingId, address indexed guide);
    event BookingCancelled(uint256 indexed bookingId, address indexed refundTo);
    event BookingDisputed(uint256 indexed bookingId);
    
    constructor(address _platformWallet) Ownable(msg.sender) {
        platformWallet = _platformWallet;
    }
    
    /**
     * @dev Create escrow for a booking
     */
    function createBookingEscrow(
        address guide,
        string memory bookingRef,
        uint256 startDate,
        uint256 endDate
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(guide != address(0), "Invalid guide address");
        require(guide != msg.sender, "Cannot book yourself");
        require(bookingRefToId[bookingRef] == 0, "Booking reference already exists");
        require(endDate > startDate, "Invalid dates");
        
        _bookingCounter++;
        uint256 bookingId = _bookingCounter;
        
        uint256 releaseTime = endDate + DEFAULT_RELEASE_TIME;
        
        bookings[bookingId] = Booking({
            bookingId: bookingId,
            tourist: msg.sender,
            guide: guide,
            amount: msg.value,
            bookingRef: bookingRef,
            createdAt: block.timestamp,
            startDate: startDate,
            endDate: endDate,
            releaseTime: releaseTime,
            released: false,
            cancelled: false,
            status: BookingStatus.Pending
        });
        
        bookingRefToId[bookingRef] = bookingId;
        touristBookings[msg.sender].push(bookingId);
        guideBookings[guide].push(bookingId);
        
        emit BookingCreated(bookingId, msg.sender, guide, msg.value, bookingRef);
        
        return bookingId;
    }
    
    /**
     * @dev Confirm booking (by guide)
     */
    function confirmBooking(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(booking.guide == msg.sender, "Only guide can confirm");
        require(booking.status == BookingStatus.Pending, "Invalid status");
        
        booking.status = BookingStatus.Confirmed;
        emit BookingConfirmed(bookingId);
    }
    
    /**
     * @dev Mark booking as in progress (by guide)
     */
    function startBooking(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(booking.guide == msg.sender, "Only guide can start");
        require(booking.status == BookingStatus.Confirmed, "Must be confirmed first");
        require(block.timestamp >= booking.startDate, "Booking not started yet");
        
        booking.status = BookingStatus.InProgress;
    }
    
    /**
     * @dev Complete booking and release funds to guide
     */
    function completeBooking(uint256 bookingId) external nonReentrant {
        Booking storage booking = bookings[bookingId];
        require(
            booking.tourist == msg.sender || booking.guide == msg.sender,
            "Unauthorized"
        );
        require(booking.status == BookingStatus.InProgress, "Must be in progress");
        require(!booking.released, "Already released");
        
        booking.status = BookingStatus.Completed;
        booking.released = true;
        
        uint256 fee = (booking.amount * platformFee) / 10000;
        uint256 guideAmount = booking.amount - fee;
        
        payable(booking.guide).transfer(guideAmount);
        if (fee > 0) {
            payable(platformWallet).transfer(fee);
        }
        
        emit BookingCompleted(bookingId, booking.guide);
    }
    
    /**
     * @dev Cancel booking and refund to tourist
     */
    function cancelBooking(uint256 bookingId) external nonReentrant {
        Booking storage booking = bookings[bookingId];
        require(
            booking.tourist == msg.sender || booking.guide == msg.sender || msg.sender == owner(),
            "Unauthorized"
        );
        require(
            booking.status == BookingStatus.Pending || 
            booking.status == BookingStatus.Confirmed,
            "Cannot cancel"
        );
        require(!booking.released, "Already released");
        
        booking.status = BookingStatus.Cancelled;
        booking.cancelled = true;
        booking.released = true;
        
        // Full refund to tourist
        payable(booking.tourist).transfer(booking.amount);
        
        emit BookingCancelled(bookingId, booking.tourist);
    }
    
    /**
     * @dev Auto-release after timeout (anyone can call)
     */
    function releaseAfterTimeout(uint256 bookingId) external nonReentrant {
        Booking storage booking = bookings[bookingId];
        require(block.timestamp >= booking.releaseTime, "Release time not reached");
        require(booking.status == BookingStatus.Completed || booking.status == BookingStatus.InProgress, "Invalid status");
        require(!booking.released, "Already released");
        
        booking.released = true;
        
        uint256 fee = (booking.amount * platformFee) / 10000;
        uint256 guideAmount = booking.amount - fee;
        
        payable(booking.guide).transfer(guideAmount);
        if (fee > 0) {
            payable(platformWallet).transfer(fee);
        }
        
        emit BookingCompleted(bookingId, booking.guide);
    }
    
    /**
     * @dev Dispute booking (admin only)
     */
    function disputeBooking(uint256 bookingId) external onlyOwner {
        Booking storage booking = bookings[bookingId];
        require(
            booking.status == BookingStatus.Pending ||
            booking.status == BookingStatus.Confirmed ||
            booking.status == BookingStatus.InProgress,
            "Invalid status"
        );
        
        booking.status = BookingStatus.Disputed;
        emit BookingDisputed(bookingId);
    }
    
    /**
     * @dev Get booking details
     */
    function getBooking(uint256 bookingId) external view returns (Booking memory) {
        return bookings[bookingId];
    }
    
    /**
     * @dev Get booking by reference
     */
    function getBookingByRef(string memory bookingRef) external view returns (Booking memory) {
        uint256 bookingId = bookingRefToId[bookingRef];
        require(bookingId > 0, "Booking not found");
        return bookings[bookingId];
    }
    
    /**
     * @dev Get tourist's bookings
     */
    function getTouristBookings(address tourist) external view returns (uint256[] memory) {
        return touristBookings[tourist];
    }
    
    /**
     * @dev Get guide's bookings
     */
    function getGuideBookings(address guide) external view returns (uint256[] memory) {
        return guideBookings[guide];
    }
    
    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
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






