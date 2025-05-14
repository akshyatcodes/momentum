// src/App.jsx
import React, { useState, useEffect } from 'react';
import InitialSetup from './components/InitialSetup';
import RevenueForm from './components/RevenueForm';
import CogsForm from './components/CogsForm';
import OpexForm from './components/OpexForm';
import FinancingForm from './components/FinancingForm';
import PnlTable from './components/PnlTable'; // Import PnlTable
import CashFlowTable from './components/CashFlowTable';
import BreakEvenDisplay from './components/BreakEvenDisplay'; // NEW IMPORT
import AssumptionsList from './components/AssumptionsList'; // NEW IMPORT
import { industryTemplates } from './data/industryTemplates';
import { generateAllProjections } from './utils/calculations'; // Updated import name

import { generatePdfReport } from './utils/pdfGenerator'; // NEW IMPORT

const LOCAL_STORAGE_KEY = 'momentumProjectData';

const getDefaultStandardOpexItems = () => [
  "Salaries & Wages", "Rent & Utilities", "Marketing & Advertising",
  "Software & Tools", "Other Operating Expenses"
].map(name => ({
  id: `std_opex_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, // Ensure unique IDs on init
  name: name, amount: 0, annualGrowthRate: 0.03,
  isCustom: false, isRemovable: true, isNameEditable: false,
}));

const standardOpexItemNames = getDefaultStandardOpexItems().map(i => i.name);

const getInitialState = (setupValuesForTemplate = null) => {
  const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  let parsedData;

  // Only load from localStorage if not specifically generating a template-based state (e.g., for section clear)
  if (!setupValuesForTemplate && savedData) {
    try { parsedData = JSON.parse(savedData); }
    catch (error) { console.error("Error parsing data from localStorage:", error); parsedData = null; }
  }

  const defaultState = {
    setup: { businessName: "", projectionPeriodYears: 1, industryType: "Service", businessSubType: "", logoDataUrl: null, setupMode: "Manual" },
    revenue: { sources: [] },
    cogs: { items: [] },
    opex: { items: getDefaultStandardOpexItems() }, // Initialize with standard items
    financing: { ownersInvestment: 0, loan: { amount: 0, annualInterestRate: 0, termYears: 0 } },
    taxRate: 0.20,
    projections: { monthlyPnl: [], annualPnl: [], monthlyCashFlow: [], annualCashFlow: [], breakEven: {}, assumptionsSummary: [] } // Initialize all projection substructures
  };

  // If called for clearing a section with setupValues (for template re-application)
  if (setupValuesForTemplate && setupValuesForTemplate.setupMode === "Guided") {
    const { industryType, businessSubType } = setupValuesForTemplate;
    let templateToApply = null;
    const mainIndustryConfig = industryTemplates[industryType];

    if (businessSubType && mainIndustryConfig?.subTypes?.[businessSubType]) {
      templateToApply = mainIndustryConfig.subTypes[businessSubType];
    } else if (mainIndustryConfig) {
      templateToApply = mainIndustryConfig;
    }
    
    const templatedState = { ...defaultState }; // Start with fresh defaults

    if (templateToApply) {
      if (templateToApply.exampleRevenueStreams) {
        templatedState.revenue.sources = templateToApply.exampleRevenueStreams.map((s, idx) => ({ ...s, id: `rev_tpl_${idx}_${Date.now()}`})).slice(0,5);
      }
      if (templateToApply.exampleCogs) {
        templatedState.cogs.items = templateToApply.exampleCogs.map((c, idx) => ({ ...c, id: `cogs_tpl_${idx}_${Date.now()}`})).slice(0,10);
      }
      if (templateToApply.exampleOpex) { // Opex template is array of objects
        templatedState.opex.items = templateToApply.exampleOpex.map((o, idx) => ({
            ...o, 
            id: `opex_tpl_${idx}_${Date.now()}`,
            isCustom: !standardOpexItemNames.includes(o.name),
            isRemovable: true,
            isNameEditable: !standardOpexItemNames.includes(o.name)
        })).slice(0,15);
        // Ensure standard items are present
        getDefaultStandardOpexItems().forEach(stdItem => {
            if(!templatedState.opex.items.find(item => item.name === stdItem.name)) {
                templatedState.opex.items.push({...stdItem, id: `std_opex_add_${stdItem.name.replace(/\s+/g, '_')}_${Date.now()}` }); // ensure unique ID
            }
        });
      }
      // Templates don't typically set financing or tax rate in this structure, they remain default
    }
    return templatedState; 
  }


  if (parsedData) {
    const mergedState = {
        ...defaultState, ...parsedData,
        setup: { ...defaultState.setup, ...(parsedData.setup || {}) },
        revenue: { sources: parsedData.revenue?.sources || [] },
        cogs: { items: parsedData.cogs?.items || [] },
        opex: { items: parsedData.opex?.items && parsedData.opex.items.length > 0 ? parsedData.opex.items : getDefaultStandardOpexItems() },
        financing: { 
            ...defaultState.financing, 
            ...(parsedData.financing || {}),
            loan: (parsedData.financing?.loan) 
                  ? { ...defaultState.financing.loan, ...parsedData.financing.loan } 
                  : (parsedData.financing?.loans && parsedData.financing.loans.length > 0) 
                    ? { ...defaultState.financing.loan, ...parsedData.financing.loans[0] } 
                    : { ...defaultState.financing.loan }
        },
        projections: defaultState.projections, // Always start projections fresh, they are recalculated
    };
    // OPEX items upgrade logic (ensure all flags are present)
    if (mergedState.opex.items.some(item => item.isCustom === undefined || item.id === undefined)) {
        mergedState.opex.items = mergedState.opex.items.map(item => {
            const isStandard = standardOpexItemNames.includes(item.name);
            return {
                id: item.id || `opex_upg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: item.name || "Unnamed Expense", 
                amount: parseFloat(item.amount) || 0,
                annualGrowthRate: parseFloat(item.annualGrowthRate) || 0.03,
                isCustom: item.isCustom !== undefined ? item.isCustom : !isStandard,
                isRemovable: item.isRemovable !== undefined ? item.isRemovable : true,
                isNameEditable: item.isNameEditable !== undefined ? item.isNameEditable : !isStandard,
            };
        });
    }
    return mergedState;
  }
  return defaultState;
};


