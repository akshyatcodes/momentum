// src/components/FinancingForm.jsx
import React, { useState, useEffect, useCallback } from 'react';

const defaultFinancingData = () => ({
  ownersInvestment: 0,
  loan: { // Only one loan for MVP
    amount: 0,
    annualInterestRate: 0, // Store as decimal, e.g., 0.08 for 8%
    termYears: 0,
  },
  // For future: equityRounds: [], grants: []
});

function FinancingForm({ initialData, onDataChange, onClearSectionData }) {
  const [financingData, setFinancingData] = useState(() => {
    const fullInitial = defaultFinancingData();
    if (initialData) {
      fullInitial.ownersInvestment = parseFloat(initialData.ownersInvestment) || 0;
      if (initialData.loan) { // Check if loan object exists
        fullInitial.loan.amount = parseFloat(initialData.loan.amount) || 0;
        fullInitial.loan.annualInterestRate = parseFloat(initialData.loan.annualInterestRate) || 0;
        fullInitial.loan.termYears = parseInt(initialData.loan.termYears, 10) || 0;
      } else if (initialData.loans && initialData.loans.length > 0) {
        // Compatibility for older data structure if it had 'loans' array
        fullInitial.loan.amount = parseFloat(initialData.loans[0].amount) || 0;
        fullInitial.loan.annualInterestRate = parseFloat(initialData.loans[0].annualInterestRate) || 0;
        fullInitial.loan.termYears = parseInt(initialData.loans[0].termYears, 10) || 0;
      }
    }
    return fullInitial;
  });

  const handleInputChange = (field, value, subField = null) => {
    setFinancingData(prevData => {
      const newData = { ...prevData };
      let processedValue = value;

      if (subField) { // Handling loan details
        if (field === 'loan') {
          const newLoanData = { ...newData.loan };
          if (subField === 'annualInterestRate') {
            processedValue = parseFloat(value) / 100; // Convert percentage to decimal
          } else if (subField === 'amount' || subField === 'termYears') {
            processedValue = parseFloat(value);
          }
          newLoanData[subField] = isNaN(processedValue) || processedValue < 0 ? 0 : processedValue;
          newData.loan = newLoanData;
        }
      } else { // Handling direct fields like ownersInvestment
        processedValue = parseFloat(value);
        newData[field] = isNaN(processedValue) || processedValue < 0 ? 0 : processedValue;
      }
      return newData;
    });
  };
  
  const stableOnDataChange = useCallback(onDataChange, []);
  useEffect(() => {
    stableOnDataChange(financingData);
  }, [financingData, stableOnDataChange]);

  return (
    <div className="bg-white/50 backdrop-blur-lg border border-white/30 shadow-xl p-6 rounded-xl w-full max-w-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Financing</h2>
      {/* NEW: Clear Section Data Button */}
      {onClearSectionData && ( // Only render if the prop is provided
            <button
                type="button"
                onClick={onClearSectionData}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-1 px-3 rounded-md shadow-sm transition duration-150"
                title="Clear all Loan data for this section"
            >
                Clear Funding Data
            </button>
        )}
      <p className="text-sm text-gray-600 mb-4">
        Detail your initial funding sources.
      </p>

      <div className="space-y-6">
        {/* Owner's Investment */}
        <div>
          <label htmlFor="ownersInvestment" className="block text-sm font-medium text-gray-700 mb-1">
            Initial Owner's Investment / Cash Injection ($)
          </label>
          <input
            type="number"
            id="ownersInvestment"
            value={financingData.ownersInvestment}
            onChange={(e) => handleInputChange('ownersInvestment', e.target.value)}
            min="0"
            step="any"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70 placeholder-gray-500"
            placeholder="e.g., 50000"
          />
        </div>

        {/* Loan Details */}
        <div className="p-4 border border-gray-300/50 rounded-lg shadow-sm bg-white/20">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Loan Details (One Loan for MVP)</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount ($)
              </label>
              <input
                type="number"
                id="loanAmount"
                value={financingData.loan.amount}
                onChange={(e) => handleInputChange('loan', e.target.value, 'amount')}
                min="0"
                step="any"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
                placeholder="e.g., 100000"
              />
            </div>
            <div>
              <label htmlFor="loanInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
                Annual Interest Rate (%)
              </label>
              <input
                type="number"
                id="loanInterestRate"
                value={financingData.loan.annualInterestRate * 100} // Display as percentage
                onChange={(e) => handleInputChange('loan', e.target.value, 'annualInterestRate')}
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
                placeholder="e.g., 8 for 8%"
              />
            </div>
            <div>
              <label htmlFor="loanTermYears" className="block text-sm font-medium text-gray-700 mb-1">
                Loan Term (Years)
              </label>
              <input
                type="number"
                id="loanTermYears"
                value={financingData.loan.termYears}
                onChange={(e) => handleInputChange('loan', e.target.value, 'termYears')}
                min="0"
                step="1"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
                placeholder="e.g., 5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancingForm;