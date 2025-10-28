import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CourtSize = ({ data, updateData, nextStep, prevStep }) => {
  const [formData, setFormData] = useState({
    courtSize: data.courtSize || 'standard',
    customDimensions: data.customDimensions || {
      length: '',
      width: '',
      area: ''
    }
  });
  const [courtSizes, setCourtSizes] = useState({});

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await axios.get('https://nexora-mern-backend1.onrender.com/api/pricing');
        setCourtSizes(response.data.courtSizes);
      } catch (error) {
        console.error('Error fetching pricing:', error);
      }
    };
    fetchPricing();
  }, []);

  const handleSizeChange = (size) => {
    const updatedData = {
      ...formData,
      courtSize: size,
      customDimensions: size === 'standard' ? {} : formData.customDimensions
    };
    setFormData(updatedData);
    updateData({
      ...data,
      ...updatedData
    });
  };

  const handleDimensionChange = (field, value) => {
    const updatedDimensions = {
      ...formData.customDimensions,
      [field]: value
    };

    // Calculate area if both length and width are provided
    if (field === 'length' || field === 'width') {
      const length = field === 'length' ? value : formData.customDimensions.length;
      const width = field === 'width' ? value : formData.customDimensions.width;
      
      if (length && width) {
        updatedDimensions.area = (parseFloat(length) * parseFloat(width)).toFixed(2);
      }
    }

    const updatedData = {
      ...formData,
      customDimensions: updatedDimensions
    };
    
    setFormData(updatedData);
    updateData({
      ...data,
      ...updatedData
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate custom dimensions if custom or premium size is selected
    if (formData.courtSize !== 'standard') {
      if (!formData.customDimensions.length || !formData.customDimensions.width) {
        alert('Please enter both length and width for custom dimensions');
        return;
      }
      if (parseFloat(formData.customDimensions.area) <= 0) {
        alert('Please enter valid dimensions (area must be greater than 0)');
        return;
      }
    }

    updateData({
      ...data,
      ...formData
    });
    nextStep();
  };

  const getCourtArea = () => {
    if (formData.courtSize === 'standard') {
      return courtSizes[data.sport]?.['standard'] || 'N/A';
    } else if (formData.courtSize === 'custom' && formData.customDimensions.area) {
      return formData.customDimensions.area;
    } else if (formData.courtSize === 'premium' && formData.customDimensions.area) {
      return formData.customDimensions.area;
    }
    return 'Enter dimensions below';
  };

  const getRecommendedDimensions = () => {
    const standardArea = courtSizes[data.sport]?.['standard'];
    if (!standardArea) return null;
    
    // Calculate approximate dimensions for recommendation
    const recommendedLength = Math.sqrt(standardArea * 1.5).toFixed(1);
    const recommendedWidth = Math.sqrt(standardArea / 1.5).toFixed(1);
    
    return { length: recommendedLength, width: recommendedWidth };
  };

  const sizeDescriptions = {
    standard: {
      title: 'Standard Size',
      description: 'Official competition dimensions',
      features: ['Official dimensions', 'Basic equipment', 'Standard materials']
    },
    custom: {
      title: 'Custom Size',
      description: 'Tailored to your space requirements',
      features: ['Custom dimensions', 'Flexible design', 'Personalized features']
    },
    premium: {
      title: 'Premium Size',
      description: 'Enhanced features with professional standards',
      features: ['Enhanced dimensions', 'Premium equipment', 'Professional quality']
    }
  };

  const recommendedDimensions = getRecommendedDimensions();

  return (
    <div className="form-container">
      <h2>Select Court Size & Dimensions</h2>
      <form onSubmit={handleSubmit}>
        <div className="section">
          <h3>Selected Sport: {data.sport?.replace('-', ' ').toUpperCase()}</h3>
          <p className="court-area">
            <strong>Court Area: {getCourtArea()} sq. meters</strong>
          </p>
          
          <div className="court-size-selection">
            {['standard', 'custom', 'premium'].map(size => (
              <div
                key={size}
                className={`court-size-card ${formData.courtSize === size ? 'selected' : ''}`}
                onClick={() => handleSizeChange(size)}
              >
                <h4>{sizeDescriptions[size].title}</h4>
                <p>{sizeDescriptions[size].description}</p>
                <div className="features-list">
                  {sizeDescriptions[size].features.map((feature, index) => (
                    <span key={index} className="feature-tag">✓ {feature}</span>
                  ))}
                </div>
                {size === 'standard' && <div className="popular-badge">Most Popular</div>}
              </div>
            ))}
          </div>

          {/* Custom Dimensions Input for Custom and Premium Sizes */}
          {(formData.courtSize === 'custom' || formData.courtSize === 'premium') && (
            <div className="section custom-dimensions">
              <h3>Enter Court Dimensions</h3>
              
              {recommendedDimensions && (
                <div className="recommendation">
                  <p>
                    <strong>Recommended for {data.sport}:</strong> 
                    Length: {recommendedDimensions.length}m × Width: {recommendedDimensions.width}m
                  </p>
                </div>
              )}

              <div className="dimensions-input-group">
                <div className="form-group">
                  <label>Length (meters):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.customDimensions.length}
                    onChange={(e) => handleDimensionChange('length', e.target.value)}
                    placeholder="Enter length in meters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Width (meters):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.customDimensions.width}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                    placeholder="Enter width in meters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Calculated Area (sq. meters):</label>
                  <input
                    type="number"
                    value={formData.customDimensions.area || ''}
                    readOnly
                    className="readonly-input"
                    placeholder="Area will be calculated automatically"
                  />
                </div>
              </div>

              <div className="dimension-examples">
                <h4>Common Court Dimensions:</h4>
                <div className="examples-grid">
                  {data.sport === 'basketball' && (
                    <>
                      <span>Full Court: 28m × 15m</span>
                      <span>Half Court: 14m × 15m</span>
                    </>
                  )}
                  {data.sport === 'tennis' && (
                    <>
                      <span>Singles: 23.77m × 8.23m</span>
                      <span>Doubles: 23.77m × 10.97m</span>
                    </>
                  )}
                  {data.sport === 'badminton' && (
                    <>
                      <span>Singles: 13.4m × 5.18m</span>
                      <span>Doubles: 13.4m × 6.1m</span>
                    </>
                  )}
                  {data.sport === 'volleyball' && (
                    <span>Standard: 18m × 9m</span>
                  )}
                  {data.sport === 'pickleball' && (
                    <span>Standard: 13.4m × 6.1m</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="button-group">
          <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
          <button type="submit" className="btn-primary">
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourtSize;