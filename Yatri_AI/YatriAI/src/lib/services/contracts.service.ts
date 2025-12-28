/**
 * Contracts Service - Web3 Contract Interactions
 * 
 * Provides typed interfaces for interacting with deployed smart contracts
 * Uses ethers.js v6 for all blockchain interactions
 */

import { ethers } from 'ethers';
import { ContractAddresses, ActiveNetwork, isMetaMaskAvailable } from './config';
import { blockchainService, type WalletState } from './blockchain.service';

// Contract ABIs (simplified - import from compiled contracts in production)
const HERITAGE_NFT_ABI = [
  "function mintHeritageNFT(address to, string memory locationId, string memory locationName, string memory category, string memory rarity, uint256 points, string memory tokenURI) external returns (uint256)",
  "function getLocationData(uint256 tokenId) external view returns (tuple(string locationId, string locationName, string category, string rarity, uint256 visitTimestamp, uint256 points))",
  "function hasMintedLocation(address user, string memory locationId) external view returns (bool)",
  "function totalSupply() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "event HeritageNFTMinted(uint256 indexed tokenId, address indexed to, string locationId, string locationName, string rarity)"
];

const MARKETPLACE_ESCROW_ABI = [
  "function createEscrow(address seller, string memory productId) external payable returns (uint256)",
  "function confirmDelivery(uint256 escrowId) external",
  "function releaseAfterTimeout(uint256 escrowId) external",
  "function refund(uint256 escrowId) external",
  "function getEscrow(uint256 escrowId) external view returns (tuple(uint256 escrowId, address buyer, address seller, uint256 amount, string productId, uint256 createdAt, uint256 releaseTime, bool released, bool disputed, uint8 status))",
  "function getBuyerEscrows(address buyer) external view returns (uint256[])",
  "event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount, string productId)",
  "event EscrowReleased(uint256 indexed escrowId, address indexed seller)"
];

const DONATION_CONTRACT_ABI = [
  "function donate(string memory pandalId, string memory message) external payable",
  "function getDonation(uint256 donationId) external view returns (tuple(uint256 donationId, address donor, address recipient, uint256 amount, string pandalId, string message, uint256 timestamp))",
  "function getPandal(string memory pandalId) external view returns (tuple(string pandalId, string name, address wallet, uint256 totalRaised, uint256 donorCount, bool active))",
  "function getDonorDonations(address donor) external view returns (uint256[])",
  "function getPandalDonations(string memory pandalId) external view returns (uint256[])",
  "event DonationMade(uint256 indexed donationId, address indexed donor, address indexed recipient, uint256 amount, string pandalId, string message)"
];

const GUIDE_CERTIFICATION_NFT_ABI = [
  "function mintCertification(address guide, string memory guideName, string memory guideId, string memory specialization, uint256 expiresAt, string[] memory verifiedSkills, string memory tokenURI) external returns (uint256)",
  "function isCertificationValid(address guide) external view returns (bool)",
  "function getCertificationData(uint256 tokenId) external view returns (tuple(address guideAddress, string guideName, string guideId, string specialization, uint256 issuedAt, uint256 expiresAt, bool isActive, string[] verifiedSkills))",
  "function getGuideTokenId(address guide) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "event CertificationMinted(uint256 indexed tokenId, address indexed guide, string guideName, uint256 expiresAt)"
];

const BOOKING_ESCROW_ABI = [
  "function createBookingEscrow(address guide, string memory bookingRef, uint256 startDate, uint256 endDate) external payable returns (uint256)",
  "function confirmBooking(uint256 bookingId) external",
  "function completeBooking(uint256 bookingId) external",
  "function cancelBooking(uint256 bookingId) external",
  "function releaseAfterTimeout(uint256 bookingId) external",
  "function getBooking(uint256 bookingId) external view returns (tuple(uint256 bookingId, address tourist, address guide, uint256 amount, string bookingRef, uint256 createdAt, uint256 startDate, uint256 endDate, uint256 releaseTime, bool released, bool cancelled, uint8 status))",
  "function getBookingByRef(string memory bookingRef) external view returns (tuple(uint256 bookingId, address tourist, address guide, uint256 amount, string bookingRef, uint256 createdAt, uint256 startDate, uint256 endDate, uint256 releaseTime, bool released, bool cancelled, uint8 status))",
  "event BookingCreated(uint256 indexed bookingId, address indexed tourist, address indexed guide, uint256 amount, string bookingRef)",
  "event BookingCompleted(uint256 indexed bookingId, address indexed guide)"
];

