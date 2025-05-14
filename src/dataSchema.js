// src/dataSchema.js (for planning purposes)

const initialProjectionData = {
    setup: {
      businessName: "",
      projectionPeriodYears: 1, // 1 to 5
      industryType: "", // "Service", "Retail/E-commerce", etc.
      logoDataUrl: null, // For storing uploaded logo as base64
      setupMode: "Manual", // "Manual" or "Guided"
    },
    revenue: {
      sources: [
        // Example of one source, we can have up to 3-5
        // {
        //   id: 'rev1', // unique id
        //   name: "Product A Sales",
        //   pricingStrategy: "UnitPrice", // "UnitPrice", "SubscriptionPrice"
        //   price: 100, // unit or subscription price
        //   initialVolume: 50, // sales volume or #subscribers for starting month
        //   monthlyGrowthRate: 0.05, // 5%
        //   applyQ4Uplift: false,
        //   q4UpliftPercentage: 0.10, // 10%
        // },
      ],
    },
    cogs: {
      items: [
        // Example, linked to a revenue source by id
        // {
        //   id: 'cogs1',
        //   revenueSourceId: 'rev1', // links to revenue source
        //   variableCostPerUnitOrSub: 20, // fixed amount
        //   variableCostType: 'FixedAmount', // 'FixedAmount' or 'PercentageOfRevenue'
        //   otherDirectCostsMonthly: 100,
        // }
      ]
    },
    opex: {
      categories: {
        salariesAndWages: 0,
        rentAndUtilities: 0,
        marketingAndAdvertising: 0,
        softwareAndTools: 0,
        other: 0,
        // custom: [ {name: 'Custom Expense', amount: 0} ]
      },
      annualGrowthRate: 0.03, // 3% for total opex
    },
    financing: {
      ownersInvestment: 0,
      loans: [
        // {
        //   id: 'loan1',
        //   amount: 10000,
        //   annualInterestRate: 0.08, // 8%
        //   termYears: 3,
        // }
      ],
    },
    taxRate: 0.20, // 20% flat tax rate
    assumptions: { // This will be auto-populated from inputs
      // e.g. growthRates: [], taxRate: 0.20 etc.
    },
  
    // Calculated data will go here, or be derived on the fly
    // projections: {
    //   monthly: [], // array of monthly P&L, Cash Flow data
    //   annual: [],  // array of annual summaries
    //   breakEven: {}
    // }
  };
  
  // This is just a thought-starter. We'll refine it as we go!