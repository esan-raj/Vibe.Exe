/**
 * BlockchainVerification Component
 * 
 * Displays blockchain verification status for bookings.
 * Features:
 * - Transaction status display
 * - Block explorer links
 * - Verification badge
 * - Network info
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  ExternalLink, 
  Check, 
  Clock, 
  AlertCircle,
  Loader2,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { blockchainService, type BlockchainRecord, type VerificationResult } from '../../lib/services/blockchain.service';
import { ActiveNetwork } from '../../lib/services/config';
import { cn } from '../../lib/utils';

interface BlockchainVerificationProps {
  txHash?: string;
  record?: BlockchainRecord;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const BlockchainVerification: React.FC<BlockchainVerificationProps> = ({
  txHash,
  record: initialRecord,
  showDetails = false,
  compact = false,
  className,
}) => {
  const [record, setRecord] = useState<BlockchainRecord | null>(initialRecord || null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (txHash && !initialRecord) {
      verifyTransaction();
    }
  }, [txHash]);

  const verifyTransaction = async () => {
    if (!txHash) return;

    setIsVerifying(true);
    try {
      const result = await blockchainService.verifyBooking(txHash);
      setVerification(result);
      if (result.record) {
        setRecord(result.record);
      }
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopy = () => {
    if (record?.txHash) {
      navigator.clipboard.writeText(record.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'pending':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className={cn('flex items-center gap-2 text-gray-500', className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Verifying on blockchain...</span>
      </div>
    );
  }

  // No record
  if (!record && !txHash) {
    return null;
  }

  // Compact mode - just a badge
  if (compact && record) {
    return (
      <a
        href={record.explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors',
          getStatusColor(record.status),
          'hover:opacity-80',
          className
        )}
      >
        {getStatusIcon(record.status)}
        <span>Verified on Chain</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  }

  // Full display
  return (
    <div className={cn('border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Blockchain Verified
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Secured on {ActiveNetwork.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {record && (
            <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(record.status))}>
              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Details */}
      <AnimatePresence>
        {isExpanded && record && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
              {/* Transaction Hash */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Transaction Hash
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    {shortenHash(record.txHash)}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <a
                    href={record.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Block Number
                  </label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {record.blockNumber.toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Network
                  </label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {record.network}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Timestamp
                  </label>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(record.timestamp).toLocaleString()}
                  </div>
                </div>

                {record.gasUsed && (
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Gas Used
                    </label>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {record.gasUsed.toLocaleString()}
                    </div>
                  </div>
                )}

                {record.confirmations && (
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Confirmations
                    </label>
                    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {record.confirmations}+
                    </div>
                  </div>
                )}
              </div>

              {/* Verification Message */}
              {verification?.message && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm">
                    <Check className="w-4 h-4" />
                    {verification.message}
                  </div>
                </div>
              )}

              {/* View on Explorer */}
              <a
                href={record.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">View on {ActiveNetwork.name.split(' ')[0]} Explorer</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Verification Badge - Simple inline badge
export const VerificationBadge: React.FC<{
  verified?: boolean;
  txHash?: string;
  compact?: boolean;
}> = ({ verified = true, txHash, compact = false }) => {
  if (!verified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
        <Shield className="w-3 h-3" />
        Not verified
      </span>
    );
  }

  return (
    <a
      href={txHash ? blockchainService.getExplorerUrl(txHash) : '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        'text-emerald-600 dark:text-emerald-400',
        'hover:underline'
      )}
    >
      <Shield className="w-3 h-3" />
      {compact ? 'Verified' : 'Blockchain Verified'}
      {txHash && <ExternalLink className="w-3 h-3" />}
    </a>
  );
};

export default BlockchainVerification;

