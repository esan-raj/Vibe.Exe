import React, { useState, useEffect } from 'react';
import { 
  Award, MapPin, Clock, CheckCircle, Share2, Download,
  Wallet, ExternalLink, Sparkles, Star, Camera, Lock,
  Loader2, QrCode, Globe, Shield, Trophy, Gift, X, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '../../magicui/MagicCard';
import { BorderBeam } from '../../magicui/BorderBeam';
import { ShimmerButton } from '../../magicui/ShimmerButton';
import { AnimatedGradientText } from '../../magicui/AnimatedGradientText';
import { BlurFade } from '../../magicui/BlurFade';
import { VictoriaMemorialIcon, HowrahBridgeIcon, TerracottaIcon, DurgaIcon } from '../../kolkata/KolkataIcons';
import { blockchainService } from '../../../lib/services/blockchain.service';
import { contractsService } from '../../../lib/services/contracts.service';
import { ipfsService } from '../../../lib/services/ipfs.service';
import { ActiveNetwork } from '../../../lib/services/config';

// Heritage locations that can mint NFT badges
const heritageLocations = [
  {
    id: 'loc-001',
    name: 'Victoria Memorial',
    icon: VictoriaMemorialIcon,
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&h=400&q=80',
    nftImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Monument',
    rarity: 'Legendary',
    rarityColor: 'from-kolkata-yellow to-kolkata-gold',
    points: 100,
    visitors: 2847,
    description: 'The crown jewel of Kolkata, built in memory of Queen Victoria.',
    coordinates: { lat: 22.5448, lng: 88.3426 },
    unlocked: true,
    minted: false,
    mintDate: null,
    tokenId: null
  },
  {
    id: 'loc-002',
    name: 'Howrah Bridge',
    icon: HowrahBridgeIcon,
    image: 'https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?auto=format&fit=crop&w=600&h=400&q=80',
    nftImage: 'https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Landmark',
    rarity: 'Epic',
    rarityColor: 'from-purple-500 to-indigo-500',
    points: 80,
    visitors: 3421,
    description: 'The iconic cantilever bridge connecting Kolkata and Howrah.',
    coordinates: { lat: 22.5851, lng: 88.3468 },
    unlocked: true,
    minted: true,
    mintDate: '2024-01-15',
    tokenId: '0x001234'
  },
  {
    id: 'loc-003',
    name: 'Kumartuli',
    icon: TerracottaIcon,
    image: 'https://images.unsplash.com/photo-1599030641314-e7f9e2f5e8e1?auto=format&fit=crop&w=600&h=400&q=80',
    nftImage: 'https://images.unsplash.com/photo-1599030641314-e7f9e2f5e8e1?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Heritage Zone',
    rarity: 'Rare',
    rarityColor: 'from-kolkata-terracotta to-heritage-500',
    points: 60,
    visitors: 1892,
    description: 'The legendary potter\'s quarter where gods are crafted.',
    coordinates: { lat: 22.6000, lng: 88.3667 },
    unlocked: false,
    minted: false,
    mintDate: null,
    tokenId: null
  },
  {
    id: 'loc-004',
    name: 'Dakshineswar Temple',
    icon: DurgaIcon,
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&h=400&q=80',
    nftImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&h=400&q=80',
    category: 'Temple',
    rarity: 'Epic',
    rarityColor: 'from-durga-500 to-kolkata-sindoor',
    points: 90,
    visitors: 4567,
    description: 'The sacred temple associated with Ramakrishna Paramahansa.',
    coordinates: { lat: 22.6548, lng: 88.3577 },
    unlocked: false,
    minted: false,
    mintDate: null,
    tokenId: null
  }
];

// User's NFT collection stats
const userStats = {
  totalMinted: 1,
  totalPoints: 80,
  rank: 'Explorer',
  nextRank: 'Heritage Guardian',
  pointsToNext: 120,
  walletConnected: false,
  walletAddress: null
};

const HeritageNFT: React.FC = () => {
  const [locations, setLocations] = useState(heritageLocations);
  const [selectedLocation, setSelectedLocation] = useState(heritageLocations[0]);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showMintModal, setShowMintModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const totalMinted = locations.filter(l => l.minted).length;
  const totalPoints = locations.filter(l => l.minted).reduce((sum, l) => sum + l.points, 0);

  // Check wallet connection on mount
  useEffect(() => {
    const checkWallet = async () => {
      const walletState = blockchainService.getWalletState();
      if (walletState.isConnected && walletState.address) {
        setWalletConnected(true);
        setWalletAddress(walletState.address);
      }
    };
    checkWallet();
  }, []);

  const connectWallet = async () => {
    try {
      setIsMinting(true);
      const walletState = await blockchainService.connectWallet();
      setWalletConnected(true);
      setWalletAddress(walletState.address || null);
      
      // Initialize contracts service
      await contractsService.initialize();
    } catch (error: any) {
      alert('Failed to connect wallet: ' + (error.message || error));
    } finally {
      setIsMinting(false);
    }
  };

  const mintNFT = async (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    if (!location) return;

    // Ensure wallet is connected
    if (!walletConnected) {
      await connectWallet();
      if (!walletConnected) {
        alert('Please connect your wallet to mint NFT');
        return;
      }
    }

    setIsMinting(true);
    setShowMintModal(true);

    try {
      // Initialize contracts if not already done
      await contractsService.initialize();

      // Check if already minted
      const alreadyMinted = await contractsService.hasMintedLocation(locationId);
      if (alreadyMinted) {
        alert('You have already minted an NFT for this location!');
        setIsMinting(false);
        return;
      }

      // Prepare NFT metadata
      const metadata = {
        name: `${location.name} Heritage Badge`,
        description: `Commemorative NFT badge for visiting ${location.name}. ${location.description}`,
        image: location.nftImage,
        external_url: `https://yatriai.com/heritage/${locationId}`,
        attributes: [
          { trait_type: 'Location', value: location.name },
          { trait_type: 'Category', value: location.category },
          { trait_type: 'Rarity', value: location.rarity },
          { trait_type: 'Points', value: location.points },
          { trait_type: 'Visit Date', value: new Date().toISOString() }
        ]
      };

      // Upload metadata to IPFS
      const tokenURI = await ipfsService.uploadMetadata(metadata);

      // Mint NFT on blockchain
      const result = await contractsService.mintHeritageNFT({
        locationId: location.id,
        locationName: location.name,
        category: location.category,
        rarity: location.rarity,
        points: location.points,
        tokenURI: tokenURI
      });

      // Update UI with real token ID and transaction hash
      setLocations(prev => prev.map(loc => 
        loc.id === locationId 
          ? { 
              ...loc, 
              minted: true, 
              mintDate: new Date().toISOString(), 
              tokenId: result.tokenId.toString() 
            }
          : loc
      ));

      setMintSuccess(true);
      
      // Show success message with transaction link
      console.log('NFT Minted!', {
        tokenId: result.tokenId.toString(),
        txHash: result.txHash,
        explorerUrl: `${ActiveNetwork.explorerUrl}/tx/${result.txHash}`
      });
    } catch (error: any) {
      console.error('Failed to mint NFT:', error);
      alert('Failed to mint NFT: ' + (error.message || error));
      setShowMintModal(false);
    } finally {
      setIsMinting(false);
    }
  };

  const getRarityBadge = (rarity: string) => {
    const colors: Record<string, string> = {
      'Legendary': 'bg-gradient-to-r from-kolkata-yellow to-kolkata-gold text-gray-900',
      'Epic': 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
      'Rare': 'bg-gradient-to-r from-kolkata-terracotta to-heritage-500 text-white',
      'Common': 'bg-gray-500 text-white'
    };
    return colors[rarity] || colors['Common'];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BlurFade delay={0.1} inView>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-kolkata-yellow to-heritage-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heritage">
                Heritage{' '}
                <AnimatedGradientText className="text-3xl">NFT Badges</AnimatedGradientText>
                {' '}🏆
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Collect digital badges for visiting heritage sites
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Network Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl border border-purple-200 dark:border-purple-800">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Sepolia Testnet</span>
            </div>

            {/* Wallet Button */}
            {walletConnected ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800">
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium font-mono">
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </span>
              </div>
            ) : (
              <ShimmerButton
                className="px-4 py-2"
                background="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                onClick={connectWallet}
                disabled={isMinting}
              >
                {isMinting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                <span>Connect Wallet</span>
              </ShimmerButton>
            )}
          </div>
        </div>
      </BlurFade>

      {/* Stats Cards */}
      <BlurFade delay={0.15} inView>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MagicCard gradientColor="#FFB800" gradientOpacity={0.1}>
            <div className="p-4 text-center">
              <Trophy className="w-8 h-8 text-kolkata-yellow mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMinted}/{locations.length}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">NFTs Collected</p>
            </div>
          </MagicCard>
          <MagicCard gradientColor="#22c55e" gradientOpacity={0.1}>
            <div className="p-4 text-center">
              <Sparkles className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPoints}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Heritage Points</p>
            </div>
          </MagicCard>
          <MagicCard gradientColor="#8b5cf6" gradientOpacity={0.1}>
            <div className="p-4 text-center">
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Explorer</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Current Rank</p>
            </div>
          </MagicCard>
          <MagicCard gradientColor="#C45C26" gradientOpacity={0.1}>
            <div className="p-4 text-center">
              <Gift className="w-8 h-8 text-kolkata-terracotta mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Rewards Available</p>
            </div>
          </MagicCard>
        </div>
      </BlurFade>

      {/* Location Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locations.map((location, index) => {
              const IconComponent = location.icon;
              const isSelected = selectedLocation.id === location.id;

              return (
                <BlurFade key={location.id} delay={0.1 * index} inView>
                  <MagicCard 
                    gradientColor={location.minted ? '#22c55e' : '#D4A015'} 
                    gradientOpacity={0.1}
                    className="cursor-pointer"
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className={`relative ${isSelected ? 'ring-2 ring-kolkata-yellow' : ''}`}>
                      {location.minted && <BorderBeam size={200} duration={15} colorFrom="#22c55e" colorTo="#16a34a" />}
                      
                      {/* Image */}
                      <div className="relative h-40 rounded-t-xl overflow-hidden">
                        <img
                          src={location.image}
                          alt={location.name}
                          className={`w-full h-full object-cover ${!location.unlocked ? 'grayscale' : ''}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {location.minted ? (
                            <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Minted
                            </span>
                          ) : location.unlocked ? (
                            <span className="px-2 py-1 bg-kolkata-yellow text-gray-900 rounded-full text-xs font-bold">
                              Ready to Mint
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Locked
                            </span>
                          )}
                        </div>

                        {/* Rarity */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRarityBadge(location.rarity)}`}>
                            {location.rarity}
                          </span>
                        </div>

                        {/* Points */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 rounded-full">
                          <Star className="w-3 h-3 fill-kolkata-yellow text-kolkata-yellow" />
                          <span className="text-white text-xs font-bold">{location.points} pts</span>
                        </div>

                        {/* Info */}
                        <div className="absolute bottom-3 left-3">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-5 h-5 text-white" />
                            <h3 className="text-white font-semibold">{location.name}</h3>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {location.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{location.category}</span>
                          </div>

                          {location.unlocked && !location.minted ? (
                            <ShimmerButton
                              className="py-2 px-4 text-sm"
                              background={`linear-gradient(135deg, ${location.rarityColor.includes('kolkata-yellow') ? '#FFB800' : '#8b5cf6'} 0%, ${location.rarityColor.includes('heritage') ? '#D4A015' : '#6366f1'} 100%)`}
                              onClick={(e) => {
                                e.stopPropagation();
                                mintNFT(location.id);
                              }}
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Mint NFT</span>
                            </ShimmerButton>
                          ) : location.minted ? (
                            <button className="flex items-center gap-1 text-green-600 text-sm font-medium">
                              <CheckCircle className="w-4 h-4" />
                              Owned
                            </button>
                          ) : (
                            <button className="flex items-center gap-1 text-gray-400 text-sm">
                              <Lock className="w-4 h-4" />
                              Visit to Unlock
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </MagicCard>
                </BlurFade>
              );
            })}
          </div>
        </div>

        {/* NFT Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* NFT Preview */}
            <MagicCard gradientColor={selectedLocation.minted ? '#22c55e' : '#D4A015'} gradientOpacity={0.15}>
              <div className="p-6">
                <BorderBeam size={200} duration={20} />

                <div className="relative mb-4">
                  <div className={`aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${selectedLocation.rarityColor}`}>
                    <img
                      src={selectedLocation.nftImage}
                      alt={selectedLocation.name}
                      className={`w-full h-full object-cover mix-blend-overlay ${!selectedLocation.unlocked ? 'grayscale' : ''}`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <selectedLocation.icon className="w-24 h-24 text-white/30" />
                    </div>
                  </div>

                  {/* Rarity Badge */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                    <span className={`px-4 py-1 rounded-full text-sm font-bold shadow-lg ${getRarityBadge(selectedLocation.rarity)}`}>
                      {selectedLocation.rarity}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heritage">
                    {selectedLocation.name}
                  </h2>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Category</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedLocation.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Points</span>
                    <span className="font-medium text-kolkata-yellow">{selectedLocation.points} pts</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Collectors</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedLocation.visitors}</span>
                  </div>
                  {selectedLocation.minted && selectedLocation.tokenId && (
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Token ID</span>
                      <span className="font-mono text-sm text-gray-900 dark:text-white">{selectedLocation.tokenId}</span>
                    </div>
                  )}
                </div>

                {selectedLocation.unlocked && !selectedLocation.minted ? (
                  <ShimmerButton
                    className="w-full py-3"
                    background="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                    onClick={() => mintNFT(selectedLocation.id)}
                    disabled={isMinting}
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Minting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Mint Heritage NFT</span>
                      </>
                    )}
                  </ShimmerButton>
                ) : selectedLocation.minted ? (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Share</span>
                      </button>
                      <button className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Download</span>
                      </button>
                    </div>
                    <button className="w-full py-3 border border-purple-500 text-purple-600 rounded-xl flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm">View on OpenSea</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                    <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Visit this location to unlock the NFT badge
                    </p>
                  </div>
                )}
              </div>
            </MagicCard>

            {/* My Collection Button */}
            <button
              onClick={() => setShowCollectionModal(true)}
              className="w-full py-4 bg-gradient-to-r from-kolkata-yellow to-heritage-500 text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              View My Collection
            </button>
          </div>
        </div>
      </div>

      {/* Minting Modal */}
      <AnimatePresence>
        {showMintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center"
            >
              {!mintSuccess ? (
                <>
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Minting Your NFT...
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Please wait while we mint your heritage badge on Sepolia testnet.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Wallet connected
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading metadata to IPFS...
                    </p>
                    <p className="flex items-center justify-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      Waiting for confirmation...
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    NFT Minted! 🎉
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your heritage badge has been added to your collection.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                    <img
                      src={selectedLocation.nftImage}
                      alt={selectedLocation.name}
                      className="w-32 h-32 object-cover rounded-xl mx-auto mb-3"
                    />
                    <p className="font-bold text-gray-900 dark:text-white">{selectedLocation.name}</p>
                    <p className="text-sm text-gray-500">+{selectedLocation.points} Heritage Points</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowMintModal(false);
                        setMintSuccess(false);
                      }}
                      className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl"
                    >
                      Close
                    </button>
                    <button className="flex-1 py-3 bg-purple-500 text-white rounded-xl flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      View on OpenSea
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection Modal */}
      <AnimatePresence>
        {showCollectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCollectionModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-kolkata-yellow to-heritage-500 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Trophy className="w-6 h-6" />
                      My Heritage Collection
                    </h2>
                    <p className="text-gray-800/80">{totalMinted} NFTs • {totalPoints} Points</p>
                  </div>
                  <button
                    onClick={() => setShowCollectionModal(false)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                  >
                    <X className="w-5 h-5 text-gray-900" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-4">
                  {locations.filter(l => l.minted).map((location) => (
                    <div
                      key={location.id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className={`aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${location.rarityColor} mb-3`}>
                        <img
                          src={location.nftImage}
                          alt={location.name}
                          className="w-full h-full object-cover mix-blend-overlay"
                        />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{location.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getRarityBadge(location.rarity)}`}>
                          {location.rarity}
                        </span>
                        <span className="text-sm text-kolkata-yellow font-bold">+{location.points} pts</span>
                      </div>
                    </div>
                  ))}

                  {locations.filter(l => l.minted).length === 0 && (
                    <div className="col-span-2 text-center py-12">
                      <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No NFTs collected yet</p>
                      <p className="text-sm text-gray-400">Visit heritage sites to mint your first badge!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeritageNFT;