function App() {
  const [projectData, setProjectData] = useState(getInitialState);
  const [currentStep, setCurrentStep] = useState('setup');

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectData));
    // console.log("Data saved to localStorage:", projectData); // Keep this less noisy
  }, [projectData]);

  // useEffect to recalculate projections when input data changes
  useEffect(() => {
    if (projectData.setup && projectData.revenue && projectData.cogs && projectData.opex && projectData.financing) {
      console.log("Recalculating ALL projections (including assumptions)...");
      const allProjections = generateAllProjections(projectData); // Call the updated function
      setProjectData(prevData => ({
        ...prevData,
        projections: { // Update the entire projections object
          monthlyPnl: allProjections.monthlyPnl,
          annualPnl: allProjections.annualPnl,
          monthlyCashFlow: allProjections.monthlyCashFlow,
          annualCashFlow: allProjections.annualCashFlow,
          breakEven: allProjections.breakEven, 
          assumptionsSummary: allProjections.assumptionsSummary
        }
      }));
    }
  }, [
    projectData.setup, projectData.revenue, projectData.cogs,
    projectData.opex, projectData.financing, projectData.taxRate
  ]);

  const handleSetupComplete = (newSetupValues) => {
    const oldSetup = projectData.setup;
    const updatedSetup = { ...oldSetup, ...newSetupValues };
    let newProjectData = { ...projectData, setup: updatedSetup };

    const hasGuidedParametersChanged =
      (updatedSetup.setupMode === "Guided" && oldSetup.setupMode !== "Guided") ||
      (updatedSetup.setupMode === "Guided" && updatedSetup.industryType !== oldSetup.industryType) ||
      (updatedSetup.setupMode === "Guided" && updatedSetup.businessSubType !== oldSetup.businessSubType);

    if (hasGuidedParametersChanged) {
      const defaultsForTemplate = getInitialState(updatedSetup); // Get defaults potentially pre-filled
      newProjectData = {
        ...newProjectData,
        revenue: { ...defaultsForTemplate.revenue },
        cogs: { ...defaultsForTemplate.cogs },
        opex: { ...defaultsForTemplate.opex },
        financing: { ...defaultsForTemplate.financing },
        projections: { ...defaultsForTemplate.projections } // Also reset projections
      };
    }
    setProjectData(newProjectData);
    setCurrentStep('revenue');
  };

  const handleRevenueDataChange = (revenueData) => setProjectData(prev => ({ ...prev, revenue: revenueData }));
  const handleCogsDataChange = (cogsData) => setProjectData(prev => ({ ...prev, cogs: cogsData }));
  const handleOpexDataChange = (opexData) => setProjectData(prev => ({ ...prev, opex: opexData }));
  const handleFinancingDataChange = (financingData) => setProjectData(prev => ({ ...prev, financing: financingData }));
  
  const handleTaxRateChange = (e) => {
    const rate = parseFloat(e.target.value) / 100;
    setProjectData(prev => ({ ...prev, taxRate: isNaN(rate) || rate < 0 ? 0 : (rate > 1 ? 1 : rate) }));
  };

  const createSectionClearHandler = (sectionKey, defaultSectionStateFactory) => {
    return () => {
      if (window.confirm(`Are you sure you want to clear the data for the ${sectionKey.replace(/^\w/, c => c.toUpperCase())} section?`)) {
        setProjectData(prevData => {
          let newStateForSection;
          const isTemplatableSection = ["revenue", "cogs", "opex"].includes(sectionKey);

          if (isTemplatableSection && prevData.setup.setupMode === "Guided") {
            const templatedDefaults = getInitialState(prevData.setup);
            newStateForSection = templatedDefaults[sectionKey];
          } else {
            newStateForSection = defaultSectionStateFactory();
          }
          
          // When clearing a section, also clear projections as they depend on this data
          return { 
            ...prevData, 
            [sectionKey]: newStateForSection,
            projections: getInitialState().projections // Reset all projections
          };
        });
        console.log(`${sectionKey} data cleared, projections reset.`);
      }
    };
  };
  
  const handleClearSetupData = createSectionClearHandler('setup', () => getInitialState().setup);
  const handleClearRevenueData = createSectionClearHandler('revenue', () => getInitialState().revenue);
  const handleClearCogsData = createSectionClearHandler('cogs', () => getInitialState().cogs);
  const handleClearOpexData = createSectionClearHandler('opex', () => getInitialState().opex);
  const handleClearFinancingData = createSectionClearHandler('financing', () => getInitialState().financing);

  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to clear ALL data? This cannot be undone.")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setProjectData(getInitialState());
      setCurrentStep('setup');
      console.log("All data cleared.");
    }
  };

  const navigateTo = (step) => setCurrentStep(step);

  let content;
  if (currentStep === 'setup') {
    content = <InitialSetup initialData={projectData.setup} onSetupComplete={handleSetupComplete} onClearSectionData={handleClearSetupData} />;
  } else if (currentStep === 'revenue') {
    content = <RevenueForm initialData={projectData.revenue.sources} onDataChange={handleRevenueDataChange} setupData={projectData.setup} onClearSectionData={handleClearRevenueData} />;
  } else if (currentStep === 'cogs') {
    content = <CogsForm initialData={projectData.cogs.items} revenueSources={projectData.revenue.sources} onDataChange={handleCogsDataChange} setupData={projectData.setup} onClearSectionData={handleClearCogsData} />;
  } else if (currentStep === 'opex') {
    content = <OpexForm initialData={projectData.opex} onDataChange={handleOpexDataChange} setupData={projectData.setup} onClearSectionData={handleClearOpexData} />;
  } else if (currentStep === 'financing') {
    content = (
      <>
        <FinancingForm initialData={projectData.financing} onDataChange={handleFinancingDataChange} onClearSectionData={handleClearFinancingData} />
        <div className="bg-white/50 backdrop-blur-lg border border-white/30 shadow-xl p-6 rounded-xl w-full max-w-lg mt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Tax & Assumptions</h3>
          <div>
            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-1">Overall Flat Tax Rate (%)</label>
            <input type="number" id="taxRate" value={projectData.taxRate * 100} onChange={handleTaxRateChange} min="0" max="100" step="0.1" className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70" />
          </div>
        </div>
      </>
    );
  } else if (currentStep === 'pnl_report') {
    content = ( projectData.projections && projectData.projections.monthlyPnl.length > 0 ?
        <PnlTable monthlyData={projectData.projections.monthlyPnl} annualData={projectData.projections.annualPnl} />
        : <div className="bg-white/50 backdrop-blur-lg border border-white/30 shadow-xl p-6 rounded-xl w-full max-w-lg text-center">
            <p className="text-gray-600">Enter data in previous sections to generate the P&L report.</p>
            <p className="text-xs text-gray-500 mt-2">(If data is entered, calculations might be in progress or an error occurred. Check console.)</p>
          </div>
    );

  } else if (currentStep === 'cashflow_report') {
    content = (
        projectData.projections && projectData.projections.monthlyCashFlow.length > 0 ?
        <CashFlowTable monthlyData={projectData.projections.monthlyCashFlow} annualData={projectData.projections.annualCashFlow} />
        : <div className="bg-white/50 backdrop-blur-lg border border-white/30 shadow-xl p-6 rounded-xl w-full max-w-lg text-center">
            <p className="text-gray-600">Enter data in previous sections to generate the Cash Flow report.</p>
          </div>
    );

  } else if (currentStep === 'breakeven_analysis') {
    content = (
        projectData.projections && projectData.projections.breakEven ?
        <BreakEvenDisplay breakEvenData={projectData.projections.breakEven} />
        : <div className="bg-white/50 backdrop-blur-lg border border-white/30 shadow-xl p-6 rounded-xl w-full max-w-lg text-center">
            <p className="text-gray-600">Enter data in previous sections to generate Break-Even Analysis.</p>
          </div>
    );
  } // NEW: Assumptions Summary Step
  else if (currentStep === 'assumptions_summary') {
    content = (
        projectData.projections && projectData.projections.assumptionsSummary && projectData.projections.assumptionsSummary.length > 0 ?
        <AssumptionsList assumptionsData={projectData.projections.assumptionsSummary} />
        : <div className="bg-white/50 backdrop-blur-lg border border-white/30 shadow-xl p-6 rounded-xl w-full max-w-lg text-center">
            <p className="text-gray-600">Enter data in previous sections to generate Assumptions Summary.</p>
          </div>
    );
  }   else {
    content = <p>Step: {currentStep} (Not yet implemented)</p>;
  }


