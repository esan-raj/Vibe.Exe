import express from 'express';
import { getBeaconStatus, getNarratives, getActiveBeacons } from '../controllers/beaconController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get beacon system status
router.get('/status', authenticate, getBeaconStatus);

// Get all generated narratives
router.get('/narratives', authenticate, getNarratives);

// Get active beacon nodes
router.get('/beacons', authenticate, getActiveBeacons);

export default router;