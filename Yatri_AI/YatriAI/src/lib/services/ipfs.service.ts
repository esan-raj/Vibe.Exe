/**
 * IPFS Service - NFT Metadata Storage
 * 
 * Handles uploading NFT metadata to IPFS
 * Uses Pinata API for pinning (free tier available)
 * Fallback to mock IPFS for development
 */

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: Record<string, any>;
}

class IPFSService {
  private pinataApiKey: string | null = null;
  private pinataSecretKey: string | null = null;
  private useMock: boolean = true;

  constructor() {
    this.pinataApiKey = import.meta.env.VITE_PINATA_API_KEY || null;
    this.pinataSecretKey = import.meta.env.VITE_PINATA_SECRET_KEY || null;
    this.useMock = !this.pinataApiKey || !this.pinataSecretKey;
  }

  /**
   * Upload metadata to IPFS
   */
  async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    if (this.useMock) {
      return this.generateMockIPFSUri(metadata);
    }

    try {
      return await this.uploadToPinata(metadata);
    } catch (error) {
      console.warn('Pinata upload failed, using mock:', error);
      return this.generateMockIPFSUri(metadata);
    }
  }

  /**
   * Upload to Pinata
   */
  private async uploadToPinata(metadata: NFTMetadata): Promise<string> {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      throw new Error('Pinata credentials not configured');
    }

    // Pin JSON metadata
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': this.pinataApiKey,
        'pinata_secret_api_key': this.pinataSecretKey,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: metadata.name,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload to Pinata');
    }

    const result = await response.json();
    return `ipfs://${result.IpfsHash}`;
  }

  /**
   * Generate mock IPFS URI for development
   */
  private generateMockIPFSUri(metadata: NFTMetadata): string {
    // Create a deterministic hash from metadata
    const data = JSON.stringify(metadata);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Generate mock IPFS hash (Qm... format)
    const mockHash = Math.abs(hash).toString(16).padStart(44, '0').slice(0, 44);
    return `ipfs://Qm${mockHash}`;
  }

  /**
   * Upload image to IPFS (if needed)
   */
  async uploadImage(imageFile: File): Promise<string> {
    if (this.useMock) {
      // Return mock IPFS URI
      return `ipfs://QmMockImage${Date.now()}`;
    }

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': this.pinataApiKey!,
          'pinata_secret_api_key': this.pinataSecretKey!,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return `ipfs://${result.IpfsHash}`;
    } catch (error) {
      console.warn('Image upload failed:', error);
      // Fallback to using image URL directly if IPFS fails
      return imageFile.name; // Or return original URL
    }
  }

  /**
   * Get IPFS gateway URL
   */
  getGatewayUrl(ipfsUri: string): string {
    if (!ipfsUri.startsWith('ipfs://')) {
      return ipfsUri; // Already a regular URL
    }

    const hash = ipfsUri.replace('ipfs://', '');
    // Use public IPFS gateway
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }

  /**
   * Check if IPFS is configured
   */
  isConfigured(): boolean {
    return !this.useMock;
  }
}

export const ipfsService = new IPFSService();
export default ipfsService;






