// src/components/AssumptionsList.jsx
import React from 'react';

function AssumptionsList({ assumptionsData }) {
  if (!assumptionsData || assumptionsData.length === 0) {
    return <p className="text-gray-600 p-4 text-center">Assumptions data not available or no key assumptions entered.</p>;
  }

  return (
    <div className="bg-white/60 backdrop-blur-lg border border-white/40 shadow-xl p-6 rounded-xl w-full max-w-2xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Key Assumptions Summary</h2>
      
      <div className="space-y-6">
        {assumptionsData.map((group, groupIndex) => (
          <div key={groupIndex} className="p-4 border border-gray-300/50 rounded-lg shadow-sm bg-white/20">
            <h3 className="text-lg font-medium text-gray-700 mb-3 border-b border-gray-300/60 pb-2">
              {group.category}
            </h3>
            <ul className="space-y-1 text-sm">
              {group.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex justify-between">
                  <span className="text-gray-600 w-2/5 pr-2">{item.label}:</span>
                  <span className="text-gray-800 font-medium w-3/5 text-right">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssumptionsList;