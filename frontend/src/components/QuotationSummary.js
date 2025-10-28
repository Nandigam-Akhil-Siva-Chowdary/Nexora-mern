import React, { useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const QuotationSummary = ({ formData, prevStep, updateData }) => {
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClientInfoChange = (e) => {
    setClientInfo({
      ...clientInfo,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!clientInfo.name?.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!clientInfo.email?.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!clientInfo.phone?.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (!clientInfo.address?.trim()) {
      setError('Please enter your address');
      return false;
    }
    
    // Check if requirements are properly set
    if (!formData.requirements?.base?.type || !formData.requirements?.flooring?.type) {
      setError('Construction requirements are incomplete. Please go back and select base and flooring types.');
      return false;
    }

    setError('');
    return true;
  };

  const generateQuotation = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Prepare the data exactly as the backend expects
      const completeFormData = {
        clientInfo: {
          name: clientInfo.name.trim(),
          email: clientInfo.email.trim(),
          phone: clientInfo.phone.trim(),
          address: clientInfo.address.trim()
        },
        projectInfo: {
          sport: formData.projectInfo?.sport || '',
          gameType: formData.projectInfo?.courtType || formData.projectInfo?.gameType || '',
          courtSize: formData.projectInfo?.courtSize || ''
        },
        requirements: {
          base: {
            type: formData.requirements?.base?.type || ''
          },
          flooring: {
            type: formData.requirements?.flooring?.type || ''
          },
          equipment: formData.requirements?.equipment || [],
          lighting: formData.requirements?.lighting || { required: false },
          roof: formData.requirements?.roof || { required: false },
          additionalFeatures: formData.requirements?.additionalFeatures || []
        }
      };

      console.log('Sending quotation data:', completeFormData);

      const response = await axios.post('https://nexora-mern-backend1.onrender.com/api/quotations', completeFormData);
      const newQuotation = response.data;
      setQuotation(newQuotation);
      updateData('clientInfo', clientInfo);
      
      // Automatically download PDF after successful quotation generation
      setTimeout(() => {
        downloadPDF(newQuotation);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating quotation:', error);
      const errorMessage = error.response?.data?.message || 'Error generating quotation. Please check your inputs and try again.';
      const detailedError = error.response?.data?.details ? 
        `${errorMessage} Details: ${JSON.stringify(error.response.data.details)}` : errorMessage;
      
      setError(detailedError);
      alert(detailedError);
    }
    setLoading(false);
  };

  const downloadPDF = (quotationData = quotation) => {
    if (!quotationData) {
      alert('No quotation data available to download');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Set margins and initial position
      const margin = 20;
      let yPosition = margin;
      
      // Add company header with background
      doc.setFillColor(44, 62, 80);
      doc.rect(0, 0, 210, 50, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('NEXORA GROUP', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Sports Infrastructure Solutions', 105, 30, { align: 'center' });
      
      // Quotation title and number
      yPosition = 70;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('CONSTRUCTION QUOTATION', 105, yPosition, { align: 'center' });
      
      yPosition += 15;
      doc.setFontSize(14);
      doc.text(`Quotation #: ${quotationData.quotationNumber}`, margin, yPosition);
      
      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${new Date(quotationData.createdAt).toLocaleDateString('en-IN')}`, margin, yPosition);
      
      // Client information section
      yPosition += 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CLIENT INFORMATION', margin, yPosition);
      
      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${quotationData.clientInfo?.name || 'N/A'}`, margin, yPosition);
      
      yPosition += 6;
      doc.text(`Email: ${quotationData.clientInfo?.email || 'N/A'}`, margin, yPosition);
      
      yPosition += 6;
      doc.text(`Phone: ${quotationData.clientInfo?.phone || 'N/A'}`, margin, yPosition);
      
      yPosition += 6;
      const addressLines = doc.splitTextToSize(`Address: ${quotationData.clientInfo?.address || 'N/A'}`, 170);
      doc.text(addressLines, margin, yPosition);
      yPosition += (addressLines.length * 6);
      
      // Project details section - FIXED: Added safe access with optional chaining
// In the downloadPDF function, find the project details section and replace it with:
// Project details section
yPosition += 10;
doc.setFontSize(12);
doc.setFont('helvetica', 'bold');
doc.text('PROJECT DETAILS', margin, yPosition);

yPosition += 8;
doc.setFontSize(10);
doc.setFont('helvetica', 'normal');

// Safe access to projectInfo properties
const sport = quotationData.projectInfo?.sport || 'N/A';
const courtType = quotationData.projectInfo?.courtType || quotationData.projectInfo?.gameType || 'N/A';
const courtSize = quotationData.projectInfo?.courtSize || 'N/A';
const courtArea = quotationData.requirements?.base?.area || 'N/A';

doc.text(`Sport: ${String(sport).replace(/-/g, ' ').toUpperCase()}`, margin, yPosition);
yPosition += 6;
doc.text(`Facility Type: ${String(courtType).toUpperCase()}`, margin, yPosition);
yPosition += 6;
doc.text(`Court Size: ${String(courtSize).toUpperCase()}`, margin, yPosition);
yPosition += 6;
doc.text(`Court Area: ${courtArea} sq. meters`, margin, yPosition);

// Show custom dimensions if available - FIXED THIS SECTION
if (quotationData.projectInfo?.customDimensions && 
    quotationData.projectInfo.customDimensions.length && 
    quotationData.projectInfo.customDimensions.width) {
  
  console.log('Showing custom dimensions in PDF:', quotationData.projectInfo.customDimensions);
  
  yPosition += 6;
  doc.text(`Custom Length: ${quotationData.projectInfo.customDimensions.length} meters`, margin, yPosition);
  
  yPosition += 6;
  doc.text(`Custom Width: ${quotationData.projectInfo.customDimensions.width} meters`, margin, yPosition);
  
  // Show calculated area for verification
  yPosition += 6;
  const calculatedArea = parseFloat(quotationData.projectInfo.customDimensions.length) * 
                        parseFloat(quotationData.projectInfo.customDimensions.width);
  doc.text(`Calculated Area: ${calculatedArea.toFixed(2)} sq. meters`, margin, yPosition);
}
      
      // Cost breakdown section
      yPosition += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('COST BREAKDOWN', margin, yPosition);
      
      yPosition += 10;
      
      // Create cost table with safe access
      const costs = [
        ['Item', 'Amount (₹)'],
        ['Base Construction', (quotationData.pricing?.baseCost || 0).toLocaleString('en-IN')],
        ['Flooring', (quotationData.pricing?.flooringCost || 0).toLocaleString('en-IN')],
        ['Equipment', (quotationData.pricing?.equipmentCost || 0).toLocaleString('en-IN')],
      ];

      // Add optional costs if they exist
      if (quotationData.pricing?.lightingCost > 0) {
        costs.push(['Lighting System', (quotationData.pricing.lightingCost || 0).toLocaleString('en-IN')]);
      }
      
      if (quotationData.pricing?.roofCost > 0) {
        costs.push(['Roof/Cover', (quotationData.pricing.roofCost || 0).toLocaleString('en-IN')]);
      }
      
      if (quotationData.pricing?.additionalCost > 0) {
        costs.push(['Additional Features', (quotationData.pricing.additionalCost || 0).toLocaleString('en-IN')]);
      }
      
      const totalCost = quotationData.pricing?.totalCost || 0;
      costs.push(['TOTAL', totalCost.toLocaleString('en-IN')]);
      
      // Draw table
      costs.forEach(([item, amount], index) => {
        const isHeader = index === 0;
        const isTotal = index === costs.length - 1;
        
        if (isHeader) {
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, yPosition, 170, 8, 'F');
          doc.setFont('helvetica', 'bold');
        } else if (isTotal) {
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, yPosition, 170, 8, 'F');
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        
        doc.text(item, margin + 2, yPosition + 6);
        doc.text(amount, margin + 150, yPosition + 6, { align: 'right' });
        
        yPosition += 8;
      });
      
      // Terms and conditions
      yPosition += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('TERMS & CONDITIONS:', margin, yPosition);
      
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      const terms = [
        '• This quotation is valid for 30 days from the date of issue',
        '• Prices are subject to change without prior notice',
        '• 50% advance payment required to commence work',
        '• All materials carry manufacturer warranty',
        '• Workmanship guaranteed for 1 year'
      ];
      
      terms.forEach(term => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(term, margin + 5, yPosition);
        yPosition += 5;
      });
      
      // Company footer
      doc.setFillColor(44, 62, 80);
      doc.rect(0, 270, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('NEXORA GROUP - Sports Infrastructure Solutions', 105, 277, { align: 'center' });
      doc.text('Jalahalli West, Bangalore-560015', 105, 283, { align: 'center' });
      doc.text('📞 +91 8431322728 | 📧 info.nexoragroup@gmail.com', 105, 289, { align: 'center' });
      
      // Save the PDF
      doc.save(`Nexora_Quotation_${quotationData.quotationNumber}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // For debugging - show current form data
  if (process.env.NODE_ENV === 'development') {
    console.log('Current formData:', formData);
    console.log('Current clientInfo:', clientInfo);
  }

  if (quotation) {
    return (
      <div className="quotation-container">
        <div className="company-letterhead">
          <h1>NEXORA GROUP</h1>
          <p>Sports Infrastructure Solutions</p>
        </div>
        
        <div className="success-message">
          <h2>✅ Quotation Generated Successfully!</h2>
          <p>Your quotation has been generated and downloaded as PDF.</p>
          <p>If the download didn't start automatically, click the button below.</p>
        </div>
        
        <div className="quotation-details">
          <div className="quotation-header">
            <h3>QUOTATION #{quotation.quotationNumber}</h3>
            <p>Date: {new Date(quotation.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="section">
            <h4>Client Information</h4>
            <div className="info-grid">
              <div><strong>Name:</strong> {quotation.clientInfo?.name || 'N/A'}</div>
              <div><strong>Email:</strong> {quotation.clientInfo?.email || 'N/A'}</div>
              <div><strong>Phone:</strong> {quotation.clientInfo?.phone || 'N/A'}</div>
              <div><strong>Address:</strong> {quotation.clientInfo?.address || 'N/A'}</div>
            </div>
          </div>

          // In the project details section, add custom dimensions display:
// In the QuotationSummary component, find the project details section and update it:
<div className="section">
  <h4>Project Details</h4>
  <div className="info-grid">
    <div><strong>Sport:</strong> {String(quotation.projectInfo?.sport || 'N/A').replace(/-/g, ' ').toUpperCase()}</div>
    <div><strong>Facility Type:</strong> {String(quotation.projectInfo?.courtType || quotation.projectInfo?.gameType || 'N/A').toUpperCase()}</div>
    <div><strong>Court Size:</strong> {String(quotation.projectInfo?.courtSize || 'N/A').toUpperCase()}</div>
    <div><strong>Court Area:</strong> {quotation.requirements?.base?.area || 'N/A'} sq. meters</div>
    
    {/* Show custom dimensions and calculation if available */}
    {quotation.projectInfo?.customDimensions && 
     quotation.projectInfo.customDimensions.length && 
     quotation.projectInfo.customDimensions.width && (
      <>
        <div><strong>Custom Length:</strong> {quotation.projectInfo.customDimensions.length} meters</div>
        <div><strong>Custom Width:</strong> {quotation.projectInfo.customDimensions.width} meters</div>
        <div><strong>Calculated Area:</strong> 
          {(parseFloat(quotation.projectInfo.customDimensions.length) * 
            parseFloat(quotation.projectInfo.customDimensions.width)).toFixed(2)} sq. meters
        </div>
      </>
    )}
  </div>
</div>
          <div className="section">
            <h4>Cost Breakdown</h4>
            <table className="cost-table">
              <tbody>
                <tr>
                  <td>Base Construction</td>
                  <td>{formatCurrency(quotation.pricing?.baseCost)}</td>
                </tr>
                <tr>
                  <td>Flooring</td>
                  <td>{formatCurrency(quotation.pricing?.flooringCost)}</td>
                </tr>
                <tr>
                  <td>Equipment</td>
                  <td>{formatCurrency(quotation.pricing?.equipmentCost)}</td>
                </tr>
                {(quotation.pricing?.lightingCost || 0) > 0 && (
                  <tr>
                    <td>Lighting System</td>
                    <td>{formatCurrency(quotation.pricing?.lightingCost)}</td>
                  </tr>
                )}
                {(quotation.pricing?.roofCost || 0) > 0 && (
                  <tr>
                    <td>Roof/Cover</td>
                    <td>{formatCurrency(quotation.pricing?.roofCost)}</td>
                  </tr>
                )}
                {(quotation.pricing?.additionalCost || 0) > 0 && (
                  <tr>
                    <td>Additional Features</td>
                    <td>{formatCurrency(quotation.pricing?.additionalCost)}</td>
                  </tr>
                )}
                <tr className="total-row">
                  <td><strong>Total Cost</strong></td>
                  <td><strong>{formatCurrency(quotation.pricing?.totalCost)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="section">
            <h4>Validity & Terms</h4>
            <p>This quotation is valid for 30 days from the date of issue.</p>
            <p>All materials and workmanship are guaranteed as per NEXORA GROUP standards.</p>
          </div>

          <div className="button-group">
            <button onClick={() => downloadPDF()} className="btn-primary">Download PDF Again</button>
            <button onClick={() => window.print()} className="btn-secondary">Print</button>
            <button onClick={() => window.location.reload()} className="btn-secondary">Create New Quotation</button>
          </div>
        </div>

        <div className="company-footer">
          <h3>NEXORA GROUP</h3>
          <p>123 Sports Complex Road, Mumbai, Maharashtra - 400001</p>
          <p>+91 98765 43210 | info@nexoragroup.com | www.nexoragroup.com</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>Client Information & Quotation Summary</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="section">
        <h3>Client Details</h3>
        <form>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              name="name"
              value={clientInfo.name}
              onChange={handleClientInfoChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={clientInfo.email}
              onChange={handleClientInfoChange}
              required
              placeholder="Enter your email address"
            />
          </div>
          <div className="form-group">
            <label>Phone:</label>
            <input
              type="tel"
              name="phone"
              value={clientInfo.phone}
              onChange={handleClientInfoChange}
              required
              placeholder="Enter your phone number"
            />
          </div>
          <div className="form-group">
            <label>Address:</label>
            <textarea
              name="address"
              value={clientInfo.address}
              onChange={handleClientInfoChange}
              required
              placeholder="Enter your complete address"
              rows="3"
            />
          </div>
        </form>
      </div>

      <div className="section">
        <h3>Project Summary</h3>
        <div className="summary-details">
          {/* FIXED: Safe access with optional chaining */}
          <p><strong>Sport:</strong> {String(formData.projectInfo?.sport || 'Not selected').replace(/-/g, ' ').toUpperCase()}</p>
          <p><strong>Facility Type:</strong> {String(formData.projectInfo?.courtType || formData.projectInfo?.gameType || 'Not selected').toUpperCase()}</p>
          <p><strong>Court Size:</strong> {String(formData.projectInfo?.courtSize || 'Not selected').toUpperCase()}</p>
          <p><strong>Base Type:</strong> {formData.requirements?.base?.type || 'Not selected'}</p>
          <p><strong>Flooring Type:</strong> {formData.requirements?.flooring?.type || 'Not selected'}</p>
        </div>
      </div>

      <div className="button-group">
        <button type="button" onClick={prevStep} className="btn-secondary">Back</button>
        <button 
          type="button" 
          onClick={generateQuotation} 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Generating Quotation...' : 'Generate & Download Quotation'}
        </button>
      </div>
    </div>
  );
};

export default QuotationSummary;