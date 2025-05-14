// src/components/InitialSetup.jsx
import React, { useState, useEffect } from 'react';
import { industryTemplates } from '../data/industryTemplates';

function InitialSetup({ onSetupComplete, initialData, onClearSectionData }) {
  const [businessName, setBusinessName] = useState(initialData?.businessName || "");
  const [projectionPeriodYears, setProjectionPeriodYears] = useState(initialData?.projectionPeriodYears || 1);
  const [industryType, setIndustryType] = useState(initialData?.industryType || "Service");
  // NEW: State for business sub-type
  const [businessSubType, setBusinessSubType] = useState(initialData?.businessSubType || "");
  const [setupMode, setSetupMode] = useState(initialData?.setupMode || "Manual");
  
  const [currentIndustrySubTypes, setCurrentIndustrySubTypes] = useState([]);
  const [templateDescription, setTemplateDescription] = useState("");

  // Effect to update available sub-types and description
  useEffect(() => {
    const selectedIndustryConfig = industryTemplates[industryType];
    let description = "";
    let subTypesToShow = [];

    if (selectedIndustryConfig) {
      if (selectedIndustryConfig.subTypes && Object.keys(selectedIndustryConfig.subTypes).length > 0) {
        subTypesToShow = Object.keys(selectedIndustryConfig.subTypes);
        // If a sub-type is selected and valid for the current industry, use its description
        if (setupMode === "Guided" && businessSubType && selectedIndustryConfig.subTypes[businessSubType]) {
          description = selectedIndustryConfig.subTypes[businessSubType].description || selectedIndustryConfig.description || "";
        } else if (setupMode === "Guided") {
          // If no sub-type or invalid sub-type, use general industry description
          description = selectedIndustryConfig.description || "";
        }
      } else if (setupMode === "Guided") {
        // No sub-types for this industry, use general industry description
        description = selectedIndustryConfig.description || "";
      }
      // Reset businessSubType if the current industry doesn't have the previously selected subType
      if (businessSubType && !subTypesToShow.includes(businessSubType)) {
          setBusinessSubType("");
      }
    }
    setCurrentIndustrySubTypes(subTypesToShow);
    setTemplateDescription(description);

  }, [industryType, businessSubType, setupMode]);


  const handleIndustryChange = (e) => {
    const newIndustry = e.target.value;
    setIndustryType(newIndustry);
    // Reset sub-type when industry changes, as sub-types are specific to an industry
    setBusinessSubType("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetupComplete({
      businessName,
      projectionPeriodYears: parseInt(projectionPeriodYears, 10),
      industryType,
      businessSubType: currentIndustrySubTypes.length > 0 ? businessSubType : "", // Only pass subType if relevant
      setupMode,
    });
    alert(`Setup data saved! Mode: ${setupMode}. Industry: ${industryType}${businessSubType ? ' (' + businessSubType + ')' : ''}.`);
    console.log({ businessName, projectionPeriodYears, industryType, businessSubType, setupMode });
  };

  const availableIndustries = Object.keys(industryTemplates);

  return (
    <div className="bg-white/50 backdrop-blur-lg border border-white/30 shadow-xl p-6 rounded-xl w-full max-w-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Initial Business Setup</h2>
      {/* NEW: Clear Section Data Button */}
      {onClearSectionData && ( // Only render if the prop is provided
            <button
                type="button"
                onClick={onClearSectionData}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-1 px-3 rounded-md shadow-sm transition duration-150"
                title="Clear all Business data for this section"
            >
                Clear Business Data
            </button>
        )}
      <form onSubmit={handleSubmit}>
        {/* Business Name */}
        <div className="mb-4">
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
            Business Name (Optional)
          </label>
          <input
            type="text" id="businessName" value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g., My Awesome Startup"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70 placeholder-gray-500"
          />
        </div>

        {/* Projection Period */}
        <div className="mb-4">
          <label htmlFor="projectionPeriodYears" className="block text-sm font-medium text-gray-700 mb-1">
            Projection Period
          </label>
          <select
            id="projectionPeriodYears" value={projectionPeriodYears}
            onChange={(e) => setProjectionPeriodYears(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
          >
            {[1, 2, 3, 4, 5].map(year => <option key={year} value={year}>{year} Year{year > 1 ? 's' : ''}</option>)}
          </select>
        </div>

        {/* Industry Type */}
        <div className="mb-4">
          <label htmlFor="industryType" className="block text-sm font-medium text-gray-700 mb-1">
            Industry Type
          </label>
          <select
            id="industryType" value={industryType}
            onChange={handleIndustryChange} // Use custom handler
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
          >
            {availableIndustries.map(industry => <option key={industry} value={industry}>{industry}</option>)}
          </select>
        </div>

        {/* Business Sub-Type (Conditional) */}
        {currentIndustrySubTypes.length > 0 && (
          <div className="mb-4">
            <label htmlFor="businessSubType" className="block text-sm font-medium text-gray-700 mb-1">
              Business Specialization / Sub-Type (Optional)
            </label>
            <select
              id="businessSubType" value={businessSubType}
              onChange={(e) => setBusinessSubType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
            >
              <option value="">-- Select Specialization (Optional) --</option>
              {currentIndustrySubTypes.map(subType => (
                <option key={subType} value={subType}>{subType}</option>
              ))}
            </select>
          </div>
        )}

        {/* Setup Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Setup Mode</label>
          <div className="flex items-center space-x-6">
            <label htmlFor="manualMode" className="flex items-center cursor-pointer">
              <input type="radio" id="manualMode" name="setupMode" value="Manual" checked={setupMode === "Manual"}
                onChange={(e) => setSetupMode(e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Manual Setup</span>
            </label>
            <label htmlFor="guidedMode" className="flex items-center cursor-pointer">
              <input type="radio" id="guidedMode" name="setupMode" value="Guided" checked={setupMode === "Guided"}
                onChange={(e) => setSetupMode(e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Guided Setup (Mock AI)</span>
            </label>
          </div>
          {setupMode === "Guided" && templateDescription && (
            <p className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded-md border border-blue-200">
              <strong>Guided Mode for {industryType} {businessSubType ? `(${businessSubType})` : ''}:</strong> {templateDescription}
              <br/> Example data will be pre-filled in subsequent steps.
            </p>
          )}
        </div>

        <button type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-lg"
        >
          Save Setup & Continue
        </button>
      </form>
    </div>
  );
}

export default InitialSetup;