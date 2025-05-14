// src/utils/calculations.js

/**
 * Calculates the monthly loan payment (principal + interest) using a simplified formula.
 * For MVP, simple interest calculation. More accurate would be an amortization formula.
 * If we want amortization: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1], where P=Principal, i=monthly interest rate, n=number of payments.
 * For simplicity, let's do a flat principal repayment + interest on remaining balance for MVP.
 */
export const calculateMonthlyLoanPaymentDetails = (loanAmount, annualInterestRate, termYears, currentMonth, totalMonthsInLoan) => {
    if (!loanAmount || loanAmount <= 0 || !termYears || termYears <= 0) {
      return { principalPayment: 0, interestPayment: 0, remainingBalance: loanAmount || 0 };
    }
  
    const monthlyInterestRate = annualInterestRate / 12;
    // const numberOfPayments = termYears * 12; // Not used in simple flat principal model
  
    // Flat principal repayment
    const principalPaymentPerMonth = loanAmount / (termYears * 12);
  
    // Interest is calculated on the remaining balance from the *previous* month
    // For month 1 (currentMonth = 1), interest is on full loanAmount
    // For month `m`, principal paid so far is (m-1) * principalPaymentPerMonth
    const principalPaidPreviously = (currentMonth - 1) * principalPaymentPerMonth;
    const currentBalanceForInterestCalc = loanAmount - principalPaidPreviously;
    
    let interestPayment = 0;
    if (currentMonth <= totalMonthsInLoan) { // Only pay interest if within loan term
        interestPayment = currentBalanceForInterestCalc * monthlyInterestRate;
    }

    let actualPrincipalPayment = 0;
    if (currentMonth <= totalMonthsInLoan) {
        actualPrincipalPayment = principalPaymentPerMonth;
    }

    // Ensure interest/principal doesn't go negative if balance becomes very small due to float precision
    if (currentBalanceForInterestCalc <= 0) {
        interestPayment = 0;
        actualPrincipalPayment = Math.max(0, currentBalanceForInterestCalc + principalPaidPreviously > 0 ? currentBalanceForInterestCalc : 0 ); // Pay off tiny remaining if any
    }
    if (interestPayment < 0) interestPayment = 0;
    if (actualPrincipalPayment < 0) actualPrincipalPayment = 0;

    const remainingBalanceAfterThisMonth = loanAmount - (principalPaidPreviously + actualPrincipalPayment);
  
    return {
      principalPayment: actualPrincipalPayment,
      interestPayment: interestPayment,
      remainingBalance: remainingBalanceAfterThisMonth > 0.01 ? remainingBalanceAfterThisMonth : 0, // Clear tiny balances
    };
};


// RENAMED and EXPANDED function
export const generateAllProjections = (projectData) => {
  const { setup, revenue, cogs, opex, financing, taxRate } = projectData;
  if (!setup || !revenue || !cogs || !opex || !financing) {
    console.error("Missing core data for projection generation", projectData);
    return { 
      monthlyPnl: [], 
      annualPnl: [], 
      monthlyCashFlow: [], 
      annualCashFlow: [], 
      breakEven: { calculationPossible: false, errorMessage: "Core data missing." },
      assumptionsSummary: [] // Add empty assumptions
    };
  }

  const projectionMonths = setup.projectionPeriodYears * 12;
  const monthlyPnl = [];
  const monthlyCashFlow = [];

  let cumulativeRevenue = {};
  (revenue.sources || []).forEach(source => {
    cumulativeRevenue[source.id] = { volume: source.initialVolume || 0 };
  });

  let cumulativeOpex = {};
  (opex.items || []).forEach(item => {
      cumulativeOpex[item.id] = item.amount || 0;
  });
  
  let currentEndingCashBalance = 0; // Starting cash for the very first month is 0 before inflows

  for (let month = 1; month <= projectionMonths; month++) {
    const currentYear = Math.ceil(month / 12);
    const monthInYear = ((month - 1) % 12) + 1;
    const isQ4 = monthInYear >= 10 && monthInYear <= 12;

    // --- P&L Calculations (mostly same as before) ---
    let monthTotalRevenue = 0;
    const detailedRevenueThisMonth = [];
    (revenue.sources || []).forEach(source => {
      let currentVolume = cumulativeRevenue[source.id]?.volume || source.initialVolume || 0;
      if (month > 1) currentVolume *= (1 + (source.monthlyGrowthRate || 0));
      let volumeForCalc = currentVolume;
      if (source.applyQ4Uplift && isQ4) volumeForCalc *= (1 + (source.q4UpliftPercentage || 0));
      const sourceRevenue = (source.price || 0) * volumeForCalc;
      monthTotalRevenue += sourceRevenue;
      detailedRevenueThisMonth.push({ id: source.id, name: source.name, amount: sourceRevenue });
      cumulativeRevenue[source.id].volume = currentVolume;
    });

    let monthTotalCogs = 0;
    (cogs.items || []).forEach(item => {
      let itemCogs = 0;
      if (item.variableCostType === "PercentageOfRevenue") {
        let relevantRevenue = monthTotalRevenue;
        if(item.revenueStreamNameMatch && item.revenueStreamNameMatch !== "ALL") {
            const linkedRev = detailedRevenueThisMonth.find(r => r.name === item.revenueStreamNameMatch);
            if(linkedRev) relevantRevenue = linkedRev.amount;
        }
        itemCogs += relevantRevenue * (item.variableCostValue || 0);
      } else {
        let totalUnits = 0;
        if(item.revenueStreamNameMatch && item.revenueStreamNameMatch !== "ALL") {
            const linkedRevSourceConfig = revenue.sources.find(s => s.name === item.revenueStreamNameMatch);
            if(linkedRevSourceConfig) {
                let baseVol = cumulativeRevenue[linkedRevSourceConfig.id]?.volume || linkedRevSourceConfig.initialVolume || 0;
                if (linkedRevSourceConfig.applyQ4Uplift && isQ4) { // Apply Q4 uplift to volume for COGS calculation if linked source has it
                    baseVol *= (1 + (linkedRevSourceConfig.q4UpliftPercentage || 0));
                }
                totalUnits = baseVol;
            }
        } else { 
            totalUnits = Object.values(cumulativeRevenue).reduce((sum, rev) => sum + (rev.volume || 0), 0);
        }
        itemCogs += totalUnits * (item.variableCostValue || 0);
      }
      itemCogs += (item.otherDirectCostsMonthly || 0);
      monthTotalCogs += itemCogs;
    });
    const grossProfit = monthTotalRevenue - monthTotalCogs;

    let monthTotalOpex = 0;
    const detailedOpexThisMonth = [];
    if (month > 1 && monthInYear === 1) {
        (opex.items || []).forEach(item => {
            cumulativeOpex[item.id] *= (1 + (item.annualGrowthRate || 0));
        });
    }
    (opex.items || []).forEach(item => {
        const itemAmount = cumulativeOpex[item.id] || 0;
        monthTotalOpex += itemAmount;
        detailedOpexThisMonth.push({ name: item.name, amount: itemAmount});
    });
    const operatingProfit = grossProfit - monthTotalOpex;

    let loanPrincipalPayment = 0;
    let loanInterestPayment = 0;
    if (financing.loan && financing.loan.amount > 0 && financing.loan.termYears > 0) {
      const loanDetails = calculateMonthlyLoanPaymentDetails(
        financing.loan.amount, financing.loan.annualInterestRate, financing.loan.termYears,
        month, financing.loan.termYears * 12
      );
      loanInterestPayment = loanDetails.interestPayment;
      loanPrincipalPayment = loanDetails.principalPayment;
    }
    const earningsBeforeTax = operatingProfit - loanInterestPayment;
    const taxAmountForPnl = earningsBeforeTax > 0 ? earningsBeforeTax * (taxRate || 0) : 0;
    const netProfit = earningsBeforeTax - taxAmountForPnl;

    monthlyPnl.push({
      month, year: currentYear, monthInYear,
      totalRevenue: monthTotalRevenue, totalCogs: monthTotalCogs, grossProfit,
      totalOpex: monthTotalOpex, detailedOpex: detailedOpexThisMonth, operatingProfit,
      interestExpense: loanInterestPayment, earningsBeforeTax, taxAmount: taxAmountForPnl, netProfit,
    });

    // --- Cash Flow Calculations ---
    const startingCashBalance = (month === 1) ? 0 : monthlyCashFlow[monthlyCashFlow.length - 1].endingCashBalance;

    let cashIn_Revenue = monthTotalRevenue; // MVP: All revenue is cash
    let cashIn_OwnersInvestment = (month === 1) ? (financing.ownersInvestment || 0) : 0;
    let cashIn_LoanReceived = (month === 1 && financing.loan) ? (financing.loan.amount || 0) : 0;
    const totalCashIn = cashIn_Revenue + cashIn_OwnersInvestment + cashIn_LoanReceived;

    let cashOut_Cogs = monthTotalCogs; // MVP: COGS paid in same month
    let cashOut_Opex = monthTotalOpex; // MVP: OPEX paid in same month
    let cashOut_Taxes = taxAmountForPnl; // MVP: Taxes paid monthly based on P&L
    // Loan repayment components already calculated (loanPrincipalPayment, loanInterestPayment)
    const totalCashOut = cashOut_Cogs + cashOut_Opex + loanPrincipalPayment + loanInterestPayment + cashOut_Taxes;
    
    const netCashFlow = totalCashIn - totalCashOut;
    const endingCashBalance = startingCashBalance + netCashFlow;

    monthlyCashFlow.push({
      month, year: currentYear, monthInYear,
      startingCashBalance,
      cashIn_Revenue, cashIn_OwnersInvestment, cashIn_LoanReceived, totalCashIn,
      cashOut_Cogs, cashOut_Opex, 
      cashOut_LoanPrincipal: loanPrincipalPayment, 
      cashOut_LoanInterest: loanInterestPayment, 
      cashOut_Taxes, totalCashOut,
      netCashFlow, endingCashBalance,
    });
  }

  // Generate Annual P&L Summaries (same as before)

  const annualPnl = [];
  for (let y = 1; y <= setup.projectionPeriodYears; y++) { /* ... P&L annual aggregation ... */ 
    const yearMonths = monthlyPnl.filter(m => m.year === y);
    annualPnl.push({
      year: y,
      totalRevenue: yearMonths.reduce((sum, m) => sum + m.totalRevenue, 0),
  totalCogs: yearMonths.reduce((sum, m) => sum + m.totalCogs, 0),
  grossProfit: yearMonths.reduce((sum, m) => sum + m.grossProfit, 0),
  totalOpex: yearMonths.reduce((sum, m) => sum + m.totalOpex, 0),
  operatingProfit: yearMonths.reduce((sum, m) => sum + m.operatingProfit, 0),
  interestExpense: yearMonths.reduce((sum, m) => sum + m.interestExpense, 0),
  earningsBeforeTax: yearMonths.reduce((sum, m) => sum + m.earningsBeforeTax, 0),
  taxAmount: yearMonths.reduce((sum, m) => sum + m.taxAmount, 0),
  netProfit: yearMonths.reduce((sum, m) => sum + m.netProfit, 0),
    });
  }

  // Generate Annual Cash Flow Summaries
  const annualCashFlow = [];
  for (let y = 1; y <= setup.projectionPeriodYears; y++) {
    const yearMonthsCf = monthlyCashFlow.filter(m => m.year === y);
    annualCashFlow.push({
  year: y,
  startingCashBalance: yearMonthsCf.length > 0 ? yearMonthsCf[0].startingCashBalance : 0,
  cashIn_Revenue: yearMonthsCf.reduce((sum,m) => sum + m.cashIn_Revenue, 0),
  cashIn_OwnersInvestment: yearMonthsCf.reduce((sum,m) => sum + m.cashIn_OwnersInvestment, 0),
  cashIn_LoanReceived: yearMonthsCf.reduce((sum,m) => sum + m.cashIn_LoanReceived, 0),
  totalCashIn: yearMonthsCf.reduce((sum,m) => sum + m.totalCashIn, 0),
  cashOut_Cogs: yearMonthsCf.reduce((sum,m) => sum + m.cashOut_Cogs, 0),
  cashOut_Opex: yearMonthsCf.reduce((sum,m) => sum + m.cashOut_Opex, 0),
  cashOut_LoanPrincipal: yearMonthsCf.reduce((sum,m) => sum + m.cashOut_LoanPrincipal, 0),
  cashOut_LoanInterest: yearMonthsCf.reduce((sum,m) => sum + m.cashOut_LoanInterest, 0),
  cashOut_Taxes: yearMonthsCf.reduce((sum,m) => sum + m.cashOut_Taxes, 0),
  totalCashOut: yearMonthsCf.reduce((sum,m) => sum + m.totalCashOut, 0),
  netCashFlow: yearMonthsCf.reduce((sum,m) => sum + m.netCashFlow, 0),
  endingCashBalance: yearMonthsCf.length > 0 ? yearMonthsCf[yearMonthsCf.length-1].endingCashBalance : 0,
    });
  }

  // Placeholder for Break-Even, to be calculated after P&L/CF
  const breakEven = calculateBreakEvenAnalysis(projectData);

  // NEW: Gather Assumptions
  const assumptionsSummary = gatherAssumptions(projectData);

  return { monthlyPnl, annualPnl, monthlyCashFlow, annualCashFlow, breakEven, assumptionsSummary };

};

