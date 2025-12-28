import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { geminiService } from './geminiService.js';

interface BeaconNode {
  id: string;
  deviceName: string;
  ipAddress: string;
  lastSeen: Date;
  isActive: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

interface BeaconMessage {
  nodeId: string;
  message: string;
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
}

interface GeneratedNarrative {
  id: string;
  originalMessage: string;
  narrative: string;
  audioUrl?: string;
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
}

class BeaconService {
  private io: SocketIOServer | null = null;
  private beaconNodes: Map<string, BeaconNode> = new Map();
  private narratives: Map<string, GeneratedNarrative> = new Map();
  private nodeHeadId: string | null = null;

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupSocketHandlers();
    console.log('🔗 Beacon Service initialized with Socket.IO');
  }

  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`📡 Device connected: ${socket.id}`);

      // Register as node head
      socket.on('register-node-head', (data: { deviceName: string }) => {
        this.nodeHeadId = socket.id;
        console.log(`👑 Node Head registered: ${data.deviceName} (${socket.id})`);
        
        socket.emit('node-head-registered', {
          success: true,
          nodeId: socket.id,
          activeBeacons: Array.from(this.beaconNodes.values())
        });
      });

      // Register as beacon node
      socket.on('register-beacon', (data: { deviceName: string, location?: { lat: number, lng: number } }) => {
        const beaconNode: BeaconNode = {
          id: socket.id,
          deviceName: data.deviceName,
          ipAddress: socket.handshake.address,
          lastSeen: new Date(),
          isActive: true,
          location: data.location
        };

        this.beaconNodes.set(socket.id, beaconNode);
        console.log(`🔵 Beacon Node registered: ${data.deviceName} (${socket.id})`);

        // Notify node head about new beacon
        if (this.nodeHeadId) {
          this.io?.to(this.nodeHeadId).emit('beacon-registered', beaconNode);
        }

        socket.emit('beacon-registered', {
          success: true,
          nodeId: socket.id,
          message: 'Beacon node registered successfully'
        });
      });

      // Handle beacon message from beacon node
      socket.on('beacon-message', async (data: { message: string, location?: { lat: number, lng: number } }) => {
        const beaconNode = this.beaconNodes.get(socket.id);
        if (!beaconNode) {
          socket.emit('error', { message: 'Beacon node not registered' });
          return;
        }

        const beaconMessage: BeaconMessage = {
          nodeId: socket.id,
          message: data.message,
          timestamp: new Date(),
          location: data.location || beaconNode.location
        };

        console.log(`📨 Beacon message from ${beaconNode.deviceName}: "${data.message}"`);

        // Forward to node head
        if (this.nodeHeadId) {
          this.io?.to(this.nodeHeadId).emit('beacon-message-received', {
            ...beaconMessage,
            deviceName: beaconNode.deviceName
          });
        }

        // Generate narrative story
        try {
          const narrative = await this.generateNarrative(data.message, data.location);
          
          // Store narrative
          this.narratives.set(narrative.id, narrative);

          // Send narrative back to beacon node and node head
          const narrativeResponse = {
            id: narrative.id,
            originalMessage: data.message,
            narrative: narrative.narrative,
            timestamp: narrative.timestamp,
            deviceName: beaconNode.deviceName
          };

          socket.emit('narrative-generated', narrativeResponse);
          
          if (this.nodeHeadId) {
            this.io?.to(this.nodeHeadId).emit('narrative-generated', narrativeResponse);
          }

        } catch (error) {
          console.error('❌ Error generating narrative:', error);
          socket.emit('error', { message: 'Failed to generate narrative' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`📡 Device disconnected: ${socket.id}`);
        
        if (this.nodeHeadId === socket.id) {
          this.nodeHeadId = null;
          console.log('👑 Node Head disconnected');
        }

        if (this.beaconNodes.has(socket.id)) {
          const beacon = this.beaconNodes.get(socket.id);
          this.beaconNodes.delete(socket.id);
          console.log(`🔵 Beacon Node disconnected: ${beacon?.deviceName}`);
          
          // Notify node head
          if (this.nodeHeadId) {
            this.io?.to(this.nodeHeadId).emit('beacon-disconnected', { nodeId: socket.id });
          }
        }
      });

      // Get all narratives
      socket.on('get-narratives', () => {
        const allNarratives = Array.from(this.narratives.values())
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        socket.emit('narratives-list', allNarratives);
      });

      // Get beacon nodes status
      socket.on('get-beacon-status', () => {
        socket.emit('beacon-status', {
          nodeHeadId: this.nodeHeadId,
          activeBeacons: Array.from(this.beaconNodes.values()),
          totalNarratives: this.narratives.size
        });
      });
    });
  }

  private async generateNarrative(message: string, location?: { lat: number, lng: number }): Promise<GeneratedNarrative> {
    try {
      const narrativeText = await geminiService.generateNarrative(message);
      
      const narrative: GeneratedNarrative = {
        id: `narrative-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalMessage: message,
        narrative: narrativeText,
        timestamp: new Date(),
        location
      };

      return narrative;
    } catch (error) {
      console.error('❌ Error generating narrative with Gemini:', error);
      
      // Fallback narrative
      const fallbackNarrative: GeneratedNarrative = {
        id: `narrative-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalMessage: message,
        narrative: `Arre, what a wonderful discovery! You've found ${message}. This place holds so many stories and memories. Ki sundor, na? Every corner of Kolkata has its own tale to tell, and this spot is no different. Take a moment to soak in the atmosphere and imagine all the people who have walked here before you. Ek dam amazing experience it will be!`,
        timestamp: new Date(),
        location
      };

      return fallbackNarrative;
    }
  }

  // Public methods for external access
  getActiveBeacons(): BeaconNode[] {
    return Array.from(this.beaconNodes.values());
  }

  getNarratives(): GeneratedNarrative[] {
    return Array.from(this.narratives.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getNodeHeadStatus(): { isActive: boolean, nodeId: string | null } {
    return {
      isActive: this.nodeHeadId !== null,
      nodeId: this.nodeHeadId
    };
  }
}

export const beaconService = new BeaconService();