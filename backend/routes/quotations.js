const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const Pricing = require('../models/Pricing');

// Get sports configuration
router.get('/sports-config', (req, res) => {
  const sportsConfig = {
    outdoor: [
      { id: 'basketball', name: 'Basketball Court', image: '🏀' },
      { id: 'football', name: 'Football Field', image: '⚽' },
      { id: 'volleyball', name: 'Volleyball Court', image: '🏐' },
      { id: 'badminton', name: 'Badminton Court', image: '🏸' },
      { id: 'pickleball', name: 'Pickleball Court', image: '🎾' },
      { id: 'tennis', name: 'Tennis Court', image: '🎾' },
      { id: 'cricket', name: 'Cricket Ground', image: '🏏' }
    ],
    indoor: [
      { id: 'table-tennis', name: 'Table Tennis', image: '🏓' },
      { id: 'swimming', name: 'Swimming Pool', image: '🏊' },
      { id: 'basketball-indoor', name: 'Basketball Court (Indoor)', image: '🏀' },
      { id: 'badminton-indoor', name: 'Badminton Court (Indoor)', image: '🏸' }
    ]
  };
  res.json(sportsConfig);
});

// Get equipment for specific sport
router.get('/equipment/:sport', async (req, res) => {
  try {
    const pricing = await Pricing.findOne({ category: 'default' });
    if (!pricing) {
      return res.status(500).json({ message: 'Pricing data not found' });
    }

    const sport = req.params.sport;
    
    const equipmentMap = {
      'basketball': [
        { id: 'basketball-hoop', name: 'Basketball Hoop System', quantity: 2 },
        { id: 'basketball-backboard', name: 'Backboard', quantity: 2 }
      ],
      'football': [
        { id: 'football-goalpost', name: 'Football Goalpost', quantity: 2 },
        { id: 'football-net', name: 'Goal Net', quantity: 2 }
      ],
      'volleyball': [
        { id: 'volleyball-posts', name: 'Volleyball Posts', quantity: 2 },
        { id: 'volleyball-net', name: 'Volleyball Net', quantity: 1 }
      ],
      'badminton': [
        { id: 'badminton-posts', name: 'Badminton Posts', quantity: 2 },
        { id: 'badminton-net', name: 'Badminton Net', quantity: 1 }
      ],
      'pickleball': [
        { id: 'pickleball-net', name: 'Pickleball Net', quantity: 1 },
        { id: 'pickleball-posts', name: 'Pickleball Posts', quantity: 2 }
      ],
      'tennis': [
        { id: 'tennis-net', name: 'Tennis Net', quantity: 1 },
        { id: 'tennis-posts', name: 'Tennis Posts', quantity: 2 }
      ],
      'cricket': [
        { id: 'cricket-pitch', name: 'Cricket Pitch', quantity: 1 },
        { id: 'cricket-sight-screen', name: 'Sight Screen', quantity: 2 }
      ],
      'table-tennis': [
        { id: 'table-tennis-table', name: 'Table Tennis Table', quantity: 1 },
        { id: 'table-tennis-net', name: 'Table Tennis Net', quantity: 1 }
      ],
      'swimming': [
        { id: 'swimming-pool-liner', name: 'Pool Liner', quantity: 1 },
        { id: 'filtration-system', name: 'Filtration System', quantity: 1 },
        { id: 'pool-ladder', name: 'Pool Ladder', quantity: 2 }
      ],
      'basketball-indoor': [
        { id: 'basketball-hoop', name: 'Basketball Hoop System', quantity: 2 },
        { id: 'basketball-backboard', name: 'Backboard', quantity: 2 }
      ],
      'badminton-indoor': [
        { id: 'badminton-posts', name: 'Badminton Posts', quantity: 2 },
        { id: 'badminton-net', name: 'Badminton Net', quantity: 1 }
      ]
    };

    const equipment = equipmentMap[sport] || [];
    const equipmentWithPricing = equipment.map(item => ({
      ...item,
      unitCost: pricing.equipment[item.id] || 0,
      totalCost: ((pricing.equipment[item.id] || 0) * (item.quantity || 1))
    }));

    res.json(equipmentWithPricing);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new quotation
// Create new quotation
router.post('/', async (req, res) => {
  try {
    console.log('=== QUOTATION REQUEST START ===');
    console.log('Received quotation request body:', JSON.stringify(req.body, null, 2));
    
    const pricing = await Pricing.findOne({ category: 'default' });
    if (!pricing) {
      console.log('Pricing data not found');
      return res.status(500).json({ message: 'Pricing data not found' });
    }

    const { clientInfo, projectInfo, requirements } = req.body;
    
    // Detailed validation with specific messages
    if (!clientInfo) {
      console.log('Missing clientInfo');
      return res.status(400).json({ message: 'Missing client information' });
    }

    if (!clientInfo.name || !clientInfo.email || !clientInfo.phone || !clientInfo.address) {
      console.log('Incomplete clientInfo:', clientInfo);
      return res.status(400).json({ message: 'Please complete all client information fields' });
    }

    if (!projectInfo) {
      console.log('Missing projectInfo');
      return res.status(400).json({ message: 'Missing project information' });
    }

    // FIX: Accept both gameType (from frontend) and courtType (for schema)
    const courtType = projectInfo.courtType || projectInfo.gameType;
    
    if (!projectInfo.sport || !courtType || !projectInfo.courtSize) {
      console.log('Incomplete projectInfo:', projectInfo);
      return res.status(400).json({ 
        message: 'Please complete all project information fields',
        details: {
          sport: projectInfo.sport,
          courtType: courtType,
          courtSize: projectInfo.courtSize
        }
      });
    }

    if (!requirements) {
      console.log('Missing requirements');
      return res.status(400).json({ message: 'Missing construction requirements' });
    }

    if (!requirements.base || !requirements.flooring) {
      console.log('Missing base or flooring:', requirements);
      return res.status(400).json({ message: 'Please select base and flooring types' });
    }

    if (!requirements.base.type || !requirements.flooring.type) {
      console.log('Missing base or flooring type:', requirements);
      return res.status(400).json({ message: 'Please select base and flooring types' });
    }

    console.log('Validating base type:', requirements.base.type);
    console.log('Available base types:', Object.keys(pricing.base));
    console.log('Validating flooring type:', requirements.flooring.type);
    console.log('Available flooring types:', Object.keys(pricing.flooring));

    // Validate base and flooring types exist in pricing
    if (!pricing.base[requirements.base.type]) {
      console.log(`Invalid base type: ${requirements.base.type}`);
      return res.status(400).json({ message: `Invalid base type selected. Please choose from available options.` });
    }

    if (!pricing.flooring[requirements.flooring.type]) {
      console.log(`Invalid flooring type: ${requirements.flooring.type}`);
      return res.status(400).json({ message: `Invalid flooring type selected. Please choose from available options.` });
    }

    // Get court area based on sport and size
// In the POST route, find the court area calculation section and replace it with:
// Get court area based on sport and size
let courtArea;
if (projectInfo.courtSize === 'standard') {
  courtArea = pricing.courtSizes[projectInfo.sport]?.['standard'] || 100;
  console.log('Using standard court area:', courtArea);
} else {
  // For custom and premium sizes, use the provided dimensions
  courtArea = parseFloat(projectInfo.customDimensions?.area) || 100;
  console.log('Using custom court area:', courtArea, 'Dimensions:', projectInfo.customDimensions);
}

// Add validation for custom dimensions
if ((projectInfo.courtSize === 'custom' || projectInfo.courtSize === 'premium') && projectInfo.customDimensions) {
  console.log('Custom dimensions received:', projectInfo.customDimensions);
  
  // Validate dimensions
  if (!projectInfo.customDimensions.length || !projectInfo.customDimensions.width) {
    return res.status(400).json({ 
      message: 'Please provide both length and width for custom dimensions' 
    });
  }
  
  const calculatedArea = parseFloat(projectInfo.customDimensions.length) * parseFloat(projectInfo.customDimensions.width);
  console.log('Calculated area from dimensions:', calculatedArea);
  console.log('Provided area:', projectInfo.customDimensions.area);
}

    // Calculate costs
    const baseCost = Math.round((pricing.base[requirements.base.type] || 0) * courtArea);
    const flooringCost = Math.round((pricing.flooring[requirements.flooring.type] || 0) * courtArea);
    
    // Equipment cost
    const equipmentCost = (requirements.equipment || []).reduce((total, item) => {
      const itemCost = Number(item.totalCost) || 0;
      console.log(`Equipment: ${item.name}, Cost: ${itemCost}`);
      return total + itemCost;
    }, 0);
    
    // Lighting cost
    let lightingCost = 0;
    if (requirements.lighting && requirements.lighting.required && requirements.lighting.type) {
      const lightingQuantity = Number(requirements.lighting.quantity) || 1;
      lightingCost = Math.round((pricing.lighting[requirements.lighting.type] || 0) * lightingQuantity);
      console.log('Lighting cost:', lightingCost);
    }

    // Roof cost
    let roofCost = 0;
    if (requirements.roof && requirements.roof.required && requirements.roof.type) {
      const roofArea = Number(requirements.roof.area) || courtArea;
      roofCost = Math.round((pricing.roof[requirements.roof.type] || 0) * roofArea);
      console.log('Roof cost:', roofCost);
    }

    // Additional features cost
    const additionalCost = (requirements.additionalFeatures || []).reduce((total, feature) => {
      return total + (Number(feature.cost) || 0);
    }, 0);

    const totalCost = baseCost + flooringCost + equipmentCost + lightingCost + roofCost + additionalCost;

    console.log('Final cost calculation:', {
      baseCost,
      flooringCost,
      equipmentCost,
      lightingCost,
      roofCost,
      additionalCost,
      totalCost
    });

    // FIX: Use courtType from either field
// In the quotationData object, make sure customDimensions is included:
const quotationData = {
  clientInfo,
  projectInfo: {
    sport: projectInfo.sport,
    courtType: courtType,
    courtSize: projectInfo.courtSize,
    // Make sure customDimensions is properly passed through
    customDimensions: projectInfo.customDimensions || null
  },
  requirements: {
    base: { 
      type: requirements.base.type,
      area: courtArea
    },
    flooring: { 
      type: requirements.flooring.type,
      area: courtArea
    },
    equipment: requirements.equipment || [],
    lighting: requirements.lighting || { required: false },
    roof: requirements.roof || { required: false },
    additionalFeatures: requirements.additionalFeatures || []
  },
  pricing: {
    baseCost,
    flooringCost,
    equipmentCost,
    lightingCost,
    roofCost,
    additionalCost,
    totalCost
  }
};

console.log('Final quotation data with custom dimensions:', JSON.stringify(quotationData.projectInfo.customDimensions, null, 2));
    console.log('Creating quotation with data:', quotationData);
    const quotation = new Quotation(quotationData);
    await quotation.save();
    
    console.log('=== QUOTATION SAVED SUCCESSFULLY ===');
    console.log('Quotation number:', quotation.quotationNumber);
    
    res.status(201).json(quotation);
  } catch (error) {
    console.error('=== ERROR CREATING QUOTATION ===');
    console.error('Error details:', error);
    res.status(400).json({ 
      message: 'Error creating quotation', 
      error: error.message,
      details: error.errors 
    });
  }
});

// Test endpoint to check pricing data
router.get('/debug/pricing', async (req, res) => {
  try {
    const pricing = await Pricing.findOne({ category: 'default' });
    if (!pricing) {
      return res.status(404).json({ message: 'No pricing data found' });
    }
    
    res.json({
      base: pricing.base,
      flooring: pricing.flooring,
      courtSizes: pricing.courtSizes,
      equipment: pricing.equipment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;