export const calculateBreakEvenAnalysis = (projectData) => {
  const { revenue, cogs, opex } = projectData;

  let calculationPossible = true;
  let errorMessage = "";

  // 1. Identify Primary Revenue Source (for MVP, let's take the first one)
  const primaryRevenueSource = revenue.sources && revenue.sources.length > 0 ? revenue.sources[0] : null;

  if (!primaryRevenueSource || primaryRevenueSource.price <= 0) {
    calculationPossible = false;
    errorMessage = "Primary revenue source with a valid price is required for break-even analysis.";
    return { breakEvenUnits: 0, breakEvenRevenue: 0, averageSellingPricePerUnit: 0, averageVariableCostPerUnit: 0, estimatedMonthlyFixedCosts: 0, analysisBasis: "", calculationPossible, errorMessage };
  }
  const averageSellingPricePerUnit = primaryRevenueSource.price;

  // 2. Estimate Monthly Fixed Costs
  // Sum of all OPEX item base amounts + sum of 'otherDirectCostsMonthly' from all COGS items
  let estimatedMonthlyFixedCosts = 0;
  if (opex && opex.items) {
    estimatedMonthlyFixedCosts += opex.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  }
  if (cogs && cogs.items) {
    estimatedMonthlyFixedCosts += cogs.items.reduce((sum, item) => sum + (item.otherDirectCostsMonthly || 0), 0);
  }

  // 3. Estimate Average Variable Cost Per Unit (linked to primary revenue source)
  let averageVariableCostPerUnit = 0;
  if (cogs && cogs.items) {
    cogs.items.forEach(item => {
      // Consider COGS items explicitly linked by name match OR those generally applicable (no specific match or 'ALL')
      // For MVP, we are less strict on linking. Prioritize items with a name match to the primary revenue source.
      const isLinkedToPrimary = item.revenueStreamNameMatch === primaryRevenueSource.name;
      const isGenericVariableCost = !item.revenueStreamNameMatch || item.revenueStreamNameMatch === "ALL";

      if (isLinkedToPrimary || (isGenericVariableCost && item.variableCostType !== "PercentageOfRevenue")) { // Prioritize direct links for FixedAmount
        if (item.variableCostType === "FixedAmount") {
          averageVariableCostPerUnit += (item.variableCostValue || 0);
        } else if (item.variableCostType === "PercentageOfRevenue") {
          // If it's a percentage, convert it to a fixed amount based on the primary selling price
          // This assumes the percentage COGS item applies to the primary revenue stream.
          averageVariableCostPerUnit += averageSellingPricePerUnit * (item.variableCostValue || 0);
        }
      }
    });
  }
  
  // If no specific variable COGS found, but there's a generic percentage COGS, apply that.
  // This part can be tricky. For simplicity, if the above loop didn't find specific variable costs,
  // and there's a generic percentage COGS, we might use that.
  // However, the above loop already tries to convert generic percentage COGS.
  // For now, the logic is: sum up all FixedAmount variable costs linked to primary,
  // and convert PercentageOfRevenue variable costs (linked or generic) to an amount based on primary price.

  if (averageSellingPricePerUnit <= averageVariableCostPerUnit) {
    calculationPossible = false;
    errorMessage = "Selling price per unit must be greater than variable cost per unit.";
    if (averageSellingPricePerUnit <=0) errorMessage = "Selling price per unit must be greater than zero."; // More specific
    return { breakEvenUnits: 0, breakEvenRevenue: 0, averageSellingPricePerUnit, averageVariableCostPerUnit, estimatedMonthlyFixedCosts, analysisBasis: "", calculationPossible, errorMessage };
  }

  const contributionMarginPerUnit = averageSellingPricePerUnit - averageVariableCostPerUnit;
  
  let breakEvenUnits = 0;
  if (contributionMarginPerUnit > 0) {
      breakEvenUnits = estimatedMonthlyFixedCosts / contributionMarginPerUnit;
  } else {
      // This case should be caught by "Selling price <= Variable cost" check, but as a fallback:
      calculationPossible = false;
      errorMessage = "Contribution margin is zero or negative. Break-even cannot be reached with current inputs.";
      // If fixed costs are also zero, technically BE is 0 units, but it's a trivial case.
      if(estimatedMonthlyFixedCosts === 0 && contributionMarginPerUnit === 0) {
        breakEvenUnits = 0; // Or handle as an edge case.
        calculationPossible = true; // Technically possible if no costs.
        errorMessage = "No fixed costs and zero contribution margin. Break-even is at 0 units (trivial).";
      }
  }

  const breakEvenRevenue = breakEvenUnits * averageSellingPricePerUnit;

  return {
    breakEvenUnits: calculationPossible ? Math.ceil(breakEvenUnits) : 0, // Round up units
    breakEvenRevenue: calculationPossible ? breakEvenRevenue : 0,
    averageSellingPricePerUnit,
    averageVariableCostPerUnit,
    estimatedMonthlyFixedCosts,
    analysisBasis: `Based on the first revenue source ("${primaryRevenueSource.name}") and associated variable costs. Fixed costs are approximated from total initial monthly OPEX and fixed monthly direct costs from COGS.`,
    calculationPossible,
    errorMessage
  };
};

