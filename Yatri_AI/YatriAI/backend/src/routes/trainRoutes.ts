import express from 'express';
import axios from 'axios';
import { searchTrains, getTrainStatus, searchStations } from '../controllers/trainController.js';

const router = express.Router();

// POST /api/trains/search - Search for trains
router.post('/search', searchTrains);

// GET /api/trains/status/:trainNumber - Get train status
router.get('/status/:trainNumber', getTrainStatus);

// GET /api/trains/stations?query=<search> - Search for stations
router.get('/stations', searchStations);

// Proxy routes for indian-rail-api
const INDIAN_RAIL_API_BASE = process.env.INDIAN_RAIL_API_BASE || 'http://localhost:3000';

// Helper to check if indian-rail-api is available
const isIndianRailApiAvailable = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${INDIAN_RAIL_API_BASE}/`, { timeout: 2000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

// GET /api/trains/betweenStations - Proxy to indian-rail-api
router.get('/betweenStations', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ success: false, error: 'Missing from or to parameters' });
    }
    
    // Check if indian-rail-api is available
    const apiAvailable = await isIndianRailApiAvailable();
    if (!apiAvailable) {
      console.warn(`Indian Rail API not available at ${INDIAN_RAIL_API_BASE}. Please start the indian-rail-api server.`);
      return res.status(503).json({ 
        success: false, 
        error: 'Indian Rail API server not available',
        message: `Please start the indian-rail-api server at ${INDIAN_RAIL_API_BASE}. Run: cd indian-rail-api && npm start`
      });
    }
    
    const response = await axios.get(`${INDIAN_RAIL_API_BASE}/trains/betweenStations`, {
      params: { from, to },
      timeout: 10000,
    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Error proxying betweenStations:', error.message);
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ 
        success: false, 
        error: 'Indian Rail API server not available',
        message: `Connection refused. Please start the indian-rail-api server at ${INDIAN_RAIL_API_BASE}`
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch trains',
        message: error.message 
      });
    }
  }
});

// GET /api/trains/getTrainOn - Proxy to indian-rail-api
router.get('/getTrainOn', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    if (!from || !to || !date) {
      return res.status(400).json({ success: false, error: 'Missing from, to, or date parameters' });
    }
    
    // Check if indian-rail-api is available
    const apiAvailable = await isIndianRailApiAvailable();
    if (!apiAvailable) {
      console.warn(`Indian Rail API not available at ${INDIAN_RAIL_API_BASE}. Please start the indian-rail-api server.`);
      return res.status(503).json({ 
        success: false, 
        error: 'Indian Rail API server not available',
        message: `Please start the indian-rail-api server at ${INDIAN_RAIL_API_BASE}. Run: cd indian-rail-api && npm start`
      });
    }
    
    const response = await axios.get(`${INDIAN_RAIL_API_BASE}/trains/getTrainOn`, {
      params: { from, to, date },
      timeout: 10000,
    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Error proxying getTrainOn:', error.message);
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ 
        success: false, 
        error: 'Indian Rail API server not available',
        message: `Connection refused. Please start the indian-rail-api server at ${INDIAN_RAIL_API_BASE}`
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch trains on date',
        message: error.message 
      });
    }
  }
});

// GET /api/trains/getTrain - Proxy to indian-rail-api
router.get('/getTrain', async (req, res) => {
  try {
    const { trainNo } = req.query;
    if (!trainNo) {
      return res.status(400).json({ success: false, error: 'Missing trainNo parameter' });
    }
    
    const response = await axios.get(`${INDIAN_RAIL_API_BASE}/trains/getTrain`, {
      params: { trainNo },
      timeout: 10000,
    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Error proxying getTrain:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch train info',
      message: error.message 
    });
  }
});

// GET /api/trains/getRoute - Proxy to indian-rail-api
router.get('/getRoute', async (req, res) => {
  try {
    const { trainNo } = req.query;
    if (!trainNo) {
      return res.status(400).json({ success: false, error: 'Missing trainNo parameter' });
    }
    
    const response = await axios.get(`${INDIAN_RAIL_API_BASE}/trains/getRoute`, {
      params: { trainNo },
      timeout: 10000,
    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Error proxying getRoute:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch train route',
      message: error.message 
    });
  }
});

export default router;