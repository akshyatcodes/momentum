// src/components/CashFlowTable.jsx
import React, { useState } from 'react';

const formatCurrency = (value, noParenthesesForNegative = false) => {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  const absValue = Math.abs(value);
  const formatted = absValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  
  if (value < 0 && !noParenthesesForNegative) {
    return `(${formatted})`;
  }
  return value < 0 ? `-${formatted}` : formatted; // For net cash flow or balances that can be plain negative
};

const CashFlowRow = ({ label, values, isBold = false, isSubSection = false, isNegativeGood = false, noParentheses = false }) => (
  <tr>
    <td className={`py-2 px-3 text-sm text-left ${isBold ? 'font-semibold text-gray-700' : 'text-gray-600'} ${isSubSection ? 'pl-6' : ''}`}>{label}</td>
    {values.map((val, index) => (
      <td 
        key={index} 
        className={`py-2 px-3 text-sm text-right ${isBold ? 'font-semibold text-gray-700' : 'text-gray-600'}
                    ${(val < 0 && !isNegativeGood) ? 'text-red-600' : (val < 0 && isNegativeGood) ? 'text-green-600' : ''}`}
      >
        {formatCurrency(val, noParentheses)}
      </td>
    ))}
  </tr>
);

function CashFlowTable({ monthlyData, annualData }) {
  const [viewMode, setViewMode] = useState('annual'); // 'annual' or 'monthly'
  const [selectedYear, setSelectedYear] = useState(1);

  if (!monthlyData || !annualData || monthlyData.length === 0 || annualData.length === 0) {
    return <p className="text-gray-600 p-4 text-center">Cash Flow data not available or calculations pending.</p>;
  }

  const numYears = annualData.length;
  const years = Array.from({ length: numYears }, (_, i) => i + 1);

  const dataToDisplay = viewMode === 'annual' 
    ? annualData 
    : monthlyData.filter(m => m.year === selectedYear);

  const headers = viewMode === 'annual' 
    ? ["Metric", ...years.map(y => `Year ${y}`)]
    : ["Metric", ...Array.from({length: 12}, (_, i) => new Date(0, i).toLocaleString('default', { month: 'short' }))];

  // Define cash flow items, keys must match those in `monthlyCashFlow` objects
  const cashFlowItems = [
    { label: "Starting Cash Balance", key: "startingCashBalance", isBold: false, noParentheses: true },
    { label: "Cash Inflows", key: null, isBold: true }, // Header Row
    { label: "Revenue", key: "cashIn_Revenue", isSubSection: true },
    { label: "Owner's Investment", key: "cashIn_OwnersInvestment", isSubSection: true },
    { label: "Loan Received", key: "cashIn_LoanReceived", isSubSection: true },
    { label: "Total Cash In", key: "totalCashIn", isBold: true },
    { label: "Cash Outflows", key: null, isBold: true }, // Header Row
    { label: "Cost of Goods Sold (COGS)", key: "cashOut_Cogs", isSubSection: true },
    { label: "Operating Expenses (OPEX)", key: "cashOut_Opex", isSubSection: true },
    { label: "Loan Principal Repayment", key: "cashOut_LoanPrincipal", isSubSection: true },
    { label: "Loan Interest Repayment", key: "cashOut_LoanInterest", isSubSection: true },
    { label: "Taxes Paid", key: "cashOut_Taxes", isSubSection: true },
    { label: "Total Cash Out", key: "totalCashOut", isBold: true },
    { label: "Net Cash Flow", key: "netCashFlow", isBold: true, noParentheses: true }, // Net can be negative
    { label: "Ending Cash Balance", key: "endingCashBalance", isBold: true, noParentheses: true }, // Ending can be negative
  ];

  return (
    <div className="bg-white/60 backdrop-blur-lg border border-white/40 shadow-xl p-4 sm:p-6 rounded-xl w-full max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">Cash Flow Statement</h2>
        <div className="flex space-x-2 items-center">
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="p-2 border border-gray-300 rounded-md shadow-sm bg-white/80 text-sm">
            <option value="annual">Annual View</option>
            <option value="monthly">Monthly View</option>
          </select>
          {viewMode === 'monthly' && (
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="p-2 border border-gray-300 rounded-md shadow-sm bg-white/80 text-sm">
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
                <th key={header} scope="col" className="py-3 px-3 text-xs font-medium uppercase tracking-wider text-left text-gray-500 first:sticky first:left-0 first:z-10 first:bg-gray-50/90">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cashFlowItems.map(item => (
              item.key === null ? // Render as a section header
              <tr key={item.label}><td colSpan={headers.length} className="py-2 px-3 text-sm font-semibold text-gray-700 bg-gray-50/50">{item.label}</td></tr>
              :
              <CashFlowRow 
                key={item.key}
                label={item.label}
                values={dataToDisplay.map(d => d[item.key])}
                isBold={item.isBold}
                isSubSection={item.isSubSection}
                isNegativeGood={item.isNegativeGood} // e.g. for net cash flow if positive is good
                noParentheses={item.noParentheses}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CashFlowTable;