export const gatherAssumptions = (projectData) => {
  const { setup, revenue, cogs, opex, financing, taxRate } = projectData;
  const assumptions = [];

  // General Setup
  const generalItems = [];
  if (setup) {
    generalItems.push({ label: "Projection Period", value: `${setup.projectionPeriodYears} Year(s)` });
    generalItems.push({ label: "Industry", value: `${setup.industryType}${setup.businessSubType ? ` (${setup.businessSubType})` : ''}` });
    if (setup.businessName) {
      generalItems.push({ label: "Business Name", value: setup.businessName });
    }
  }
  if (generalItems.length > 0) {
    assumptions.push({ category: "General Setup", items: generalItems });
  }

  // Revenue Sources
  if (revenue && revenue.sources) {
    revenue.sources.forEach((source, index) => {
      if (source.name || source.price > 0 || source.initialVolume > 0) { // Only list if somewhat filled
        const revenueSourceItems = [];
        revenueSourceItems.push({ label: "Pricing Strategy", value: source.pricingStrategy === "UnitPrice" ? "Unit Price" : "Subscription Price" });
        revenueSourceItems.push({ label: "Price", value: `$${parseFloat(source.price || 0).toLocaleString()}` });
        revenueSourceItems.push({ label: "Initial Volume/Subscribers", value: `${parseFloat(source.initialVolume || 0).toLocaleString()} /month` });
        revenueSourceItems.push({ label: "Monthly Growth Rate", value: `${(parseFloat(source.monthlyGrowthRate || 0) * 100).toFixed(1)}%` });
        if (source.applyQ4Uplift) {
          revenueSourceItems.push({ label: "Q4 Uplift on Volume", value: `+${(parseFloat(source.q4UpliftPercentage || 0) * 100).toFixed(1)}%` });
        }
        assumptions.push({ category: `Revenue: ${source.name || `Source ${index + 1}`}`, items: revenueSourceItems });
      }
    });
  }

  // COGS (Simplified: list a few key aspects if present)
  if (cogs && cogs.items && cogs.items.some(item => item.description || item.variableCostValue > 0 || item.otherDirectCostsMonthly > 0)) {
    const cogsCategoryItems = [];
    cogs.items.forEach((item, index) => {
        if (item.description || item.variableCostValue > 0 || item.otherDirectCostsMonthly > 0) {
            let cogsDesc = `${item.description || `Cost Item ${index + 1}`}: `;
            if (item.variableCostType === "PercentageOfRevenue") {
                cogsDesc += `${(item.variableCostValue * 100).toFixed(1)}% of Revenue`;
            } else {
                cogsDesc += `$${parseFloat(item.variableCostValue || 0).toLocaleString()} per Unit/Sub`;
            }
            if (item.otherDirectCostsMonthly > 0) {
                cogsDesc += ` + $${parseFloat(item.otherDirectCostsMonthly).toLocaleString()}/month fixed`;
            }
            cogsCategoryItems.push({label: `Item ${index + 1}`, value: cogsDesc});
        }
    });
    if(cogsCategoryItems.length > 0) {
        assumptions.push({ category: "Cost of Goods Sold (COGS)", items: cogsCategoryItems });
    }
  }


  // Operating Expenses
  if (opex && opex.items) {
    const opexCategoryItems = [];
    opex.items.forEach(item => {
      if (item.name && (item.amount > 0 || item.annualGrowthRate > 0)) { // Only list if has amount or growth
        opexCategoryItems.push({ 
            label: `${item.name} (Initial Monthly)`, 
            value: `$${parseFloat(item.amount || 0).toLocaleString()}, Annual Growth: ${(parseFloat(item.annualGrowthRate || 0) * 100).toFixed(1)}%` 
        });
      }
    });
    if (opexCategoryItems.length > 0) {
        assumptions.push({ category: "Operating Expenses", items: opexCategoryItems });
    }
  }

  // Financing
  const financingItems = [];
  if (financing) {
    if (financing.ownersInvestment > 0) {
      financingItems.push({ label: "Owner's Investment", value: `$${parseFloat(financing.ownersInvestment || 0).toLocaleString()}` });
    }
    if (financing.loan && financing.loan.amount > 0) {
      financingItems.push({ label: "Loan Amount", value: `$${parseFloat(financing.loan.amount || 0).toLocaleString()}` });
      financingItems.push({ label: "Loan Annual Interest Rate", value: `${(parseFloat(financing.loan.annualInterestRate || 0) * 100).toFixed(2)}%` });
      financingItems.push({ label: "Loan Term", value: `${financing.loan.termYears} Year(s)` });
    }
  }
  if (financingItems.length > 0) {
    assumptions.push({ category: "Financing", items: financingItems });
  }

  // Tax
  assumptions.push({ category: "Taxation", items: [{ label: "Flat Tax Rate", value: `${(parseFloat(taxRate || 0) * 100).toFixed(1)}%` }] });

  return assumptions;
};