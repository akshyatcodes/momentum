// src/components/OpexForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { industryTemplates } from '../data/industryTemplates';

const MAX_OPEX_ITEMS = 15;
const generateId = () => `opex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const standardOpexItemNames = [
  "Salaries & Wages",
  "Rent & Utilities",
  "Marketing & Advertising",
  "Software & Tools",
  "Other Operating Expenses"
];

// MODIFIED: Default isRemovable for standard items will now be true
const createDefaultOpexItem = (name = "", amount = 0, growthRate = 0.03, 
                               isCustom = true, 
                               isRemovable = true, // Default to true now
                               isNameEditable = true) => ({
  id: generateId(),
  name: name,
  amount: parseFloat(amount) || 0,
  annualGrowthRate: parseFloat(growthRate) || 0,
  isCustom: isCustom,
  isRemovable: isRemovable, // This will be overridden for standard items if needed
  isNameEditable: isNameEditable, // This will be overridden for standard items
});

function OpexForm({ initialData, onDataChange, setupData, onClearSectionData }) {
  const [opexItems, setOpexItems] = useState(() => {
    if (initialData && initialData.items && initialData.items.length > 0) {
      return initialData.items.map(item => {
        const isStandardItem = standardOpexItemNames.includes(item.name);
        return {
          ...createDefaultOpexItem(
            item.name, 
            item.amount, 
            item.annualGrowthRate,
            // Infer flags if they are missing from loaded data
            item.isCustom !== undefined ? item.isCustom : !isStandardItem,
            item.isRemovable !== undefined ? item.isRemovable : true, // Default to removable even for standard if flag missing
            item.isNameEditable !== undefined ? item.isNameEditable : !isStandardItem
          ),
          id: item.id || generateId(),
        };
      });
    }
    // If no initial data, create standard items.
    // MODIFIED: Standard items are now removable by default, name still not editable.
    return standardOpexItemNames.map(name => createDefaultOpexItem(name, 0, 0.03, 
                                                                  false, // isCustom
                                                                  true,  // isRemovable (NOW TRUE)
                                                                  false  // isNameEditable
                                                                  ));
  });

  // Effect for Guided Setup pre-fill
  useEffect(() => {
    if (setupData?.setupMode === "Guided" && setupData?.industryType) {
      let templateToApply = null;
      const mainIndustryConfig = industryTemplates[setupData.industryType];

      if (setupData.businessSubType && mainIndustryConfig?.subTypes?.[setupData.businessSubType]) {
        templateToApply = mainIndustryConfig.subTypes[setupData.businessSubType];
      } else if (mainIndustryConfig) {
        templateToApply = mainIndustryConfig;
      }

      if (templateToApply && templateToApply.exampleOpex && templateToApply.exampleOpex.length > 0) {
        const isCurrentDataEffectivelyEmptyOrJustStandardZeros = 
            opexItems.length === 0 || 
            (opexItems.length <= standardOpexItemNames.length && opexItems.every(item => 
                (standardOpexItemNames.includes(item.name) && item.amount === 0 && !item.isCustom) || item.isCustom // Allow if it's just empty standard items or empty custom items from a previous clear
            ));

        if (isCurrentDataEffectivelyEmptyOrJustStandardZeros) {
          let itemsFromTemplate = templateToApply.exampleOpex.map(templateItem => {
            const isStandard = standardOpexItemNames.includes(templateItem.name);
            return createDefaultOpexItem(
              templateItem.name,
              templateItem.amount,
              templateItem.annualGrowthRate !== undefined ? templateItem.annualGrowthRate : 0.03,
              !isStandard, // isCustom
              true,        // isRemovable (ALL items from template are initially removable)
              !isStandard  // isNameEditable
            );
          });
          
          // Ensure all standard items are present if not in template, add them (removable, name not editable)
          standardOpexItemNames.forEach(stdName => {
            if (!itemsFromTemplate.find(item => item.name === stdName)) {
              itemsFromTemplate.push(createDefaultOpexItem(stdName, 0, 0.03, false, true, false));
            }
          });

          itemsFromTemplate.sort((a, b) => { /* ... sorting logic remains same ... */
            const aIsStandard = standardOpexItemNames.includes(a.name);
            const bIsStandard = standardOpexItemNames.includes(b.name);
            if (aIsStandard && !bIsStandard) return -1;
            if (!aIsStandard && bIsStandard) return 1;
            if (aIsStandard && bIsStandard) {
              return standardOpexItemNames.indexOf(a.name) - standardOpexItemNames.indexOf(b.name);
            }
            return 0; 
          });

          setOpexItems(itemsFromTemplate.slice(0, MAX_OPEX_ITEMS));
        }
      } else if (templateToApply && (opexItems.length === 0 || opexItems.every(i => i.amount === 0)) ) { 
        // Template exists but no opex OR current items are all zero
        setOpexItems(standardOpexItemNames.map(name => createDefaultOpexItem(name, 0, 0.03, false, true, false)));
      }
    }
    // Make sure to only run this effect when setupData changes, not opexItems itself
  }, [setupData?.setupMode, setupData?.industryType, setupData?.businessSubType]);


  const handleInputChange = (id, field, value) => { /* ... remains same ... */
    setOpexItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          let processedValue = value;
          if (field === 'annualGrowthRate') {
            processedValue = parseFloat(value) / 100;
            if (isNaN(processedValue) || processedValue < 0) processedValue = 0;
          } else if (field === 'amount') {
            processedValue = parseFloat(value);
            if (isNaN(processedValue)) processedValue = 0; 
          }
          return { ...item, [field]: processedValue };
        }
        return item;
      })
    );
  };

  const addOpexItem = () => { /* ... remains same ... */
    if (opexItems.length < MAX_OPEX_ITEMS) {
      setOpexItems(prevItems => [...prevItems, createDefaultOpexItem("New Custom Expense", 0, 0.03, true, true, true)]);
    }
  };

  // No change needed to removeOpexItem as it already respects the `isRemovable` flag
  const removeOpexItem = (idToRemove) => {
    // Ensure we don't remove the very last item if it's the only one left.
    // Or, if we want to allow removing all, then this check changes.
    // For now, let's prevent removing the absolute last item.
    if (opexItems.length === 1 && opexItems[0].id === idToRemove && opexItems[0].isRemovable) {
        // If it's the last item, reset it to a blank custom item instead of an empty list
        setOpexItems([createDefaultOpexItem("New Custom Expense",0,0.03,true,true,true)]);
        return;
    }

    setOpexItems(prevItems => prevItems.filter(item => {
        if (item.id === idToRemove && item.isRemovable) return false;
        return true;
    }));
  };

  const stableOnDataChange = useCallback(onDataChange, []);
  useEffect(() => { /* ... remains same ... */
    stableOnDataChange({ items: opexItems });
  }, [opexItems, stableOnDataChange]);

  // JSX for rendering also remains the same, as the `isRemovable` flag
  // already controls the visibility of the remove button.
  // ... (rest of the OpexForm JSX)
  return (
    <div className="bg-white/50 backdrop-blur-lg border border-white/30 shadow-xl p-6 rounded-xl w-full max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Operating Expenses (OPEX)</h2>
        {/* NEW: Clear Section Data Button */}
        {onClearSectionData && ( // Only render if the prop is provided
            <button
                type="button"
                onClick={onClearSectionData}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-1 px-3 rounded-md shadow-sm transition duration-150"
                title="Clear all Opex data for this section"
            >
                Clear Opex Data
            </button>
        )}

      <p className="text-sm text-gray-600 mb-4">
        Enter your regular monthly operating costs. Each item can have its own annual growth rate.
        <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Zero Amount</span>
        <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Non-Zero Amount</span>
      </p>

      {opexItems.map((item) => {
        const amountIsZero = item.amount === 0;
        const rowHighlightClass = amountIsZero 
            ? 'border-red-400/50 bg-red-50/30'
            : 'border-green-400/50 bg-green-50/30';

        return (
            <div 
                key={item.id} 
                className={`mb-6 p-4 border rounded-lg shadow-sm bg-white/20 relative transition-colors duration-300 ${rowHighlightClass}`}
            >
            {item.isRemovable && ( // This condition now correctly allows X for standard items
              <button
                type="button"
                onClick={() => removeOpexItem(item.id)}
                className="absolute top-1 right-1 text-red-600 hover:text-red-800 font-semibold text-lg px-2 rounded-full hover:bg-red-100/70 z-10"
                title="Remove this expense"
              >
                ×
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-1">
                <label htmlFor={`opexName-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Name
                </label>
                <input
                  type="text"
                  id={`opexName-${item.id}`}
                  value={item.name}
                  onChange={(e) => handleInputChange(item.id, 'name', e.target.value)}
                  readOnly={!item.isNameEditable}
                  className={`w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70 placeholder-gray-500 ${!item.isNameEditable ? 'bg-gray-200/60 cursor-not-allowed text-gray-500' : ''}`}
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor={`opexAmount-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Amount ($)
                </label>
                <input
                  type="number"
                  id={`opexAmount-${item.id}`}
                  value={item.amount}
                  onChange={(e) => handleInputChange(item.id, 'amount', e.target.value)}
                  min="0" 
                  step="any"
                  className={`w-full p-2 border rounded-md shadow-sm bg-white/70 
                              ${amountIsZero ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor={`opexGrowth-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Growth (%)
                </label>
                <input
                  type="number"
                  id={`opexGrowth-${item.id}`}
                  value={item.annualGrowthRate * 100}
                  onChange={(e) => handleInputChange(item.id, 'annualGrowthRate', e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white/70"
                />
              </div>
            </div>
          </div>
        );
      })}

      {opexItems.length < MAX_OPEX_ITEMS && (
        <button
          type="button"
          onClick={addOpexItem}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
        >
          + Add Custom Expense Item
        </button>
      )}
    </div>
  );
}
export default OpexForm;