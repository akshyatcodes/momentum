// src/components/BreakEvenDisplay.jsx
import React from 'react';

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatNumber = (value, digits = 0) => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return value.toLocaleString('en-US', {minimumFractionDigits: digits, maximumFractionDigits: digits});
}

function BreakEvenDisplay({ breakEvenData }) {
  if (!breakEvenData) {
    return <p className="text-gray-600 p-4 text-center">Break-even data not available.</p>;
  }

  const { 
    breakEvenUnits, 
    breakEvenRevenue, 
    averageSellingPricePerUnit, 
    averageVariableCostPerUnit, 
    estimatedMonthlyFixedCosts,
    analysisBasis,
    calculationPossible,
    errorMessage
  } = breakEvenData;

  return (
    <div className="bg-white/60 backdrop-blur-lg border border-white/40 shadow-xl p-6 rounded-xl w-full max-w-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Break-Even Analysis (Monthly)</h2>
      
      {!calculationPossible && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          <span className="font-medium">Cannot calculate break-even:</span> {errorMessage || "Please check your inputs in Revenue, COGS, and OPEX sections."}
        </div>
      )}

      {calculationPossible && (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-sky-50/70 rounded-md">
            <span className="text-gray-700 font-medium">Break-Even Units:</span>
            <span className="text-sky-700 font-bold text-lg">{formatNumber(breakEvenUnits)} units/month</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-emerald-50/70 rounded-md">
            <span className="text-gray-700 font-medium">Break-Even Revenue:</span>
            <span className="text-emerald-700 font-bold text-lg">{formatCurrency(breakEvenRevenue)} /month</span>
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-gray-300/70 pt-4 space-y-2 text-sm">
        <h3 className="text-md font-semibold text-gray-700 mb-2">Calculation Inputs:</h3>
        <div className="flex justify-between">
          <span className="text-gray-600">Avg. Selling Price per Unit:</span>
          <span className="text-gray-800">{formatCurrency(averageSellingPricePerUnit)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Avg. Variable Cost per Unit:</span>
          <span className="text-gray-800">{formatCurrency(averageVariableCostPerUnit)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Contribution Margin per Unit:</span>
          <span className="text-gray-800">{formatCurrency(averageSellingPricePerUnit - averageVariableCostPerUnit)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Estimated Monthly Fixed Costs:</span>
          <span className="text-gray-800">{formatCurrency(estimatedMonthlyFixedCosts)}</span>
        </div>
      </div>
      {analysisBasis && (
        <p className="mt-4 text-xs text-gray-500 italic">{analysisBasis}</p>
      )}
    </div>
  );
}

export default BreakEvenDisplay;