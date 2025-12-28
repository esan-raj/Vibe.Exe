/**
 * Sync Service
 * Handles offline queue and sync when network is restored
 */

import * as SQLite from 'expo-sqlite';
import { useNetworkStore } from './offline';

interface QueuedAction {
  id: string;
  type: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data: unknown;
  timestamp: number;
  retries: number;
}

class SyncService {
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly MAX_RETRIES = 3;
  private syncInProgress = false;

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('yatriai_offline.db');
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS queued_actions (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          endpoint TEXT NOT NULL,
          method TEXT NOT NULL,
          data TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          retries INTEGER DEFAULT 0
        );
      `);
    } catch (error) {
      console.error('Failed to initialize sync service:', error);
    }
  }

  async queueAction(
    type: string,
    endpoint: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data: unknown
  ): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    const action: QueuedAction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    try {
      await this.db?.runAsync(
        `INSERT INTO queued_actions (id, type, endpoint, method, data, timestamp, retries)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          action.id,
          action.type,
          action.endpoint,
          action.method,
          JSON.stringify(data),
          action.timestamp,
          action.retries,
        ]
      );
    } catch (error) {
      console.error('Failed to queue action:', error);
    }
  }

  async getQueuedActions(): Promise<QueuedAction[]> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      const result = await this.db?.getAllAsync<{
        id: string;
        type: string;
        endpoint: string;
        method: string;
        data: string;
        timestamp: number;
        retries: number;
      }>('SELECT * FROM queued_actions ORDER BY timestamp ASC');
      
      return (result || []).map((row) => ({
        id: row.id,
        type: row.type,
        endpoint: row.endpoint,
        method: row.method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        data: JSON.parse(row.data),
        timestamp: row.timestamp,
        retries: row.retries,
      }));
    } catch (error) {
      console.error('Failed to get queued actions:', error);
      return [];
    }
  }

  async removeAction(id: string): Promise<void> {
    try {
      await this.db?.runAsync('DELETE FROM queued_actions WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to remove action:', error);
    }
  }

  async incrementRetries(id: string): Promise<void> {
    try {
      await this.db?.runAsync(
        'UPDATE queued_actions SET retries = retries + 1 WHERE id = ?',
        [id]
      );
    } catch (error) {
      console.error('Failed to increment retries:', error);
    }
  }

  async sync(): Promise<void> {
    if (this.syncInProgress) return;
    
    const { isConnected } = useNetworkStore.getState();
    if (!isConnected) return;

    this.syncInProgress = true;

    try {
      const actions = await this.getQueuedActions();
      
      for (const action of actions) {
        if (action.retries >= this.MAX_RETRIES) {
          await this.removeAction(action.id);
          continue;
        }

        try {
          // Import apiClient dynamically to avoid circular dependency
          const { apiClient } = await import('../api/client');
          
          // Execute the queued action
          await apiClient.request(
            action.method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
            action.endpoint,
            action.data
          );

          // Success: remove from queue
          await this.removeAction(action.id);
        } catch (error) {
          // Failure: increment retries
          await this.incrementRetries(action.id);
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  async clearQueue(): Promise<void> {
    try {
      await this.db?.runAsync('DELETE FROM queued_actions');
    } catch (error) {
      console.error('Failed to clear queue:', error);
    }
  }
}

export const syncService = new SyncService();

// Auto-sync when network is restored
useNetworkStore.subscribe(
  (state) => state.isConnected,
  (isConnected) => {
    if (isConnected) {
      syncService.sync();
    }
  }
);

