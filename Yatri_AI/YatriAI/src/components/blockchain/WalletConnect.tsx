/**
 * WalletConnect Component
 * 
 * Provides MetaMask wallet connection for blockchain features.
 * Features:
 * - Connect/disconnect wallet
 * - Display connected address and balance
 * - Network switching
 * - Faucet link for testnet ETH
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ExternalLink, 
  ChevronDown, 
  Check, 
  AlertCircle,
  Loader2,
  LogOut,
  Copy,
  Droplet,
  RefreshCw,
} from 'lucide-react';
import { blockchainService, type WalletState } from '../../lib/services/blockchain.service';
import { 
  ActiveNetwork, 
  ActiveEthNetwork,
  EthereumNetworks,
  isMetaMaskAvailable,
} from '../../lib/services/config';
import { MagicCard } from '../magicui/MagicCard';
import { cn } from '../../lib/utils';

interface WalletConnectProps {
  onConnect?: (state: WalletState) => void;
  onDisconnect?: () => void;
  compact?: boolean;
  className?: string;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnect,
  onDisconnect,
  compact = false,
  className,
}) => {
  const [walletState, setWalletState] = useState<WalletState>(blockchainService.getWalletState());
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Listen for wallet changes
    blockchainService.setOnWalletChange((state) => {
      setWalletState(state);
      if (state.isConnected) {
        onConnect?.(state);
      } else {
        onDisconnect?.();
      }
    });

    // Check if already connected
    const checkConnection = async () => {
      if (isMetaMaskAvailable()) {
        const ethereum = (window as any).ethereum;
        try {
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // Auto-reconnect
            await handleConnect();
          }
        } catch (error) {
          // Not connected
        }
      }
    };

    checkConnection();
  }, []);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const state = await blockchainService.connectWallet();
      setWalletState(state);
      onConnect?.(state);

      // Check if on correct network
      if (!blockchainService.isOnCorrectNetwork()) {
        setError(`Please switch to ${ActiveNetwork.name}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [onConnect]);

  const handleDisconnect = useCallback(() => {
    blockchainService.disconnectWallet();
    setWalletState(blockchainService.getWalletState());
    setShowDropdown(false);
    onDisconnect?.();
  }, [onDisconnect]);

  const handleSwitchNetwork = useCallback(async () => {
    try {
      await blockchainService.switchNetwork(ActiveEthNetwork as keyof typeof EthereumNetworks);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to switch network');
    }
  }, []);

  const handleCopyAddress = useCallback(() => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [walletState.address]);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Not connected state
  if (!walletState.isConnected) {
    return (
      <div className={cn('inline-block', className)}>
        {!isMetaMaskAvailable() ? (
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
          >
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">Install MetaMask</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <motion.button
            onClick={handleConnect}
            disabled={isConnecting}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
              'hover:from-orange-600 hover:to-amber-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Connect Wallet</span>
              </>
            )}
          </motion.button>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.div>
        )}
      </div>
    );
  }

  // Connected - Compact mode
  if (compact) {
    return (
      <div className={cn('relative inline-block', className)}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">{shortenAddress(walletState.address!)}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Connected</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                    {walletState.network}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    {shortenAddress(walletState.address!)}
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                </div>
                {walletState.balance && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {walletState.balance} {ActiveNetwork.symbol}
                  </div>
                )}
              </div>

              <div className="p-2">
                {!blockchainService.isOnCorrectNetwork() && (
                  <button
                    onClick={handleSwitchNetwork}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Switch to {ActiveNetwork.name}
                  </button>
                )}

                <a
                  href={blockchainService.getFaucetUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                >
                  <Droplet className="w-4 h-4" />
                  Get Test {ActiveNetwork.symbol}
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>

                <a
                  href={blockchainService.getAddressExplorerUrl(walletState.address!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Explorer
                </a>

                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Connected - Full mode
  return (
    <MagicCard className={cn('p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <span className="font-semibold text-gray-900 dark:text-white">Wallet Connected</span>
        </div>
        <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
          {walletState.network}
        </span>
      </div>

      <div className="space-y-3">
        {/* Address */}
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Address</div>
            <div className="font-mono text-sm text-gray-900 dark:text-white">
              {shortenAddress(walletState.address!)}
            </div>
          </div>
          <button
            onClick={handleCopyAddress}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Balance */}
        {walletState.balance && (
          <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400">Balance</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {walletState.balance} {ActiveNetwork.symbol}
            </div>
          </div>
        )}

        {/* Network Warning */}
        {!blockchainService.isOnCorrectNetwork() && (
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm mb-2">
              <AlertCircle className="w-4 h-4" />
              Wrong network
            </div>
            <button
              onClick={handleSwitchNetwork}
              className="w-full py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              Switch to {ActiveNetwork.name}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={blockchainService.getFaucetUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Droplet className="w-4 h-4" />
            Faucet
          </a>
          <a
            href={blockchainService.getAddressExplorerUrl(walletState.address!)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Explorer
          </a>
          <button
            onClick={handleDisconnect}
            className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}
    </MagicCard>
  );
};

export default WalletConnect;

