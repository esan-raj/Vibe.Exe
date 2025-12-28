import { Request, Response } from 'express';
import { beaconService } from '../services/beaconService.js';

export const getBeaconStatus = async (req: Request, res: Response) => {
  try {
    const activeBeacons = beaconService.getActiveBeacons();
    const nodeHeadStatus = beaconService.getNodeHeadStatus();
    const narratives = beaconService.getNarratives();

    res.json({
      success: true,
      data: {
        nodeHead: nodeHeadStatus,
        activeBeacons: activeBeacons.length,
        beacons: activeBeacons,
        totalNarratives: narratives.length,
        recentNarratives: narratives.slice(0, 5)
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting beacon status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get beacon status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getNarratives = async (req: Request, res: Response) => {
  try {
    const narratives = beaconService.getNarratives();
    
    res.json({
      success: true,
      data: {
        narratives,
        count: narratives.length
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting narratives:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get narratives',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getActiveBeacons = async (req: Request, res: Response) => {
  try {
    const activeBeacons = beaconService.getActiveBeacons();
    
    res.json({
      success: true,
      data: {
        beacons: activeBeacons,
        count: activeBeacons.length
      }
    });
  } catch (error: any) {
    console.error('❌ Error getting active beacons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active beacons',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};