// src/components/PnlTable.jsx
import React, { useState } from 'react';

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const PnlRow = ({ label, values, isBold = false, isSubNegative = false, isNegativeGood = false }) => (
  <tr>
    <td className={`py-2 px-3 text-sm text-left ${isBold ? 'font-semibold text-gray-700' : 'text-gray-600'}`}>{label}</td>
    {values.map((val, index) => (
      <td 
        key={index} 
        className={`py-2 px-3 text-sm text-right ${isBold ? 'font-semibold text-gray-700' : 'text-gray-600'}
                    ${(isSubNegative && val > 0) || (!isSubNegative && !isNegativeGood && val < 0) ? 'text-red-600' : 
                      (!isSubNegative && isNegativeGood && val < 0) ? 'text-green-600' :
                      (!isSubNegative && !isNegativeGood && val > 0 && !isBold) ? 'text-gray-700' : '' }`} // Added more specific positive styling for non-bold
      >
        {isSubNegative ? `(${formatCurrency(Math.abs(val))})` : formatCurrency(val)}
      </td>
    ))}
  </tr>
);

function PnlTable({ monthlyData, annualData }) {
  const [viewMode, setViewMode] = useState('annual'); // 'annual' or 'monthly'
  const [selectedYear, setSelectedYear] = useState(1); // For monthly view, default to year 1

  if (!monthlyData || !annualData || monthlyData.length === 0 || annualData.length === 0) {
    return <p className="text-gray-600 p-4 text-center">P&L data not available or calculations pending.</p>;
  }

  const numYears = annualData.length;
  const years = Array.from({ length: numYears }, (_, i) => i + 1);

  const dataToDisplay = viewMode === 'annual' 
    ? annualData 
    : monthlyData.filter(m => m.year === selectedYear);

  const headers = viewMode === 'annual' 
    ? ["Metric", ...years.map(y => `Year ${y}`)]
    : ["Metric", ...Array.from({length: 12}, (_, i) => new Date(0, i).toLocaleString('default', { month: 'short' }))];

  const pnlItems = [
    { label: "Total Revenue", key: "totalRevenue", isBold: true },
    { label: "Cost of Goods Sold (COGS)", key: "totalCogs", isSubNegative: true },
    { label: "Gross Profit", key: "grossProfit", isBold: true },
    { label: "Total Operating Expenses (OPEX)", key: "totalOpex", isSubNegative: true },
    { label: "Operating Profit (EBITDA)", key: "operatingProfit", isBold: true }, // EBITDA-like
    { label: "Interest Expense", key: "interestExpense", isSubNegative: true },
    { label: "Earnings Before Tax (EBT)", key: "earningsBeforeTax", isBold: true },
    { label: "Tax Amount", key: "taxAmount", isSubNegative: true },
    { label: "Net Profit", key: "netProfit", isBold: true, isNegativeGood: false }, // Negative Net Profit is bad
  ];

  return (
    <div className="bg-white/60 backdrop-blur-lg border border-white/40 shadow-xl p-4 sm:p-6 rounded-xl w-full max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">Profit & Loss Statement</h2>
        <div className="flex space-x-2 items-center">
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            className="p-2 border border-gray-300 rounded-md shadow-sm bg-white/80 text-sm"
          >
            <option value="annual">Annual View</option>
            <option value="monthly">Monthly View</option>
          </select>
          {viewMode === 'monthly' && (
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="p-2 border border-gray-300 rounded-md shadow-sm bg-white/80 text-sm"
            >
              {years.map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 bg-white/80">
          <thead className="bg-gray-50/80">
            <tr>
              {headers.map(header => (
                <th key={header} scope="col" className="py-3 px-3 text-xs font-medium uppercase tracking-wider 
                                                       text-left text-gray-500 first:sticky first:left-0 first:z-10 first:bg-gray-50/90">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pnlItems.map(item => (
              <PnlRow 
                key={item.key}
                label={item.label}
                values={dataToDisplay.map(d => d[item.key])}
                isBold={item.isBold}
                isSubNegative={item.isSubNegative}
                isNegativeGood={item.isNegativeGood}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PnlTable;