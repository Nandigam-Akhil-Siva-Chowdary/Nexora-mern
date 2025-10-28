import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GameSelection = ({ data, updateData, nextStep }) => {
  const [formData, setFormData] = useState({
    courtType: data.courtType || '', // Changed from gameType to courtType
    sport: data.sport || ''
  });
  const [sportsConfig, setSportsConfig] = useState({ outdoor: [], indoor: [] });

  useEffect(() => {
    const fetchSportsConfig = async () => {
      try {
        const response = await axios.get('https://nexora-mern-backend1.onrender.com/api/quotations/sports-config');
        setSportsConfig(response.data);
      } catch (error) {
        console.error('Error fetching sports config:', error);
      }
    };
    fetchSportsConfig();
  }, []);

  const handleCourtTypeChange = (courtType) => {
    setFormData({
      courtType,
      sport: ''
    });
  };

  const handleSportChange = (sport) => {
    const updatedData = {
      ...formData,
      sport
    };
    setFormData(updatedData);
    updateData({
      ...data,
      ...updatedData
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateData({
      ...data,
      ...formData
    });
    nextStep();
  };

  return (
    <div className="form-container">
      <h2>Select Your Sports Facility</h2>
      <form onSubmit={handleSubmit}>
        <div className="section">
          <h3>1. Facility Type</h3>
          <div className="game-type-selection">
            <div 
              className={`game-type-card ${formData.courtType === 'outdoor' ? 'selected' : ''}`}
              onClick={() => handleCourtTypeChange('outdoor')}
            >
              <div className="game-type-icon">🏟️</div>
              <h4>Outdoor Facility</h4>
              <p>Basketball, Football, Tennis, etc.</p>
            </div>
            <div 
              className={`game-type-card ${formData.courtType === 'indoor' ? 'selected' : ''}`}
              onClick={() => handleCourtTypeChange('indoor')}
            >
              <div className="game-type-icon">🏢</div>
              <h4>Indoor Facility</h4>
              <p>Table Tennis, Swimming, Indoor Courts</p>
            </div>
          </div>
        </div>

        {formData.courtType && (
          <div className="section">
            <h3>2. Select Sport</h3>
            <div className="sport-selection">
              {sportsConfig[formData.courtType]?.map(sport => (
                <div
                  key={sport.id}
                  className={`sport-card ${formData.sport === sport.id ? 'selected' : ''}`}
                  onClick={() => handleSportChange(sport.id)}
                >
                  <div className="sport-icon">{sport.image}</div>
                  <div className="sport-name">{sport.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="btn-primary"
          disabled={!formData.courtType || !formData.sport}
        >
          Next
        </button>
      </form>
    </div>
  );
};

export default GameSelection;