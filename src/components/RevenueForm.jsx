// src/components/RevenueForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { industryTemplates } from '../data/industryTemplates';

const MAX_REVENUE_SOURCES = 5;
const generateId = () => `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const defaultRevenueSource = () => ({
  id: generateId(),
  name: "",
  pricingStrategy: "UnitPrice",
  price: 0,
  initialVolume: 0,
  monthlyGrowthRate: 0,
  applyQ4Uplift: false,
  q4UpliftPercentage: 0,
});

function RevenueForm({ initialData, onDataChange, setupData,onClearSectionData }) {
  const [revenueSources, setRevenueSources] = useState(() => {
    if (initialData && initialData.length > 0) {
      // Ensure existing data has IDs, important if loading from older format
      return initialData.map(s => ({ ...defaultRevenueSource(), ...s, id: s.id || generateId() }));
    }
    return [defaultRevenueSource()];
  });

  // Effect for Guided Setup pre-fill
  useEffect(() => {
    if (setupData?.setupMode === "Guided" && setupData?.industryType) {
      let templateToApply = null;
      const mainIndustryConfig = industryTemplates[setupData.industryType];

      // 1. Try to find a specific sub-type template
      if (setupData.businessSubType && mainIndustryConfig?.subTypes?.[setupData.businessSubType]) {
        templateToApply = mainIndustryConfig.subTypes[setupData.businessSubType];
      }
      // 2. If no sub-type template, fall back to main industry template
      else if (mainIndustryConfig) {
        templateToApply = mainIndustryConfig;
      }

      if (templateToApply && templateToApply.exampleRevenueStreams && templateToApply.exampleRevenueStreams.length > 0) {
        // Only pre-fill if current revenueSources is empty or just the default placeholder
        // This check is important if App.jsx already reset revenue.sources to []
        const isCurrentDataEffectivelyEmpty = revenueSources.length === 0 ||
                                             (revenueSources.length === 1 && revenueSources[0].name === "" && revenueSources[0].price === 0);

        if (isCurrentDataEffectivelyEmpty) {
          const sourcesFromTemplate = templateToApply.exampleRevenueStreams.map(stream => ({
            ...defaultRevenueSource(), // Get default structure
            ...stream,                // Override with template data
            id: generateId(),         // Ensure unique ID from template
            monthlyGrowthRate: parseFloat(stream.monthlyGrowthRate) || 0,
            q4UpliftPercentage: parseFloat(stream.q4UpliftPercentage) || 0,
          })).slice(0, MAX_REVENUE_SOURCES);
          setRevenueSources(sourcesFromTemplate);
        }
      }
    }
  // We want this effect to re-run if key setup parameters change.
  // initialData is not in dependency array because we handle its loading in useState initializer
  // and we don't want user edits to trigger a re-application of the template.
  // The reset of revenueSources in App.jsx handles making space for template application.
  }, [setupData?.setupMode, setupData?.industryType, setupData?.businessSubType]);


  const handleInputChange = (id, field, value) => {
    setRevenueSources(prevSources =>
      prevSources.map(source => {
        if (source.id === id) {
          let processedValue = value;
          if (field === 'monthlyGrowthRate' || field === 'q4UpliftPercentage') {
            processedValue = parseFloat(value) / 100;
            if (isNaN(processedValue) || processedValue < 0) processedValue = 0;
          } else if (['price', 'initialVolume'].includes(field)) {
            processedValue = parseFloat(value);
            if (isNaN(processedValue) || processedValue < 0) processedValue = 0;
          }
          return { ...source, [field]: processedValue };
        }
        return source;
      })
    );
  };

  const handleToggleChange = (id, field) => {
    setRevenueSources(prevSources =>
      prevSources.map(source =>
        source.id === id ? { ...source, [field]: !source[field] } : source
      )
    );
  };

  const addRevenueSource = () => {
    if (revenueSources.length < MAX_REVENUE_SOURCES) {
      setRevenueSources(prevSources => [...prevSources, defaultRevenueSource()]);
    }
  };

  const removeRevenueSource = (idToRemove) => {
    if (revenueSources.length > 1) {
      setRevenueSources(prevSources => prevSources.filter(source => source.id !== idToRemove));
    } else {
        setRevenueSources([defaultRevenueSource()]); // Reset to one blank if last one is removed
    //   alert("You must have at least one revenue source.");
    }
  };

  // useCallback for onDataChange to stabilize its reference if passed in useEffect deps
  const stableOnDataChange = useCallback(onDataChange, []);

  useEffect(() => {
    stableOnDataChange({ sources: revenueSources });
  }, [revenueSources, stableOnDataChange]);


  return (
    <div className="bg-white/50 backdrop-blur-lg border border-white/30 shadow-xl p-6 rounded-xl w-full max-w-3xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Revenue Forecast</h2>
      {/* NEW: Clear Section Data Button */}
      {onClearSectionData && ( // Only render if the prop is provided
            <button
                type="button"
                onClick={onClearSectionData}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-1 px-3 rounded-md shadow-sm transition duration-150"
                title="Clear all revenue data for this section"
            >
                Clear Revenue Data
            </button>
      )}
      {revenueSources.map((source, index) => (
        <div key={source.id} className="mb-8 p-4 border border-gray-300/50 rounded-lg shadow-sm bg-white/20 relative">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Income Source #{index + 1}</h3>
          {revenueSources.length >= 1 && ( // Allow removing even the last one to get a blank one
              <button
                type="button"
                onClick={() => removeRevenueSource(source.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-semibold text-xl px-2 rounded-full hover:bg-red-100/50"
                title="Remove this source"
              >
                ×
              </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`revName-${source.id}`} className="block text-sm font-medium text-gray-600 mb-1">Source Name</label>
              <input type="text" id={`revName-${source.id}`} value={source.name}
                onChange={(e) => handleInputChange(source.id, 'name', e.target.value)}
                placeholder="e.g., Product A Sales"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70 placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor={`pricingStrategy-${source.id}`} className="block text-sm font-medium text-gray-600 mb-1">Pricing Strategy</label>
              <select id={`pricingStrategy-${source.id}`} value={source.pricingStrategy}
                onChange={(e) => handleInputChange(source.id, 'pricingStrategy', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
              >
                <option value="UnitPrice">Unit Price</option>
                <option value="SubscriptionPrice">Subscription Price</option>
              </select>
            </div>
            <div>
              <label htmlFor={`price-${source.id}`} className="block text-sm font-medium text-gray-600 mb-1">
                {source.pricingStrategy === "UnitPrice" ? "Price per Unit ($)" : "Price per Subscriber ($)"}
              </label>
              <input type="number" id={`price-${source.id}`} value={source.price}
                onChange={(e) => handleInputChange(source.id, 'price', e.target.value)}
                min="0" step="any" className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
              />
            </div>
            <div>
              <label htmlFor={`initialVolume-${source.id}`} className="block text-sm font-medium text-gray-600 mb-1">
                {source.pricingStrategy === "UnitPrice" ? "Initial Sales Volume (Units/Month)" : "Initial Subscribers (#)"}
              </label>
              <input type="number" id={`initialVolume-${source.id}`} value={source.initialVolume}
                onChange={(e) => handleInputChange(source.id, 'initialVolume', e.target.value)}
                min="0" step="1" className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
              />
            </div>
            <div>
              <label htmlFor={`monthlyGrowthRate-${source.id}`} className="block text-sm font-medium text-gray-600 mb-1">Monthly Growth Rate (%)</label>
              <input type="number" id={`monthlyGrowthRate-${source.id}`} value={source.monthlyGrowthRate * 100}
                onChange={(e) => handleInputChange(source.id, 'monthlyGrowthRate', e.target.value)}
                min="0" step="0.1" className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center mt-2 space-x-4">
                <label htmlFor={`applyQ4Uplift-${source.id}`} className="flex items-center cursor-pointer">
                  <input type="checkbox" id={`applyQ4Uplift-${source.id}`} checked={source.applyQ4Uplift}
                    onChange={() => handleToggleChange(source.id, 'applyQ4Uplift')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Apply Q4 Uplift?</span>
                </label>
                {source.applyQ4Uplift && (
                  <div className="flex-grow">
                    <label htmlFor={`q4UpliftPercentage-${source.id}`} className="block text-sm font-medium text-gray-600 mb-1">Q4 Uplift on Volume (+%)</label>
                    <input type="number" id={`q4UpliftPercentage-${source.id}`} value={source.q4UpliftPercentage * 100}
                      onChange={(e) => handleInputChange(source.id, 'q4UpliftPercentage', e.target.value)}
                      min="0" step="0.1" className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      {revenueSources.length < MAX_REVENUE_SOURCES && (
        <button type="button" onClick={addRevenueSource}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm">
          + Add Another Income Source
        </button>
      )}
    </div>
  );
}
export default RevenueForm;