const PRODUCT_AUTHENTICITY_NFT_ABI = [
  "function mintProductNFT(string memory productId, string memory productName, string memory artisanName, string memory category, string memory materials, string memory origin, string memory certificationNumber, string memory tokenURI) external returns (uint256)",
  "function getProductData(uint256 tokenId) external view returns (tuple(string productId, string productName, address seller, string artisanName, string category, string materials, string origin, uint256 createdAt, bool isAuthentic, string certificationNumber))",
  "function getProductTokenId(string memory productId) external view returns (uint256)",
  "function hasAuthenticityNFT(string memory productId) external view returns (bool)",
  "function totalSupply() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "event ProductNFTMinted(uint256 indexed tokenId, address indexed seller, string productId, string productName)"
];

// Types
export interface MintNFTParams {
  locationId: string;
  locationName: string;
  category: string;
  rarity: string;
  points: number;
  tokenURI: string; // IPFS URI
}

export interface EscrowParams {
  sellerAddress: string;
  productId: string;
  amount: string; // in ETH
}

export interface DonationParams {
  pandalId: string;
  amount: string; // in ETH
  message?: string;
}

export interface BookingEscrowParams {
  guideAddress: string;
  bookingRef: string;
  startDate: number; // Unix timestamp
  endDate: number; // Unix timestamp
  amount: string; // in ETH
}

