/**
 * Debug Panel Component
 * 
 * A floating panel that displays API request/response history.
 * Works with Requestly for advanced debugging.
 * 
 * Features:
 * - Real-time request tracking
 * - Request/Response details
 * - Filter by status/source
 * - Copy request as cURL
 * - Performance metrics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bug, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Minimize2,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { debugStore, type DebugEntry, toggleDebugMode, toggleRequestly, REQUESTLY_ENABLED } from '../../lib/debug';

interface DebugPanelProps {
  defaultPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const statusColors = {
  pending: 'bg-yellow-500',
  success: 'bg-green-500',
  error: 'bg-red-500',
};

const methodColors: Record<string, string> = {
  GET: 'text-blue-400',
  POST: 'text-green-400',
  PUT: 'text-yellow-400',
  PATCH: 'text-orange-400',
  DELETE: 'text-red-400',
};

export const DebugPanel: React.FC<DebugPanelProps> = ({ 
  defaultPosition = 'bottom-right' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [entries, setEntries] = useState<DebugEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'pending'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to debug store updates
    const unsubscribe = debugStore.subscribe((newEntries) => {
      setEntries(newEntries);
    });

    // Initial load
    setEntries(debugStore.getAll());

    return unsubscribe;
  }, []);

  const filteredEntries = entries.filter(entry => {
    if (filter !== 'all' && entry.status !== filter) return false;
    if (sourceFilter !== 'all' && entry.source !== sourceFilter) return false;
    return true;
  });

  const sources = [...new Set(entries.map(e => e.source))];

  const copyAsCurl = useCallback((entry: DebugEntry) => {
    const { request } = entry;
    const headers = Object.entries(request.headers)
      .map(([k, v]) => `-H '${k}: ${v}'`)
      .join(' ');
    const body = request.body ? `-d '${JSON.stringify(request.body)}'` : '';
    const curl = `curl -X ${request.method} '${request.url}' ${headers} ${body}`.trim();
    
    navigator.clipboard.writeText(curl);
    setCopied(entry.id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed ${positionClasses[defaultPosition]} z-[9999] p-3 rounded-full 
          bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg 
          hover:shadow-xl transition-shadow ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        title="Open Debug Panel"
      >
        <Bug className="w-5 h-5" />
        {entries.some(e => e.status === 'pending') && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        )}
        {entries.some(e => e.status === 'error') && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${positionClasses[defaultPosition]} z-[9999] 
              ${isMinimized ? 'w-80' : 'w-[500px]'} 
              max-h-[70vh] bg-gray-900 border border-gray-700 rounded-xl 
              shadow-2xl overflow-hidden flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-white">Debug Panel</span>
                <span className="px-2 py-0.5 text-xs bg-gray-700 rounded-full text-gray-300">
                  {filteredEntries.length} requests
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => debugStore.clear()}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title="Clear History"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title="Close Panel"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Controls */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700 bg-gray-800/50">
                  {/* Status Filter */}
                  <div className="flex items-center gap-1">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                      className="bg-gray-700 text-sm text-gray-300 rounded px-2 py-1 border-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="all">All Status</option>
                      <option value="success">Success</option>
                      <option value="error">Error</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  {/* Source Filter */}
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="bg-gray-700 text-sm text-gray-300 rounded px-2 py-1 border-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="all">All Sources</option>
                    {sources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>

                  {/* Requestly Toggle */}
                  <button
                    onClick={() => toggleRequestly()}
                    className={`ml-auto flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors
                      ${REQUESTLY_ENABLED 
                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' 
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    title="Toggle Requestly headers"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Requestly
                  </button>
                </div>

                {/* Request List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <Bug className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-sm">No requests captured yet</p>
                      <p className="text-xs mt-1">API calls will appear here</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-700/50">
                      {filteredEntries.map((entry) => (
                        <RequestEntry
                          key={entry.id}
                          entry={entry}
                          isExpanded={expandedId === entry.id}
                          onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                          onCopy={() => copyAsCurl(entry)}
                          isCopied={copied === entry.id}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/50 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-700 rounded">Shift</kbd> + <kbd className="px-1 py-0.5 bg-gray-700 rounded">D</kbd> to toggle</span>
                    <a 
                      href="https://requestly.io" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      Get Requestly <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Individual Request Entry Component
const RequestEntry: React.FC<{
  entry: DebugEntry;
  isExpanded: boolean;
  onToggle: () => void;
  onCopy: () => void;
  isCopied: boolean;
}> = ({ entry, isExpanded, onToggle, onCopy, isCopied }) => {
  const { request, response, error, status, duration } = entry;
  
  // Extract path from URL
  const getPath = (url: string) => {
    try {
      const u = new URL(url);
      return u.pathname + u.search;
    } catch {
      return url;
    }
  };

  return (
    <div className="hover:bg-gray-800/50 transition-colors">
      {/* Summary Row */}
      <div
        className="flex items-center gap-3 px-4 py-2 cursor-pointer"
        onClick={onToggle}
      >
        {/* Status Indicator */}
        <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />

        {/* Method */}
        <span className={`font-mono text-xs font-bold ${methodColors[request.method] || 'text-gray-400'}`}>
          {request.method}
        </span>

        {/* Path */}
        <span className="flex-1 text-sm text-gray-300 truncate font-mono">
          {getPath(request.url)}
        </span>

        {/* Response Status */}
        {response && (
          <span className={`text-xs font-mono ${response.status >= 400 ? 'text-red-400' : 'text-green-400'}`}>
            {response.status}
          </span>
        )}

        {/* Duration */}
        {duration !== undefined && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {duration}ms
          </span>
        )}

        {/* Expand/Collapse */}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-gray-800/30 border-t border-gray-700/50">
              {/* Actions */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy();
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy as cURL</span>
                    </>
                  )}
                </button>
                <span className="text-xs text-gray-500">ID: {entry.id}</span>
                <span className="text-xs text-gray-500">Source: {entry.source}</span>
              </div>

              {/* Request Details */}
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
                  <span className="text-blue-400">→</span> Request
                </h4>
                <div className="bg-gray-900 rounded p-2 text-xs font-mono overflow-x-auto">
                  <div className="text-gray-300 mb-1">{request.url}</div>
                  {request.body && (
                    <pre className="text-gray-400 whitespace-pre-wrap">
                      {JSON.stringify(request.body, null, 2)}
                    </pre>
                  )}
                </div>
              </div>

              {/* Response Details */}
              {response && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
                    <span className={response.status >= 400 ? 'text-red-400' : 'text-green-400'}>←</span>
                    Response ({response.status} {response.statusText})
                  </h4>
                  <div className="bg-gray-900 rounded p-2 text-xs font-mono overflow-x-auto max-h-48">
                    <pre className="text-gray-400 whitespace-pre-wrap">
                      {typeof response.body === 'object' 
                        ? JSON.stringify(response.body, null, 2)
                        : response.body}
                    </pre>
                  </div>
                </div>
              )}

              {/* Error Details */}
              {error && (
                <div>
                  <h4 className="text-xs font-semibold text-red-400 mb-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Error
                  </h4>
                  <div className="bg-red-900/20 border border-red-900/50 rounded p-2 text-xs">
                    <div className="text-red-400">{error.message}</div>
                    {error.stack && (
                      <pre className="text-red-300/50 mt-2 text-[10px] whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DebugPanel;