const handleDownloadPdf = async () => {
    if (projectData.projections && projectData.projections.monthlyPnl.length > 0) {
      try {
        // Could show a loading indicator here
        console.log("Generating PDF report...");
        await generatePdfReport(projectData);
        console.log("PDF report generation initiated.");
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Sorry, there was an error generating the PDF report. Please check the console for details.");
      } finally {
        // Hide loading indicator here
      }
    } else {
      alert("Please complete your projections before generating a report.");
    }
  };


  return (
    <div className="bg-gradient-to-br from-sky-100 to-blue-200 min-h-screen flex flex-col items-center p-4 sm:p-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-700">Momentum</h1>
        <p className="text-md sm:text-lg text-gray-700">The Intuitive Business Projection Launchpad</p>
      </header>

      <nav className="mb-8 flex flex-wrap justify-center gap-1 sm:gap-2 bg-white/30 backdrop-blur-md p-2 rounded-lg shadow">
        {[
          { key: 'setup', label: '1. Setup', disabled: false },
          { key: 'revenue', label: '2. Revenue', disabled: !projectData.setup.industryType },
          { key: 'cogs', label: '3. COGS', disabled: !projectData.revenue.sources?.some(s => s.name) },
          { key: 'opex', label: '4. OPEX', disabled: !projectData.cogs.items?.some(i => i.description || i.variableCostValue > 0 || i.otherDirectCostsMonthly > 0) },
          { key: 'financing', label: '5. Financing', disabled: !projectData.opex.items?.some(i => i.amount > 0) },
          { key: 'pnl_report', label: 'P&L Report', disabled: !projectData.projections?.monthlyPnl?.length > 0 },
          { key: 'cashflow_report', label: 'Cash Flow', disabled: !projectData.projections?.monthlyCashFlow?.length > 0 },
          { key: 'breakeven_analysis', label: 'Break-Even', disabled: !projectData.projections?.breakEven?.calculationPossible },
          { key: 'assumptions_summary', label: 'Assumptions', disabled: !projectData.projections?.assumptionsSummary?.length > 0 } 

        ].map(tab => (
          <button
            key={tab.key} onClick={() => navigateTo(tab.key)}
            disabled={tab.disabled && currentStep !== tab.key}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors
                        ${currentStep === tab.key ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100/50'}
                        ${(tab.disabled && currentStep !== tab.key) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >{tab.label}</button>
        ))}
      </nav>

      <main className="w-full flex flex-col items-center">
        {content}

        {/* Container for action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 w-full max-w-md sm:max-w-xl justify-center">
            <button 
              onClick={handleDownloadPdf}
              disabled={!projectData.projections?.monthlyPnl?.length > 0}
              className={`w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm transition duration-150 ease-in-out
                          ${(!projectData.projections?.monthlyPnl?.length > 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Download PDF Report
            </button>
            <button 
              onClick={handleClearAllData}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
            >
              Clear All Project Data
            </button>
            </div>
      </main>

      {/* <div className="mt-8 p-4 bg-gray-800/80 backdrop-blur-sm text-white rounded-lg w-full max-w-5xl overflow-x-auto text-xs shadow-lg"> Increased max-width for debug */}
        {/* <h3 className="font-semibold text-lg mb-2">Current Project Data (Debug):</h3> */}
        {/* <pre>{JSON.stringify(projectData, null, 2)}</pre> */}
      {/* </div> */}
    </div>
  );
}



export default App;
