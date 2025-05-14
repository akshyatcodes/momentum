// src/components/CogsForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { industryTemplates } from '../data/industryTemplates';

const MAX_COGS_ITEMS = 10;
const generateId = () => `cogs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const defaultCogsItem = () => ({
  id: generateId(),
  description: "",
  revenueStreamNameMatch: "",
  variableCostType: "FixedAmount",
  variableCostValue: 0,
  otherDirectCostsMonthly: 0,
});

function CogsForm({ initialData, revenueSources, onDataChange, setupData, onClearSectionData }) {
  const [cogsItems, setCogsItems] = useState(() => {
    if (initialData && initialData.length > 0) {
      return initialData.map(item => ({ ...defaultCogsItem(), ...item, id: item.id || generateId() }));
    }
    return [defaultCogsItem()];
  });

  useEffect(() => {
    if (setupData?.setupMode === "Guided" && setupData?.industryType) {
      let templateToApply = null;
      const mainIndustryConfig = industryTemplates[setupData.industryType];

      if (setupData.businessSubType && mainIndustryConfig?.subTypes?.[setupData.businessSubType]) {
        templateToApply = mainIndustryConfig.subTypes[setupData.businessSubType];
      } else if (mainIndustryConfig) {
        templateToApply = mainIndustryConfig;
      }

      if (templateToApply && templateToApply.exampleCogs && templateToApply.exampleCogs.length > 0) {
        const isCurrentDataEffectivelyEmpty = cogsItems.length === 0 ||
                                             (cogsItems.length === 1 && cogsItems[0].description === "" && cogsItems[0].variableCostValue === 0 && cogsItems[0].otherDirectCostsMonthly === 0);

        if (isCurrentDataEffectivelyEmpty) {
          const itemsFromTemplate = templateToApply.exampleCogs.map(cogsEntry => {
            let rawVariableCost = parseFloat(cogsEntry.variableCostPerUnitOrSub);
            if (isNaN(rawVariableCost)) {
                rawVariableCost = parseFloat(cogsEntry.variableCostValue) || 0;
            }

            let finalVariableCostValue = rawVariableCost;
            if (cogsEntry.variableCostType === 'PercentageOfRevenue' && rawVariableCost > 1) {
                finalVariableCostValue = rawVariableCost / 100;
            }
            
            return {
              ...defaultCogsItem(),
              ...cogsEntry, // Spread template values (like variableCostType)
              id: generateId(),
              description: cogsEntry.description || "",
              variableCostValue: finalVariableCostValue,
              otherDirectCostsMonthly: parseFloat(cogsEntry.otherDirectCostsMonthly) || 0,
            };
          }).slice(0, MAX_COGS_ITEMS);
          setCogsItems(itemsFromTemplate);
        }
      } else if (isCurrentDataEffectivelyEmpty && templateToApply) {
        setCogsItems([defaultCogsItem()]);
      }
    }
  // Dependency array: The effect should run if setup parameters change.
  // cogsItems.length is removed as App.jsx's clear logic should be primary for resets.
  }, [setupData?.setupMode, setupData?.industryType, setupData?.businessSubType]);


  const handleInputChange = (id, field, value) => {
    setCogsItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          let processedValue = value;
          if (field === 'variableCostValue' && item.variableCostType === 'PercentageOfRevenue') {
            processedValue = parseFloat(value) / 100;
            if (isNaN(processedValue) || processedValue < 0) processedValue = 0;
          } else if (['variableCostValue', 'otherDirectCostsMonthly'].includes(field)) {
            processedValue = parseFloat(value);
            if (isNaN(processedValue) || processedValue < 0) processedValue = 0;
          }
          return { ...item, [field]: processedValue };
        }
        return item;
      })
    );
  };

  const addCogsItem = () => {
    if (cogsItems.length < MAX_COGS_ITEMS) {
      setCogsItems(prevItems => [...prevItems, defaultCogsItem()]);
    }
  };

  const removeCogsItem = (idToRemove) => {
    if (cogsItems.length > 1) {
      setCogsItems(prevItems => prevItems.filter(item => item.id !== idToRemove));
    } else {
      setCogsItems([defaultCogsItem()]);
    }
  };

  const stableOnDataChange = useCallback(onDataChange, []);
  useEffect(() => {
    stableOnDataChange({ items: cogsItems });
  }, [cogsItems, stableOnDataChange]);

  return (
    <div className="bg-white/50 backdrop-blur-lg border border-white/30 shadow-xl p-6 rounded-xl w-full max-w-3xl">
      <div className="flex justify-between items-center mb-2"> {/* Adjusted margin */}
        <h2 className="text-2xl font-semibold text-gray-800">Cost of Goods Sold (COGS) / Cost of Services</h2>
        {onClearSectionData && (
            <button
                type="button"
                onClick={onClearSectionData}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-1 px-3 rounded-md shadow-sm transition duration-150"
                title="Clear all COGS data for this section"
            >
                Clear COGS Data
            </button>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-6"> {/* Adjusted margin */}
        Define costs directly tied to producing your goods or delivering your services.
        These typically vary with your sales volume.
      </p>

      {cogsItems.map((item, index) => (
        <div key={item.id} className="mb-8 p-4 border border-gray-300/50 rounded-lg shadow-sm bg-white/20 relative">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Direct Cost Item #{index + 1}</h3>
          <button
            type="button"
            onClick={() => removeCogsItem(item.id)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-semibold text-xl px-2 rounded-full hover:bg-red-100/50"
            title="Remove this item"
          >
            ×
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`cogsDesc-${item.id}`} className="block text-sm font-medium text-gray-600 mb-1">Cost Description</label>
              <input type="text" id={`cogsDesc-${item.id}`} value={item.description}
                onChange={(e) => handleInputChange(item.id, 'description', e.target.value)}
                placeholder="e.g., Raw Materials for Product X"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70 placeholder-gray-500"
              />
              {item.revenueStreamNameMatch && setupData?.setupMode === 'Guided' && (
                <p className="text-xs text-gray-500 mt-1">(Template: Related to "{item.revenueStreamNameMatch}")</p>
              )}
            </div>
            <div>
              <label htmlFor={`varCostType-${item.id}`} className="block text-sm font-medium text-gray-600 mb-1">Variable Cost Basis</label>
              <select id={`varCostType-${item.id}`} value={item.variableCostType}
                onChange={(e) => handleInputChange(item.id, 'variableCostType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
              >
                <option value="FixedAmount">Fixed Amount (per unit/customer of related revenue)</option>
                <option value="PercentageOfRevenue">Percentage of Related Revenue</option>
              </select>
            </div>
            <div>
              <label htmlFor={`varCostVal-${item.id}`} className="block text-sm font-medium text-gray-600 mb-1">
                {item.variableCostType === "FixedAmount" ? "Variable Cost per Unit/Customer ($)" : "Variable Cost (% of Revenue)"}
              </label>
              <input type="number" id={`varCostVal-${item.id}`}
                value={item.variableCostType === "PercentageOfRevenue" ? item.variableCostValue * 100 : item.variableCostValue}
                onChange={(e) => handleInputChange(item.id, 'variableCostValue', e.target.value)}
                min="0" step="any" className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
              />
            </div>
            <div>
              <label htmlFor={`otherDirect-${item.id}`} className="block text-sm font-medium text-gray-600 mb-1">Other Fixed Direct Costs per Month ($)</label>
              <input type="number" id={`otherDirect-${item.id}`} value={item.otherDirectCostsMonthly}
                onChange={(e) => handleInputChange(item.id, 'otherDirectCostsMonthly', e.target.value)}
                min="0" step="any" className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
                placeholder="e.g., Specific software license"
              />
            </div>
          </div>
        </div>
      ))}

      {cogsItems.length < MAX_COGS_ITEMS && (
        <button type="button" onClick={addCogsItem}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
        >
          + Add Another Direct Cost Item
        </button>
      )}
    </div>
  );
}

export default CogsForm;