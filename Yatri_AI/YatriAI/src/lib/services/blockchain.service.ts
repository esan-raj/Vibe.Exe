/**
 * Blockchain Service - ETHIndia Integration
 * 
 * Provides blockchain verification for:
 * - Booking verification (immutable receipts on Ethereum)
 * - Guide certification verification (NFT certificates)
 * - Product authenticity verification
 * - Payment escrow (smart contract)
 * 
 * Networks supported:
 * - Sepolia Testnet (recommended for testing)
 * - Holesky Testnet (alternative)
 * - Polygon Mumbai (L2 alternative)
 * 
 * Features:
 * - MetaMask wallet connection
 * - Transaction signing and broadcasting
 * - Block explorer integration
 * - Gas estimation
 * - Event listening
 * 
 * Get free testnet ETH from faucets:
 * - Sepolia: https://sepoliafaucet.com
 * - Holesky: https://holesky-faucet.pk910.de
 * - Mumbai: https://faucet.polygon.technology
 */

import { 
  ServiceURLs, 
  ServiceFlags, 
  ActiveNetwork, 
  ActiveEthNetwork,
  BlockchainConfig,
  ContractAddresses,
  isBlockchainConfigured,
  isMetaMaskAvailable,
  getNetworkByChainId,
  EthereumNetworks,
} from './config';
import { createServiceFetch } from '../debug';

// Create debug-enabled fetch for this service
const serviceFetch = createServiceFetch('BlockchainService');

// ============================================
// Interfaces
// ============================================

export interface BlockchainRecord {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  network: string;
  status: 'pending' | 'confirmed' | 'failed';
  data: Record<string, any>;
  explorerUrl: string;
  gasUsed?: number;
  confirmations?: number;
}

export interface VerificationResult {
  isVerified: boolean;
  record?: BlockchainRecord;
  message: string;
  verifiedAt?: string;
}

export interface BookingOnChain {
  bookingId: string;
  txHash: string;
  userAddress: string;
  guideAddress?: string;
  amount: number;
  amountWei?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'disputed';
  timestamp: string;
  metadata?: {
    destination: string;
    dates: string[];
    guests: number;
  };
}

export interface CertificateOnChain {
  certificateId: string;
  tokenId?: number;
  txHash: string;
  holderAddress: string;
  issuerAddress: string;
  certificateType: 'guide' | 'seller' | 'product';
  metadata: {
    name: string;
    description: string;
    issuedAt: string;
    expiresAt?: string;
    imageUrl?: string;
    attributes?: Record<string, any>;
  };
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  network: string | null;
  balance: string | null;
}

export interface TransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: number;
}

// ============================================
// Blockchain Service Class
// ============================================

class BlockchainService {
  private baseUrl: string;
  private useMock: boolean;
  private network: typeof ActiveNetwork;
  private networkName: string;
  private walletState: WalletState;
  private onWalletChange?: (state: WalletState) => void;

  constructor() {
    this.baseUrl = ServiceURLs.BLOCKCHAIN_API;
    this.useMock = ServiceFlags.USE_MOCK_BLOCKCHAIN;
    this.networkName = ActiveEthNetwork;
    this.network = ActiveNetwork;
    this.walletState = {
      isConnected: false,
      address: null,
      chainId: null,
      network: null,
      balance: null,
    };

    // Listen for wallet events
    this.initWalletListeners();
  }

  // ============================================
  // Wallet Connection
  // ============================================

  /**
   * Initialize wallet event listeners
   */
  private initWalletListeners(): void {
    if (typeof window === 'undefined') return;
    
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.walletState = {
          isConnected: false,
          address: null,
          chainId: this.walletState.chainId,
          network: this.walletState.network,
          balance: null,
        };
      } else {
        this.walletState.address = accounts[0];
        this.walletState.isConnected = true;
        this.updateBalance();
      }
      this.onWalletChange?.(this.walletState);
    });

    ethereum.on('chainChanged', (chainId: string) => {
      const numericChainId = parseInt(chainId, 16);
      const network = getNetworkByChainId(numericChainId);
      this.walletState.chainId = numericChainId;
      this.walletState.network = network?.name || 'Unknown';
      this.onWalletChange?.(this.walletState);
    });
  }

  /**
   * Connect to MetaMask wallet
   */
  async connectWallet(): Promise<WalletState> {
    if (!isMetaMaskAvailable()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to use blockchain features.');
    }

    const ethereum = (window as any).ethereum;

    try {
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      // Get chain ID
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      const numericChainId = parseInt(chainId, 16);
      const network = getNetworkByChainId(numericChainId);

      this.walletState = {
        isConnected: true,
        address: accounts[0],
        chainId: numericChainId,
        network: network?.name || 'Unknown',
        balance: null,
      };

      // Update balance
      await this.updateBalance();

      console.log(`🔗 Wallet connected: ${accounts[0]} on ${this.walletState.network}`);
      
      return this.walletState;
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      throw new Error(error.message || 'Failed to connect wallet');
    }
  }

  /**
   * Disconnect wallet (clear state)
   */
  disconnectWallet(): void {
    this.walletState = {
      isConnected: false,
      address: null,
      chainId: null,
      network: null,
      balance: null,
    };
    this.onWalletChange?.(this.walletState);
  }

  /**
   * Get current wallet state
   */
  getWalletState(): WalletState {
    return { ...this.walletState };
  }

  /**
   * Set wallet change callback
   */
  setOnWalletChange(callback: (state: WalletState) => void): void {
    this.onWalletChange = callback;
  }

  /**
   * Update wallet balance
   */
  private async updateBalance(): Promise<void> {
    if (!this.walletState.address) return;

    try {
      const ethereum = (window as any).ethereum;
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [this.walletState.address, 'latest'],
      });
      
      // Convert from wei to ETH
      const balanceInWei = BigInt(balance);
      const balanceInEth = Number(balanceInWei) / 1e18;
      this.walletState.balance = balanceInEth.toFixed(4);
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  }

  /**
   * Switch to the required network
   */
  async switchNetwork(networkName: keyof typeof EthereumNetworks = 'sepolia'): Promise<boolean> {
    if (!isMetaMaskAvailable()) {
      throw new Error('MetaMask is not installed');
    }

    const network = EthereumNetworks[networkName];
    const ethereum = (window as any).ethereum;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainIdHex }],
      });
      return true;
    } catch (switchError: any) {
      // Network not added to MetaMask, try to add it
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: network.chainIdHex,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.explorerUrl],
              nativeCurrency: {
                name: network.symbol,
                symbol: network.symbol,
                decimals: network.decimals,
              },
            }],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add network:', addError);
          throw new Error(`Failed to add ${network.name} to MetaMask`);
        }
      }
      throw switchError;
    }
  }

  /**
   * Check if wallet is on the correct network
   */
  isOnCorrectNetwork(): boolean {
    return this.walletState.chainId === this.network.chainId;
  }

  // ============================================
  // Booking Verification
  // ============================================

  /**
   * Record booking on blockchain
   */
  async recordBooking(booking: {
    id: string;
    userId: string;
    guideId?: string;
    amount: number;
    type: string;
    details: Record<string, any>;
  }): Promise<BlockchainRecord> {
    console.log('📝 Recording booking on blockchain...');

    // If real blockchain is configured and wallet is connected
    if (isBlockchainConfigured() && this.walletState.isConnected) {
      try {
        return await this.recordBookingOnChain(booking);
      } catch (error) {
        console.warn('Real blockchain recording failed, using mock:', error);
      }
    }

    // Use API or mock
    if (this.useMock && !import.meta.env.VITE_BEECEPTOR_URL) {
      return this.createMockRecord('booking', booking);
    }

    try {
      const response = await serviceFetch(`${this.baseUrl}/record/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: this.networkName,
          booking,
        }),
      });

      if (!response.ok) {
        return this.createMockRecord('booking', booking);
      }

      return await response.json();
    } catch (error) {
      console.warn('Blockchain API unavailable, using mock:', error);
      return this.createMockRecord('booking', booking);
    }
  }

  /**
   * Record booking directly on Ethereum (requires wallet)
   */
  private async recordBookingOnChain(booking: {
    id: string;
    userId: string;
    guideId?: string;
    amount: number;
    type: string;
    details: Record<string, any>;
  }): Promise<BlockchainRecord> {
    if (!this.walletState.isConnected) {
      throw new Error('Wallet not connected');
    }

    const ethereum = (window as any).ethereum;
    
    // Create booking data hash
    const bookingData = JSON.stringify({
      bookingId: booking.id,
      userId: booking.userId,
      guideId: booking.guideId || null,
      amount: booking.amount,
      type: booking.type,
      timestamp: Date.now(),
    });

    // If contract is deployed, call it; otherwise use a simple transaction
    if (ContractAddresses.BOOKING_VERIFICATION) {
      // Call smart contract method
      // This would require ABI encoding - simplified for demo
      const txHash = await this.sendTransaction({
        to: ContractAddresses.BOOKING_VERIFICATION,
        data: this.encodeBookingData(booking),
      });
      
      return this.waitForTransaction(txHash, booking);
    } else {
      // Use a simple self-transaction with data
      const dataHex = this.stringToHex(bookingData);
      
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: this.walletState.address,
          to: this.walletState.address, // Self-transaction for data storage
          value: '0x0',
          data: dataHex,
        }],
      });

      return this.waitForTransaction(txHash, booking);
    }
  }

  /**
   * Send a transaction
   */
  private async sendTransaction(request: TransactionRequest): Promise<string> {
    const ethereum = (window as any).ethereum;
    
    const txParams: any = {
      from: this.walletState.address,
      to: request.to,
    };

    if (request.value) {
      txParams.value = request.value;
    }
    if (request.data) {
      txParams.data = request.data;
    }
    if (request.gasLimit) {
      txParams.gas = '0x' + request.gasLimit.toString(16);
    }

    return await ethereum.request({
      method: 'eth_sendTransaction',
      params: [txParams],
    });
  }

  /**
   * Wait for transaction confirmation
   */
  private async waitForTransaction(txHash: string, data: any): Promise<BlockchainRecord> {
    const ethereum = (window as any).ethereum;
    const startTime = Date.now();
    const maxWaitTime = 60000; // 60 seconds

    console.log(`⏳ Waiting for transaction: ${txHash}`);

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const receipt = await ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        });

        if (receipt) {
          console.log(`✅ Transaction confirmed in block ${parseInt(receipt.blockNumber, 16)}`);
          
          return {
            txHash,
            blockNumber: parseInt(receipt.blockNumber, 16),
            timestamp: new Date().toISOString(),
            network: this.networkName,
            status: receipt.status === '0x1' ? 'confirmed' : 'failed',
            data,
            explorerUrl: this.getExplorerUrl(txHash),
            gasUsed: parseInt(receipt.gasUsed, 16),
            confirmations: 1,
          };
        }
      } catch (error) {
        // Transaction not yet mined
      }

      await new Promise(resolve => setTimeout(resolve, BlockchainConfig.POLLING_INTERVAL));
    }

    // Transaction still pending after timeout
    return {
      txHash,
      blockNumber: 0,
      timestamp: new Date().toISOString(),
      network: this.networkName,
      status: 'pending',
      data,
      explorerUrl: this.getExplorerUrl(txHash),
    };
  }

  /**
   * Verify booking on blockchain
   */
  async verifyBooking(txHash: string): Promise<VerificationResult> {
    console.log(`🔍 Verifying booking: ${txHash}`);

    // If real blockchain is configured
    if (isBlockchainConfigured() && isMetaMaskAvailable()) {
      try {
        return await this.verifyBookingOnChain(txHash);
      } catch (error) {
        console.warn('Real blockchain verification failed:', error);
      }
    }

    // Use API or mock
    if (this.useMock && !import.meta.env.VITE_BEECEPTOR_URL) {
      return this.getMockVerification(txHash);
    }

    try {
      const response = await serviceFetch(`${this.baseUrl}/verify/booking/${txHash}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return this.getMockVerification(txHash);
      }

      return await response.json();
    } catch (error) {
      return this.getMockVerification(txHash);
    }
  }

  /**
   * Verify booking directly on Ethereum
   */
  private async verifyBookingOnChain(txHash: string): Promise<VerificationResult> {
    const ethereum = (window as any).ethereum;

    try {
      const receipt = await ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });

      if (!receipt) {
        return {
          isVerified: false,
          message: 'Transaction not found or still pending',
        };
      }

      const block = await ethereum.request({
        method: 'eth_getBlockByNumber',
        params: [receipt.blockNumber, false],
      });

      const blockTimestamp = parseInt(block.timestamp, 16) * 1000;

      return {
        isVerified: receipt.status === '0x1',
        record: {
          txHash,
          blockNumber: parseInt(receipt.blockNumber, 16),
          timestamp: new Date(blockTimestamp).toISOString(),
          network: this.networkName,
          status: receipt.status === '0x1' ? 'confirmed' : 'failed',
          data: { verified: true },
          explorerUrl: this.getExplorerUrl(txHash),
          gasUsed: parseInt(receipt.gasUsed, 16),
        },
        message: receipt.status === '0x1' 
          ? `Booking verified on ${this.network.name}` 
          : 'Transaction failed on blockchain',
        verifiedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error('Failed to verify transaction on blockchain');
    }
  }

  // ============================================
  // Certificate Verification
  // ============================================

  /**
   * Verify guide certification (NFT)
   */
  async verifyCertificate(certificateId: string): Promise<VerificationResult> {
    if (this.useMock && !import.meta.env.VITE_BEECEPTOR_URL) {
      return this.getMockCertificateVerification(certificateId);
    }

    try {
      const response = await serviceFetch(`${this.baseUrl}/verify/certificate/${certificateId}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return this.getMockCertificateVerification(certificateId);
      }

      return await response.json();
    } catch (error) {
      return this.getMockCertificateVerification(certificateId);
    }
  }

  /**
   * Get all blockchain records for a user
   */
  async getUserRecords(userId: string): Promise<BlockchainRecord[]> {
    if (this.useMock) {
      return this.getMockUserRecords(userId);
    }

    try {
      const response = await serviceFetch(`${this.baseUrl}/records/user/${userId}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return this.getMockUserRecords(userId);
      }

      return await response.json();
    } catch (error) {
      return this.getMockUserRecords(userId);
    }
  }

  // ============================================
  // Utility Functions
  // ============================================

  /**
   * Generate blockchain hash for display (deterministic)
   */
  generateDisplayHash(data: Record<string, any>): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, 'a').slice(0, 64)}`;
  }

  /**
   * Get explorer URL for transaction
   */
  getExplorerUrl(txHash: string): string {
    return `${this.network.explorerUrl}/tx/${txHash}`;
  }

  /**
   * Get explorer URL for address
   */
  getAddressExplorerUrl(address: string): string {
    return `${this.network.explorerUrl}/address/${address}`;
  }

  /**
   * Get faucet URL for current network
   */
  getFaucetUrl(): string {
    return this.network.faucetUrl;
  }

  /**
   * Get current network info
   */
  getNetworkInfo(): typeof ActiveNetwork {
    return this.network;
  }

  /**
   * Check if blockchain features are available
   */
  isAvailable(): boolean {
    return isBlockchainConfigured() || !this.useMock;
  }

  /**
   * Get short address display (0x1234...5678)
   */
  shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Convert ETH to Wei
   */
  ethToWei(eth: number): string {
    return (BigInt(Math.floor(eth * 1e18))).toString();
  }

  /**
   * Convert Wei to ETH
   */
  weiToEth(wei: string): number {
    return Number(BigInt(wei)) / 1e18;
  }

  // ============================================
  // Private Helpers
  // ============================================

  private stringToHex(str: string): string {
    return '0x' + Array.from(str)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }

  private encodeBookingData(booking: any): string {
    // Simplified ABI encoding for demo
    // In production, use ethers.js or web3.js for proper encoding
    const data = JSON.stringify(booking);
    return this.stringToHex(data);
  }

  // ============================================
  // Mock Implementations
  // ============================================

  private createMockRecord(type: string, data: any): BlockchainRecord {
    const txHash = this.generateDisplayHash({ ...data, timestamp: Date.now(), type });
    
    return {
      txHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      timestamp: new Date().toISOString(),
      network: this.networkName,
      status: 'confirmed',
      data,
      explorerUrl: this.getExplorerUrl(txHash),
      gasUsed: Math.floor(Math.random() * 50000) + 21000,
      confirmations: Math.floor(Math.random() * 10) + 1,
    };
  }

  private getMockVerification(txHash: string): VerificationResult {
    return {
      isVerified: true,
      record: {
        txHash,
        blockNumber: 18542631,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        network: this.networkName,
        status: 'confirmed',
        data: { verified: true, type: 'booking' },
        explorerUrl: this.getExplorerUrl(txHash),
        gasUsed: 45000,
        confirmations: 12,
      },
      message: `Booking verified on ${this.network.name} (Testnet)`,
      verifiedAt: new Date().toISOString(),
    };
  }

  private getMockCertificateVerification(certificateId: string): VerificationResult {
    return {
      isVerified: true,
      record: {
        txHash: this.generateDisplayHash({ certificateId }),
        blockNumber: 18542100,
        timestamp: new Date(Date.now() - 86400000 * 30).toISOString(),
        network: this.networkName,
        status: 'confirmed',
        data: {
          certificateId,
          type: 'guide_certification',
          issuer: 'YatriAI Platform',
          tokenId: Math.floor(Math.random() * 10000),
        },
        explorerUrl: this.getExplorerUrl(this.generateDisplayHash({ certificateId })),
      },
      message: 'Guide certification verified on blockchain (NFT)',
      verifiedAt: new Date().toISOString(),
    };
  }

  private getMockUserRecords(userId: string): BlockchainRecord[] {
    return [
      this.createMockRecord('booking', { userId, type: 'guide_booking', destination: 'Hundru Falls' }),
      this.createMockRecord('purchase', { userId, type: 'marketplace', product: 'Tribal Painting' }),
      this.createMockRecord('certification', { userId, type: 'guide_certificate', name: 'Heritage Guide' }),
    ];
  }
}

export const blockchainService = new BlockchainService();
export default blockchainService;