class ContractsService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  
  // Contract instances
  private heritageNFT: ethers.Contract | null = null;
  private marketplaceEscrow: ethers.Contract | null = null;
  private donationContract: ethers.Contract | null = null;
  private guideCertificationNFT: ethers.Contract | null = null;
  private bookingEscrow: ethers.Contract | null = null;
  private productAuthenticityNFT: ethers.Contract | null = null;

  /**
   * Initialize provider and signer from connected wallet
   */
  async initialize(): Promise<void> {
    if (!isMetaMaskAvailable()) {
      throw new Error('MetaMask is not installed');
    }

    const walletState = blockchainService.getWalletState();
    if (!walletState.isConnected || !walletState.address) {
      throw new Error('Wallet not connected');
    }

    // Get provider from MetaMask
    this.provider = new ethers.BrowserProvider((window as any).ethereum);
    this.signer = await this.provider.getSigner();

    // Initialize contracts if addresses are configured
    if (ContractAddresses.HERITAGE_NFT) {
      this.heritageNFT = new ethers.Contract(
        ContractAddresses.HERITAGE_NFT,
        HERITAGE_NFT_ABI,
        this.signer
      );
    }

    if (ContractAddresses.PAYMENT_ESCROW) {
      this.marketplaceEscrow = new ethers.Contract(
        ContractAddresses.PAYMENT_ESCROW,
        MARKETPLACE_ESCROW_ABI,
        this.signer
      );
    }

    if (ContractAddresses.DONATION) {
      this.donationContract = new ethers.Contract(
        ContractAddresses.DONATION,
        DONATION_CONTRACT_ABI,
        this.signer
      );
    }

    if (ContractAddresses.GUIDE_CERTIFICATE_NFT) {
      this.guideCertificationNFT = new ethers.Contract(
        ContractAddresses.GUIDE_CERTIFICATE_NFT,
        GUIDE_CERTIFICATION_NFT_ABI,
        this.signer
      );
    }

    // BookingEscrow uses BOOKING_VERIFICATION address (can be same contract or separate)
    const bookingEscrowAddress = import.meta.env.VITE_CONTRACT_BOOKING_ESCROW || ContractAddresses.BOOKING_VERIFICATION;
    if (bookingEscrowAddress) {
      this.bookingEscrow = new ethers.Contract(
        bookingEscrowAddress,
        BOOKING_ESCROW_ABI,
        this.signer
      );
    }

    if (ContractAddresses.PRODUCT_AUTHENTICITY) {
      this.productAuthenticityNFT = new ethers.Contract(
        ContractAddresses.PRODUCT_AUTHENTICITY,
        PRODUCT_AUTHENTICITY_NFT_ABI,
        this.signer
      );
    }
  }

  /**
   * Check if contracts are initialized
   */
  private ensureInitialized(): void {
    if (!this.provider || !this.signer) {
      throw new Error('Contracts service not initialized. Call initialize() first.');
    }
  }

  // ============================================
  // Heritage NFT Functions
  // ============================================

  /**
   * Mint a Heritage NFT
   */
  async mintHeritageNFT(params: MintNFTParams): Promise<{ tokenId: bigint; txHash: string }> {
    this.ensureInitialized();
    if (!this.heritageNFT) {
      throw new Error('Heritage NFT contract not configured');
    }

    const walletState = blockchainService.getWalletState();
    if (!walletState.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.heritageNFT.mintHeritageNFT(
        walletState.address,
        params.locationId,
        params.locationName,
        params.category,
        params.rarity,
        params.points,
        params.tokenURI
      );

      const receipt = await tx.wait();
      const tokenId = await this.heritageNFT.totalSupply();

      return {
        tokenId: tokenId,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Failed to mint NFT:', error);
      throw new Error(error.reason || error.message || 'Failed to mint NFT');
    }
  }

  /**
   * Check if user has minted NFT for a location
   */
  async hasMintedLocation(locationId: string): Promise<boolean> {
    this.ensureInitialized();
    if (!this.heritageNFT) {
      return false;
    }

    const walletState = blockchainService.getWalletState();
    if (!walletState.address) {
      return false;
    }

    try {
      return await this.heritageNFT.hasMintedLocation(walletState.address, locationId);
    } catch (error) {
      console.error('Failed to check mint status:', error);
      return false;
    }
  }

  /**
   * Get NFT location data
   */
  async getLocationData(tokenId: bigint): Promise<any> {
    this.ensureInitialized();
    if (!this.heritageNFT) {
      throw new Error('Heritage NFT contract not configured');
    }

    try {
      return await this.heritageNFT.getLocationData(tokenId);
    } catch (error: any) {
      throw new Error(error.reason || error.message || 'Failed to get location data');
    }
  }

  // ============================================
  // Marketplace Escrow Functions
  // ============================================

  /**
   * Create escrow for marketplace purchase
   */
  async createEscrow(params: EscrowParams): Promise<{ escrowId: bigint; txHash: string }> {
    this.ensureInitialized();
    if (!this.marketplaceEscrow) {
      throw new Error('Marketplace escrow contract not configured');
    }

    try {
      const amountWei = ethers.parseEther(params.amount);
      
      const tx = await this.marketplaceEscrow.createEscrow(
        params.sellerAddress,
        params.productId,
        { value: amountWei }
      );

      const receipt = await tx.wait();
      
      // Get escrow ID from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.marketplaceEscrow!.interface.parseLog(log);
          return parsed?.name === 'EscrowCreated';
        } catch {
          return false;
        }
      });

      let escrowId = BigInt(0);
      if (event) {
        const parsed = this.marketplaceEscrow!.interface.parseLog(event);
        escrowId = parsed?.args[0] || BigInt(0);
      }

      return {
        escrowId,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Failed to create escrow:', error);
      throw new Error(error.reason || error.message || 'Failed to create escrow');
    }
  }

  /**
   * Confirm delivery and release funds
   */
  async confirmDelivery(escrowId: bigint): Promise<string> {
    this.ensureInitialized();
    if (!this.marketplaceEscrow) {
      throw new Error('Marketplace escrow contract not configured');
    }

    try {
      const tx = await this.marketplaceEscrow.confirmDelivery(escrowId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      throw new Error(error.reason || error.message || 'Failed to confirm delivery');
    }
  }

  /**
   * Get escrow details
   */
  async getEscrow(escrowId: bigint): Promise<any> {
    this.ensureInitialized();
    if (!this.marketplaceEscrow) {
      throw new Error('Marketplace escrow contract not configured');
    }

    try {
      return await this.marketplaceEscrow.getEscrow(escrowId);
    } catch (error: any) {
      throw new Error(error.reason || error.message || 'Failed to get escrow');
    }
  }

  // ============================================
  // Donation Functions
  // ============================================

  /**
   * Make a donation to a Pandal
   */
  async donate(params: DonationParams): Promise<{ donationId: bigint; txHash: string }> {
    this.ensureInitialized();
    if (!this.donationContract) {
      throw new Error('Donation contract not configured');
    }

    try {
      const amountWei = ethers.parseEther(params.amount);
      
      const tx = await this.donationContract.donate(
        params.pandalId,
        params.message || '',
        { value: amountWei }
      );

      const receipt = await tx.wait();
      
      // Get donation ID from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.donationContract!.interface.parseLog(log);
          return parsed?.name === 'DonationMade';
        } catch {
          return false;
        }
      });

      let donationId = BigInt(0);
      if (event) {
        const parsed = this.donationContract!.interface.parseLog(event);
        donationId = parsed?.args[0] || BigInt(0);
      }

      return {
        donationId,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Failed to donate:', error);
      throw new Error(error.reason || error.message || 'Failed to make donation');
    }
  }

  /**
   * Get Pandal details
   */
  async getPandal(pandalId: string): Promise<any> {
    this.ensureInitialized();
    if (!this.donationContract) {
      throw new Error('Donation contract not configured');
    }

    try {
      return await this.donationContract.getPandal(pandalId);
    } catch (error: any) {
      throw new Error(error.reason || error.message || 'Failed to get pandal');
    }
  }

  /**
   * Get donor's donations
   */
  async getDonorDonations(): Promise<bigint[]> {
    this.ensureInitialized();
    if (!this.donationContract) {
      return [];
    }

    const walletState = blockchainService.getWalletState();
    if (!walletState.address) {
      return [];
    }

    try {
      return await this.donationContract.getDonorDonations(walletState.address);
    } catch (error) {
      console.error('Failed to get donations:', error);
      return [];
    }
  }

  // ============================================
  // Booking Escrow Functions
  // ============================================

  /**
   * Create escrow for a booking
   */
  async createBookingEscrow(params: BookingEscrowParams): Promise<{ bookingId: bigint; txHash: string }> {
    this.ensureInitialized();
    if (!this.bookingEscrow) {
      throw new Error('Booking escrow contract not configured');
    }

    try {
      const amountWei = ethers.parseEther(params.amount);
      
      const tx = await this.bookingEscrow.createBookingEscrow(
        params.guideAddress,
        params.bookingRef,
        params.startDate,
        params.endDate,
        { value: amountWei }
      );

      const receipt = await tx.wait();
      
      // Get booking ID from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.bookingEscrow!.interface.parseLog(log);
          return parsed?.name === 'BookingCreated';
        } catch {
          return false;
        }
      });

      let bookingId = BigInt(0);
      if (event) {
        const parsed = this.bookingEscrow!.interface.parseLog(event);
        bookingId = parsed?.args[0] || BigInt(0);
      }

      return {
        bookingId,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Failed to create booking escrow:', error);
      throw new Error(error.reason || error.message || 'Failed to create booking escrow');
    }
  }

  /**
   * Complete booking and release funds
   */
  async completeBooking(bookingId: bigint): Promise<string> {
    this.ensureInitialized();
    if (!this.bookingEscrow) {
      throw new Error('Booking escrow contract not configured');
    }

    try {
      const tx = await this.bookingEscrow.completeBooking(bookingId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      throw new Error(error.reason || error.message || 'Failed to complete booking');
    }
  }

  /**
   * Cancel booking and refund
   */
  async cancelBooking(bookingId: bigint): Promise<string> {
    this.ensureInitialized();
    if (!this.bookingEscrow) {
      throw new Error('Booking escrow contract not configured');
    }

    try {
      const tx = await this.bookingEscrow.cancelBooking(bookingId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      throw new Error(error.reason || error.message || 'Failed to cancel booking');
    }
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: bigint): Promise<any> {
    this.ensureInitialized();
    if (!this.bookingEscrow) {
      throw new Error('Booking escrow contract not configured');
    }

    try {
      return await this.bookingEscrow.getBooking(bookingId);
    } catch (error: any) {
      throw new Error(error.reason || error.message || 'Failed to get booking');
    }
  }

  // ============================================
  // Product Authenticity NFT Functions
  // ============================================

  /**
   * Mint product authenticity NFT
   */
  async mintProductNFT(params: {
    productId: string;
    productName: string;
    artisanName: string;
    category: string;
    materials: string;
    origin: string;
    certificationNumber: string;
    tokenURI: string;
  }): Promise<{ tokenId: bigint; txHash: string }> {
    this.ensureInitialized();
    if (!this.productAuthenticityNFT) {
      throw new Error('Product authenticity NFT contract not configured');
    }

    try {
      const tx = await this.productAuthenticityNFT.mintProductNFT(
        params.productId,
        params.productName,
        params.artisanName,
        params.category,
        params.materials,
        params.origin,
        params.certificationNumber,
        params.tokenURI
      );

      const receipt = await tx.wait();
      const tokenId = await this.productAuthenticityNFT.totalSupply();

      return {
        tokenId: tokenId,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Failed to mint product NFT:', error);
      throw new Error(error.reason || error.message || 'Failed to mint product NFT');
    }
  }

  /**
   * Check if product has authenticity NFT
   */
  async hasProductAuthenticityNFT(productId: string): Promise<boolean> {
    this.ensureInitialized();
    if (!this.productAuthenticityNFT) {
      return false;
    }

    try {
      return await this.productAuthenticityNFT.hasAuthenticityNFT(productId);
    } catch (error) {
      console.error('Failed to check authenticity:', error);
      return false;
    }
  }

  // ============================================
  // Utility Functions
  // ============================================

  /**
   * Convert ETH to Wei
   */
  parseEther(amount: string): bigint {
    return ethers.parseEther(amount);
  }

  /**
   * Convert Wei to ETH
   */
  formatEther(amount: bigint): string {
    return ethers.formatEther(amount);
  }

  /**
   * Get contract instance (for advanced usage)
   */
  getHeritageNFT(): ethers.Contract | null {
    return this.heritageNFT;
  }

  getMarketplaceEscrow(): ethers.Contract | null {
    return this.marketplaceEscrow;
  }

  getDonationContract(): ethers.Contract | null {
    return this.donationContract;
  }

  getBookingEscrow(): ethers.Contract | null {
    return this.bookingEscrow;
  }

  getProductAuthenticityNFT(): ethers.Contract | null {
    return this.productAuthenticityNFT;
  }
}

export const contractsService = new ContractsService();
export default contractsService;

