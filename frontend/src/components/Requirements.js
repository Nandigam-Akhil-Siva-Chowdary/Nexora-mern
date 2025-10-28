import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Requirements = ({ data, updateData, nextStep, prevStep, projectInfo }) => {
  const [formData, setFormData] = useState({
    base: data.base || { type: '', area: '' },
    flooring: data.flooring || { type: '', area: '' },
    equipment: data.equipment || [],
    lighting: data.lighting || { required: false, type: '', quantity: '' },
    roof: data.roof || { required: false, type: '', area: '' },
    additionalFeatures: data.additionalFeatures || []
  });
  const [equipmentList, setEquipmentList] = useState([]);
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricingRes, equipmentRes] = await Promise.all([
          axios.get('https://nexora-mern-backend1.onrender.com/api/pricing'),
          axios.get(`https://nexora-mern-backend1.onrender.com/api/quotations/equipment/${projectInfo.sport}`)
        ]);
        
        setPricing(pricingRes.data);
        const equipmentData = equipmentRes.data;
        setEquipmentList(equipmentData);
        
        // Auto-select equipment with proper initialization
        const initializedEquipment = equipmentData.map(item => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          totalCost: Number(item.unitCost) * (Number(item.quantity) || 1)
        }));
        
        setFormData(prev => ({
          ...prev,
          equipment: initializedEquipment
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (projectInfo.sport) {
      fetchData();
    }
  }, [projectInfo.sport]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleEquipmentChange = (index, field, value) => {
    const updatedEquipment = [...formData.equipment];
    
    if (field === 'quantity') {
      const quantity = Number(value) || 1;
      updatedEquipment[index] = {
        ...updatedEquipment[index],
        quantity: quantity,
        totalCost: (Number(updatedEquipment[index].unitCost) || 0) * quantity
      };
    } else {
      updatedEquipment[index] = {
        ...updatedEquipment[index],
        [field]: value
      };
    }
    
    setFormData(prev => ({
      ...prev,
      equipment: updatedEquipment
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form before proceeding
    if (!formData.base.type || !formData.flooring.type) {
      alert('Please select base and flooring types');
      return;
    }

    // Ensure all equipment has valid quantities
    const validatedEquipment = formData.equipment.map(item => ({
      ...item,
      quantity: Number(item.quantity) || 1,
      totalCost: (Number(item.unitCost) || 0) * (Number(item.quantity) || 1)
    }));

    const validatedFormData = {
      ...formData,
      equipment: validatedEquipment,
      lighting: {
        ...formData.lighting,
        quantity: formData.lighting.required ? (Number(formData.lighting.quantity) || 1) : 0
      },
      roof: {
        ...formData.roof,
        area: formData.roof.required ? (Number(formData.roof.area) || 0) : 0
      }
    };

    updateData(validatedFormData);
    nextStep();
  };

const getFlooringOptions = () => {
  const outdoorOptions = [
    { value: 'synthetic-turf', label: 'Synthetic Turf' },
    { value: 'natural-grass', label: 'Natural Grass' },
    { value: 'clay-court', label: 'Clay Court' },
    { value: 'acrylic-surface', label: 'Acrylic Surface' },
    { value: 'concrete-flooring', label: 'Concrete Flooring' }
  ];
  
  const indoorOptions = [
    { value: 'wooden-flooring', label: 'Wooden Flooring' },
    { value: 'pvc-flooring', label: 'PVC Flooring' },
    { value: 'rubber-flooring', label: 'Rubber Flooring' },
    { value: 'concrete-flooring', label: 'Concrete Flooring' }
  ];
    
  return projectInfo.courtType === 'indoor' ? indoorOptions : outdoorOptions; 
};

  const getBaseOptions = () => [
    { value: 'concrete-base', label: 'Concrete Base' },
    { value: 'asphalt-base', label: 'Asphalt Base' },
    { value: 'compacted-soil', label: 'Compacted Soil' }
  ];

  const getLightingOptions = () => [
    { value: 'led-floodlights', label: 'LED Floodlights' },
    { value: 'metal-halide', label: 'Metal Halide' },
    { value: 'solar-lights', label: 'Solar Lights' },
    { value: 'indoor-led', label: 'Indoor LED Lighting' }
  ];

  const getRoofOptions = () => {
    const options = [
      { value: 'steel-shed', label: 'Steel Shed' },
      { value: 'fabric-shed', label: 'Fabric Shed' },
      { value: 'permanent-structure', label: 'Permanent Structure' }
    ];
    
    if (projectInfo.sport === 'swimming') {
      options.push({ value: 'swimming-pool-cover', label: 'Swimming Pool Cover' });
    }
    
    return options;
  };

  return (
    <div className="form-container">
      <h2>Construction Requirements</h2>
      <form onSubmit={handleSubmit}>
        {/* Base Section */}
        <div className="section">
          <h3>1. Base Construction</h3>
          <div className="form-group">
            <label>Base Type:</label>
            <select
              value={formData.base.type}
              onChange={(e) => handleChange('base', 'type', e.target.value)}
              required
            >
              <option value="">Select Base Type</option>
              {getBaseOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Flooring Section */}
        <div className="section">
          <h3>2. Flooring</h3>
          <div className="form-group">
            <label>Flooring Type:</label>
            <select
              value={formData.flooring.type}
              onChange={(e) => handleChange('flooring', 'type', e.target.value)}
              required
            >
              <option value="">Select Flooring Type</option>
              {getFlooringOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="section">
          <h3>3. Sports Equipment</h3>
          {formData.equipment.map((item, index) => (
            <div key={index} className="equipment-item">
              <div className="equipment-info">
                <strong>{item.name}</strong>
                <span>Unit Cost: ₹{(Number(item.unitCost) || 0).toLocaleString()}</span>
              </div>
              <div className="form-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  value={Number(item.quantity) || ''}
                  onChange={(e) => handleEquipmentChange(index, 'quantity', e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div className="equipment-total">
                Total: ₹{(Number(item.totalCost) || 0).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Lighting Section */}
        <div className="section">
          <h3>4. Lighting (Optional)</h3>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.lighting.required}
                onChange={(e) => handleChange('lighting', 'required', e.target.checked)}
              />
              Include Lighting System
            </label>
          </div>
          {formData.lighting.required && (
            <>
              <div className="form-group">
                <label>Lighting Type:</label>
                <select
                  value={formData.lighting.type}
                  onChange={(e) => handleChange('lighting', 'type', e.target.value)}
                  required={formData.lighting.required}
                >
                  <option value="">Select Lighting Type</option>
                  {getLightingOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  value={formData.lighting.quantity}
                  onChange={(e) => handleChange('lighting', 'quantity', e.target.value)}
                  min="1"
                  required={formData.lighting.required}
                />
              </div>
            </>
          )}
        </div>

        {/* Roof Section */}
        <div className="section">
          <h3>5. Roof/Cover (Optional)</h3>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.roof.required}
                onChange={(e) => handleChange('roof', 'required', e.target.checked)}
              />
              Include Roof/Cover
            </label>
          </div>
          {formData.roof.required && (
            <>
              <div className="form-group">
                <label>Roof Type:</label>
                <select
                  value={formData.roof.type}
                  onChange={(e) => handleChange('roof', 'type', e.target.value)}
                  required={formData.roof.required}
                >
                  <option value="">Select Roof Type</option>
                  {getRoofOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="button-group">
          <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
          <button type="submit" className="btn-primary">Generate Quotation</button>
        </div>
      </form>
    </div>
  );
};

export default Requirements;