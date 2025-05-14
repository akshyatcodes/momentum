// src/data/industryTemplates.js

export const industryTemplates = {
  "Service": {
    description: "Businesses providing expertise, labor, or specific services.",
    exampleRevenueStreams: [ // General service defaults
      {
        name: "General Consulting",
        pricingStrategy: "UnitPrice",
        price: 100,
        initialVolume: 15,
        monthlyGrowthRate: 0.01,
        applyQ4Uplift: false,
        q4UpliftPercentage: 0,
      },
    ],
    exampleCogs: [],
    // NEW OPEX STRUCTURE
    exampleOpex: [
      { name: "Salaries & Wages", amount: 4000, annualGrowthRate: 0.03 },
      { name: "Rent & Utilities", amount: 700, annualGrowthRate: 0.025 },
      { name: "Marketing & Advertising", amount: 400, annualGrowthRate: 0.05 },
      { name: "Software & Tools", amount: 200, annualGrowthRate: 0.02 },
      { name: "Other Operating Expenses", amount: 100, annualGrowthRate: 0.02 },
    ],
    typicalTaxRate: 0.20,
    // NEW: Sub-types for Service industry
    subTypes: {
      "Screening and Diagnostic Imaging": {
        description: "Healthcare services focused on medical imaging and diagnostics (e.g., X-ray, MRI, Ultrasound).",
        exampleRevenueStreams: [
          {
            name: "MRI Scans",
            pricingStrategy: "UnitPrice",
            price: 500,
            initialVolume: 50, // Number of scans per month
            monthlyGrowthRate: 0.02,
            applyQ4Uplift: false,
            q4UpliftPercentage: 0,
          },
          {
            name: "X-Ray Procedures",
            pricingStrategy: "UnitPrice",
            price: 150,
            initialVolume: 120,
            monthlyGrowthRate: 0.03,
            applyQ4Uplift: false,
            q4UpliftPercentage: 0,
          },
          {
            name: "Ultrasound Exams",
            pricingStrategy: "UnitPrice",
            price: 250,
            initialVolume: 80,
            monthlyGrowthRate: 0.025,
            applyQ4Uplift: false,
            q4UpliftPercentage: 0,
          },
        ],
        exampleCogs: [ // Cost directly related to performing scans
          {
            // This is a general COGS for all revenue for simplicity here.
            // In a real scenario, you might link specific COGS to specific revenue streams.
            // For this example, let's assume some average supply cost per procedure.
            revenueStreamNameMatch: "ALL", // Special keyword, or apply to primary
            variableCostPerUnitOrSub: 30, // e.g., contrast agents, films, disposable supplies per procedure
            variableCostType: "FixedAmount",
            otherDirectCostsMonthly: 1000, // e.g., specific software licenses for imaging machines
          }
        ],
        // NEW OPEX STRUCTURE
        exampleOpex: [
          { name: "Salaries & Wages (Clinical & Admin)", amount: 25000, annualGrowthRate: 0.04 },
          { name: "Rent & Utilities (Clinic Space)", amount: 5000, annualGrowthRate: 0.02 },
          { name: "Marketing & Referrals", amount: 2000, annualGrowthRate: 0.05 },
          { name: "Software (PACS, Billing)", amount: 1500, annualGrowthRate: 0.03 },
          { name: "Insurance & Compliance", amount: 2000, annualGrowthRate: 0.03 },
          { name: "Equipment Maintenance & Supplies", amount: 1000, annualGrowthRate: 0.04 },
          { name: "Other Operating Expenses", amount: 800, annualGrowthRate: 0.02 },
        ],
        typicalTaxRate: 0.25,
      },
      // Add other Service sub-types here in the future
      // "Legal Services": { ... },
      // "IT Consulting": { ... },
    }
  },
  "Retail/E-commerce": {
    description: "Businesses selling physical products either in-store or online.",
    exampleRevenueStreams: [
      {
        name: "Online Product Sales",
        pricingStrategy: "UnitPrice",
        price: 75,
        initialVolume: 150,
        monthlyGrowthRate: 0.05,
        applyQ4Uplift: true,
        q4UpliftPercentage: 0.25,

      },
    ],
    exampleCogs: [
      {
        revenueStreamNameMatch: "Online Product Sales",
        variableCostPerUnitOrSub: 0.40,
        variableCostType: "PercentageOfRevenue",
        otherDirectCostsMonthly: 200,
      }
    ],
    exampleOpex: [
      { name: "Salaries & Wages", amount: 7000, annualGrowthRate: 0.03 },
      { name: "Rent & Utilities", amount: 2000, annualGrowthRate: 0.02 },
      { name: "Marketing & Advertising", amount: 1500, annualGrowthRate: 0.04 },
      { name: "Software & E-commerce Platform", amount: 600, annualGrowthRate: 0.05 },
      { name: "Shipping & Fulfillment (Fixed Portion)", amount: 300, annualGrowthRate: 0.03 },
      { name: "Other Operating Expenses", amount: 400, annualGrowthRate: 0.02 },
    ],
    typicalTaxRate: 0.22,
    // subTypes: { "Fashion Boutique": {...}, "Electronics Store": {...} } // Example for future
  },
  "SaaS": {
    description: "Software as a Service businesses providing access to software on a subscription basis.",
    exampleRevenueStreams: [
      {
        name: "Basic Plan Subscribers",
        pricingStrategy: "SubscriptionPrice",
        price: 29,
        initialVolume: 100,
        monthlyGrowthRate: 0.10,
        applyQ4Uplift: false,
        q4UpliftPercentage: 0,
      },
    ],
    exampleCogs: [
      {
        revenueStreamNameMatch: "Basic Plan Subscribers",
        variableCostPerUnitOrSub: 0.15,
        variableCostType: "PercentageOfRevenue",
        otherDirectCostsMonthly: 500,
      }
    ],
    exampleOpex: [
      { name: "Salaries & Wages (Dev, Sales, Support)", amount: 10000, annualGrowthRate: 0.05 },
      { name: "Rent & Utilities", amount: 1200, annualGrowthRate: 0.02 },
      { name: "Marketing & Advertising", amount: 2500, annualGrowthRate: 0.07 },
      { name: "Software & Tools (Dev, CRM)", amount: 800, annualGrowthRate: 0.04 },
      { name: "Infrastructure & Hosting (Fixed Portion)", amount: 700, annualGrowthRate: 0.05 },
      { name: "Other Operating Expenses", amount: 500, annualGrowthRate: 0.03 },
    ],
    typicalTaxRate: 0.25,
  },
  "Other": {
    description: "A general template for other business types.",
    exampleRevenueStreams: [
      {
        name: "General Revenue Stream 1",
        pricingStrategy: "UnitPrice",
        price: 100,
        initialVolume: 10,
        monthlyGrowthRate: 0.01,
        applyQ4Uplift: false,
        q4UpliftPercentage: 0,
      },
    ],
    exampleCogs: [],
    exampleOpex: [
      { name: "General Salaries", amount: 3000, annualGrowthRate: 0.02 },
      { name: "General Rent/Utilities", amount: 500, annualGrowthRate: 0.02 },
      { name: "General Marketing", amount: 300, annualGrowthRate: 0.02 },
      { name: "Other Operating Expenses", amount: 100, annualGrowthRate: 0.01 },
    ],
    typicalTaxRate: 0.21,
  }
};