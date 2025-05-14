// src/data/industryTemplates.js (v1 Snapshot Version)

// Helper for consistency in creating OPEX items within templates for v1 structure
const createOpexItemV1 = (name, amount, annualGrowthRate = 0.03) => ({ name, amount, annualGrowthRate });

export const industryTemplates = {
  "Service": {
    description: "Businesses providing expertise, labor, or specific services.",
    exampleRevenueStreams: [
      { name: "General Consulting", pricingStrategy: "UnitPrice", price: 100, initialVolume: 15, monthlyGrowthRate: 0.01, applyQ4Uplift: false, q4UpliftPercentage: 0 },
      { name: "Project Work", pricingStrategy: "UnitPrice", price: 1500, initialVolume: 2, monthlyGrowthRate: 0.02, applyQ4Uplift: false, q4UpliftPercentage: 0 },
    ],
    exampleCogs: [
      { description: "Subcontractor Fees", revenueStreamNameMatch: "General Consulting", variableCostType: "PercentageOfRevenue", variableCostValue: 0.25, otherDirectCostsMonthly: 0 },
    ],
    exampleOpex: [ // Array of objects
      createOpexItemV1("Salaries & Wages (Admin)", 3500, 0.03),
      createOpexItemV1("Rent & Utilities", 600, 0.02),
      createOpexItemV1("Marketing & Advertising", 300, 0.05),
      createOpexItemV1("Software & Tools", 150, 0.04),
      createOpexItemV1("Other Operating Expenses", 100, 0.02),
    ],
    typicalTaxRate: 0.20,
    subTypes: {
      "Dental Practice": {
        description: "General and specialized dental care services.",
        exampleRevenueStreams: [
          { name: "Routine Checkups & Cleanings", pricingStrategy: "UnitPrice", price: 150, initialVolume: 80, monthlyGrowthRate: 0.01 },
          { name: "Fillings (Average)", pricingStrategy: "UnitPrice", price: 250, initialVolume: 30, monthlyGrowthRate: 0.015 },
          { name: "Cosmetic Procedures (Average)", pricingStrategy: "UnitPrice", price: 500, initialVolume: 5, monthlyGrowthRate: 0.02 },
        ],
        exampleCogs: [
          { description: "Dental Supplies (per procedure avg)", variableCostType: "FixedAmount", variableCostValue: 20, otherDirectCostsMonthly: 100 },
          { description: "Lab Fees (avg % of related revenue)", variableCostType: "PercentageOfRevenue", variableCostValue: 0.15 },
        ],
        exampleOpex: [
          createOpexItemV1("Dentist/Hygienist Salaries", 10000, 0.03),
          createOpexItemV1("Admin/Reception Salaries", 3500, 0.025),
          createOpexItemV1("Office Rent & Utilities", 2500, 0.02),
          createOpexItemV1("Dental Equipment Maintenance", 300, 0.03),
          createOpexItemV1("Marketing", 800, 0.04),
          createOpexItemV1("Insurance (Malpractice)", 500, 0.03),
          createOpexItemV1("Other Operating Expenses", 400, 0.02),
        ],
        typicalTaxRate: 0.23,
      },
      "Physiotherapy Clinic": {
        description: "Physical therapy and rehabilitation services.",
        exampleRevenueStreams: [
          { name: "Individual Therapy Sessions", pricingStrategy: "UnitPrice", price: 90, initialVolume: 100, monthlyGrowthRate: 0.02 },
          { name: "Group Therapy Classes", pricingStrategy: "UnitPrice", price: 40, initialVolume: 30, monthlyGrowthRate: 0.03 }, // Per participant
          { name: "Specialized Equipment Use Fees", pricingStrategy: "UnitPrice", price: 25, initialVolume: 50, monthlyGrowthRate: 0.01 },
        ],
        exampleCogs: [ // Cost of services can be minimal if mainly labor
          { description: "Therapy Supplies (bands, tape, etc.)", variableCostType: "FixedAmount", variableCostValue: 5, otherDirectCostsMonthly: 50 },
        ],
        exampleOpex: [
          createOpexItemV1("Physiotherapist Salaries", 8000, 0.03),
          createOpexItemV1("Admin & Support Staff", 3000, 0.025),
          createOpexItemV1("Clinic Rent & Utilities", 2000, 0.02),
          createOpexItemV1("Equipment Lease/Maintenance", 400, 0.03),
          createOpexItemV1("Marketing & Referrals", 600, 0.04),
          createOpexItemV1("Professional Insurance", 300, 0.03),
          createOpexItemV1("Other Operating Expenses", 250, 0.02),
        ],
        typicalTaxRate: 0.22,
      },
      "Veterinary Clinic (Small Animal)": {
        description: "Medical care services for companion animals.",
        exampleRevenueStreams: [
          { name: "Wellness Exams & Vaccinations", pricingStrategy: "UnitPrice", price: 75, initialVolume: 120, monthlyGrowthRate: 0.015 },
          { name: "Sick Pet Visits (Average)", pricingStrategy: "UnitPrice", price: 120, initialVolume: 60, monthlyGrowthRate: 0.02 },
          { name: "Surgical Procedures (Average)", pricingStrategy: "UnitPrice", price: 600, initialVolume: 10, monthlyGrowthRate: 0.01 },
          { name: "Medication & Product Sales", pricingStrategy: "UnitPrice", price: 50, initialVolume: 80, monthlyGrowthRate: 0.02 }, // Avg sale value
        ],
        exampleCogs: [
          { description: "Medical Supplies & Disposables", revenueStreamNameMatch: "Wellness Exams & Vaccinations", variableCostType: "FixedAmount", variableCostValue: 15, otherDirectCostsMonthly: 200 },
          { description: "Cost of Medications/Products Sold", revenueStreamNameMatch: "Medication & Product Sales", variableCostType: "PercentageOfRevenue", variableCostValue: 0.50 }, // 50% margin
          { description: "Lab Fees (Outsourced)", variableCostType: "FixedAmount", variableCostValue: 30, otherDirectCostsMonthly: 0 }, // Per test, general
        ],
        exampleOpex: [
          createOpexItemV1("Veterinarian Salaries/Draw", 9000, 0.03),
          createOpexItemV1("Vet Tech & Assistant Salaries", 6000, 0.03),
          createOpexItemV1("Reception & Admin Salaries", 3500, 0.025),
          createOpexItemV1("Clinic Rent & Utilities", 2800, 0.02),
          createOpexItemV1("Medical Equipment Maintenance", 350, 0.03),
          createOpexItemV1("Marketing & Client Communication", 700, 0.04),
          createOpexItemV1("Insurance (Liability, Property)", 600, 0.03),
          createOpexItemV1("Other Operating Expenses", 450, 0.02),
        ],
        typicalTaxRate: 0.22,
      },
    }
  },
  "Retail/E-commerce": {
    description: "Businesses selling physical products either in-store or online.",
    exampleRevenueStreams: [
      { name: "Online Product Category A", pricingStrategy: "UnitPrice", price: 60, initialVolume: 120, monthlyGrowthRate: 0.04, applyQ4Uplift: true, q4UpliftPercentage: 0.20 },
      { name: "In-Store Product Category B", pricingStrategy: "UnitPrice", price: 45, initialVolume: 80, monthlyGrowthRate: 0.02, applyQ4Uplift: true, q4UpliftPercentage: 0.15 },
    ],
    exampleCogs: [
      { description: "Cost of Goods (Online A)", revenueStreamNameMatch: "Online Product Category A", variableCostType: "PercentageOfRevenue", variableCostValue: 0.45, otherDirectCostsMonthly: 150 },
      { description: "Cost of Goods (In-Store B)", revenueStreamNameMatch: "In-Store Product Category B", variableCostType: "PercentageOfRevenue", variableCostValue: 0.50, otherDirectCostsMonthly: 80 },
    ],
    exampleOpex: [
      createOpexItemV1("Staff Salaries (Retail & Online Support)", 6500, 0.03),
      createOpexItemV1("Rent & Utilities (Store/Warehouse)", 2200, 0.02),
      createOpexItemV1("Marketing (Digital & Local)", 1200, 0.05),
      createOpexItemV1("E-commerce Platform & POS Software", 500, 0.04),
      createOpexItemV1("Payment Processing Fees", 0, 0), // Often % of revenue, can be COGS
      createOpexItemV1("Other Operating Expenses", 350, 0.02),
    ],
    typicalTaxRate: 0.22,
    subTypes: {
      "Apparel Boutique": {
        description: "Sells clothing, accessories, and footwear.",
        exampleRevenueStreams: [ { name: "Clothing Sales", price: 80, initialVolume: 100, monthlyGrowthRate: 0.03, q4UpliftPercentage: 0.30, applyQ4Uplift: true }, { name: "Accessory Sales", price: 40, initialVolume: 150, monthlyGrowthRate: 0.02, q4UpliftPercentage: 0.20, applyQ4Uplift: true } ],
        exampleCogs: [ { description: "Cost of Apparel", revenueStreamNameMatch: "Clothing Sales", variableCostType: "PercentageOfRevenue", variableCostValue: 0.40 }, { description: "Cost of Accessories", revenueStreamNameMatch: "Accessory Sales", variableCostType: "PercentageOfRevenue", variableCostValue: 0.35 } ],
        exampleOpex: [ createOpexItemV1("Store Staff Salaries", 4500), createOpexItemV1("Boutique Rent", 1800), createOpexItemV1("Visual Merchandising", 200), createOpexItemV1("Other Expenses", 300) ],
        typicalTaxRate: 0.21,
      },
      "Specialty Food Store": {
        description: "Sells gourmet, organic, or specialty food items.",
        exampleRevenueStreams: [ { name: "Packaged Goods Sales", price: 25, initialVolume: 300, monthlyGrowthRate: 0.02, q4UpliftPercentage: 0.25, applyQ4Uplift: true }, { name: "Fresh/Deli Counter Sales", price: 15, initialVolume: 200, monthlyGrowthRate: 0.015, q4UpliftPercentage: 0.15, applyQ4Uplift: true } ],
        exampleCogs: [ { description: "Cost of Packaged Goods", revenueStreamNameMatch: "Packaged Goods Sales", variableCostType: "PercentageOfRevenue", variableCostValue: 0.55 }, { description: "Cost of Fresh/Deli Items (Spoilage incl.)", revenueStreamNameMatch: "Fresh/Deli Counter Sales", variableCostType: "PercentageOfRevenue", variableCostValue: 0.65 } ],
        exampleOpex: [ createOpexItemV1("Staff Salaries", 5000), createOpexItemV1("Store Rent & Refrigeration", 2200), createOpexItemV1("Marketing & Local Events", 400), createOpexItemV1("Other Expenses", 350) ],
        typicalTaxRate: 0.22,
      },
      "Online Electronics Gadget Store": {
        description: "E-commerce store selling consumer electronics and gadgets.",
        exampleRevenueStreams: [ { name: "Gadget Sales (Avg Price)", price: 150, initialVolume: 80, monthlyGrowthRate: 0.06, q4UpliftPercentage: 0.35, applyQ4Uplift: true }, { name: "Accessory & Cable Sales", price: 20, initialVolume: 200, monthlyGrowthRate: 0.04, q4UpliftPercentage: 0.20, applyQ4Uplift: true } ],
        exampleCogs: [ { description: "Cost of Gadgets", revenueStreamNameMatch: "Gadget Sales (Avg Price)", variableCostType: "PercentageOfRevenue", variableCostValue: 0.60 }, { description: "Cost of Accessories", revenueStreamNameMatch: "Accessory & Cable Sales", variableCostType: "PercentageOfRevenue", variableCostValue: 0.40 } ],
        exampleOpex: [ createOpexItemV1("Customer Support & Order Fulfillment Staff", 4000), createOpexItemV1("Digital Marketing (PPC, Affiliates)", 2500), createOpexItemV1("E-commerce Platform & Security", 600), createOpexItemV1("Shipping Subsidies/Costs not in COGS", 300), createOpexItemV1("Other Expenses", 200) ],
        typicalTaxRate: 0.20,
      }
    }
  },
  "SaaS (Software as a Service)": { // Renamed for clarity
    description: "Businesses providing access to software on a subscription basis.",
    exampleRevenueStreams: [
      { name: "Basic Monthly Plan", pricingStrategy: "SubscriptionPrice", price: 25, initialVolume: 150, monthlyGrowthRate: 0.08, applyQ4Uplift: false },
      { name: "Pro Annual Plan (Avg Monthly)", pricingStrategy: "SubscriptionPrice", price: 79, initialVolume: 40, monthlyGrowthRate: 0.06, applyQ4Uplift: false }, // Price is effective monthly
    ],
    exampleCogs: [ // Cost of Service Delivery
      { description: "Hosting & Infrastructure (Variable)", variableCostType: "PercentageOfRevenue", variableCostValue: 0.10, otherDirectCostsMonthly: 600 }, // Fixed portion in otherDirectCosts
      { description: "Third-Party API Costs (per user avg)", variableCostType: "FixedAmount", variableCostValue: 1.00, otherDirectCostsMonthly: 150 },
    ],
    exampleOpex: [
      createOpexItemV1("Salaries (Dev, Product, Sales, CS)", 12000, 0.06),
      createOpexItemV1("Marketing & Sales Spend", 2800, 0.08),
      createOpexItemV1("Software & Tools (DevOps, CRM)", 900, 0.05),
      createOpexItemV1("G&A (Rent, Legal, Admin if not in salaries)", 1800, 0.03),
      createOpexItemV1("Other Operating Expenses", 600, 0.03),
    ],
    typicalTaxRate: 0.18,
    subTypes: {
      "CRM SaaS for Small Business": {
        description: "CRM software tailored for small business needs.",
        exampleRevenueStreams: [ { name: "Starter Plan", price: 49, initialVolume: 100, monthlyGrowthRate: 0.12 }, { name: "Business Plan", price: 99, initialVolume: 30, monthlyGrowthRate: 0.08 } ],
        exampleCogs: [ { description: "Hosting & Core APIs", variableCostType: "PercentageOfRevenue", variableCostValue: 0.15, otherDirectCostsMonthly: 700 } ],
        exampleOpex: [ createOpexItemV1("Development Team", 8000), createOpexItemV1("Sales & Marketing Team", 5000), createOpexItemV1("Customer Support", 3000), createOpexItemV1("Other G&A", 1500) ],
        typicalTaxRate: 0.19,
      },
      "Niche Analytics SaaS": {
        description: "Specialized analytics platform for a specific industry.",
        exampleRevenueStreams: [ { name: "Standard Tier", price: 199, initialVolume: 20, monthlyGrowthRate: 0.07 }, { name: "Enterprise Tier", price: 799, initialVolume: 5, monthlyGrowthRate: 0.04 } ],
        exampleCogs: [ { description: "Data Processing & Hosting", variableCostType: "PercentageOfRevenue", variableCostValue: 0.20, otherDirectCostsMonthly: 1000 } ],
        exampleOpex: [ createOpexItemV1("Data Scientists & Engineers", 12000), createOpexItemV1("Sales & Account Management", 6000), createOpexItemV1("Marketing (Content, Niche Ads)", 3000), createOpexItemV1("Other G&A", 2000) ],
        typicalTaxRate: 0.17,
      },
      "Productivity Tool SaaS": {
        description: "Software aimed at improving individual or team productivity.",
        exampleRevenueStreams: [ { name: "Individual Pro Plan", price: 12, initialVolume: 500, monthlyGrowthRate: 0.15 }, { name: "Team Plan (per seat)", price: 10, initialVolume: 100, monthlyGrowthRate: 0.10 } ], // Volume for team plan is number of seats
        exampleCogs: [ { description: "Core Infrastructure", variableCostType: "PercentageOfRevenue", variableCostValue: 0.08, otherDirectCostsMonthly: 400 } ],
        exampleOpex: [ createOpexItemV1("Development & Design", 7000), createOpexItemV1("Marketing (Viral, Content)", 4000), createOpexItemV1("Support (mostly automated)", 1500), createOpexItemV1("Other G&A", 1000) ],
        typicalTaxRate: 0.20,
      }
    }
  },
  "Manufacturing": {
    description: "Businesses producing physical goods from raw materials.",
    exampleRevenueStreams: [ { name: "Product Line A Sales", pricingStrategy: "UnitPrice", price: 200, initialVolume: 300, monthlyGrowthRate: 0.025 }, { name: "Custom Orders (Avg)", pricingStrategy: "UnitPrice", price: 5000, initialVolume: 5, monthlyGrowthRate: 0.01 } ],
    exampleCogs: [
        { description: "Raw Materials (Product A)", revenueStreamNameMatch: "Product Line A Sales", variableCostType: "FixedAmount", variableCostValue: 60 },
        { description: "Direct Labor (Product A)", revenueStreamNameMatch: "Product Line A Sales", variableCostType: "FixedAmount", variableCostValue: 30 },
        { description: "Factory Overhead (Variable Portion)", variableCostType: "PercentageOfRevenue", variableCostValue: 0.10, otherDirectCostsMonthly: 4000 },
    ],
    exampleOpex: [ 
        createOpexItemV1("Management & Supervisor Salaries", 10000, 0.03),
        createOpexItemV1("Sales & Admin Staff Salaries", 7000, 0.025),
        createOpexItemV1("Rent/Mortgage on Factory & Office", 6000, 0.015),
        createOpexItemV1("Marketing & Sales Activities", 2500, 0.04),
        createOpexItemV1("Other Operating Expenses", 1500, 0.02),
    ],
    typicalTaxRate: 0.24,
    subTypes: {
        "Custom Metal Fabrication": {
            description: "Creates custom metal parts and structures based on client specifications.",
            exampleRevenueStreams: [ { name: "Small Custom Jobs (avg)", price: 1500, initialVolume: 10, monthlyGrowthRate: 0.02 }, { name: "Large Fabrication Projects (avg)", price: 25000, initialVolume: 1, monthlyGrowthRate: 0.01 } ],
            exampleCogs: [ { description: "Raw Metal (Steel, Aluminum)", variableCostType: "PercentageOfRevenue", variableCostValue: 0.30 }, { description: "Welding & Machining Labor (Direct)", variableCostType: "PercentageOfRevenue", variableCostValue: 0.25 }, {description: "Shop Supplies & Consumables", otherDirectCostsMonthly: 500} ],
            exampleOpex: [ createOpexItemV1("Shop Manager & Welders (fixed salary portion)", 10000), createOpexItemV1("Admin & Sales", 4000), createOpexItemV1("Shop Rent & Utilities", 3000) ],
            typicalTaxRate: 0.23,
        },
        "Artisan Bakery (Wholesale)": {
            description: "Produces and sells baked goods to cafes, restaurants, and retailers.",
            exampleRevenueStreams: [ { name: "Bread Loaves (Wholesale)", price: 3.50, initialVolume: 2000, monthlyGrowthRate: 0.03 }, { name: "Pastries (Wholesale - per dozen)", price: 18, initialVolume: 300, monthlyGrowthRate: 0.02 } ],
            exampleCogs: [ { description: "Flour & Ingredients", variableCostType: "PercentageOfRevenue", variableCostValue: 0.35 }, { description: "Packaging", variableCostType: "FixedAmount", variableCostValue: 0.20 } ], // Per unit/dozen
            exampleOpex: [ createOpexItemV1("Bakers & Delivery Staff Salaries", 7000), createOpexItemV1("Kitchen Rent & Utilities", 2500), createOpexItemV1("Vehicle Expenses", 400) ],
            typicalTaxRate: 0.21,
        },
        "Small Batch Craft Brewery": {
            description: "Produces and distributes craft beer.",
            exampleRevenueStreams: [ { name: "Keg Sales to Bars (avg per keg)", price: 120, initialVolume: 50, monthlyGrowthRate: 0.04 }, { name: "Canned/Bottled Beer Sales (avg per case)", price: 30, initialVolume: 200, monthlyGrowthRate: 0.03 } ],
            exampleCogs: [ { description: "Malt, Hops, Yeast", variableCostType: "PercentageOfRevenue", variableCostValue: 0.25 }, { description: "Packaging (Cans/Bottles/Kegs)", variableCostType: "FixedAmount", variableCostValue: 5 } ], // Per case/keg
            exampleOpex: [ createOpexItemV1("Brewer & Staff Salaries", 8000), createOpexItemV1("Brewery Rent & Utilities", 3000), createOpexItemV1("Distribution & Sales Costs", 1500), createOpexItemV1("Licensing & Compliance", 300) ],
            typicalTaxRate: 0.25, // Higher taxes on alcohol often
        }
    }
  },
  "Other": { 
    description: "A general template for other business types.",
    exampleRevenueStreams: [ { name: "General Product/Service", pricingStrategy: "UnitPrice", price: 100, initialVolume: 20, monthlyGrowthRate: 0.01 } ],
    exampleCogs: [ { description: "Direct Cost of Sale", variableCostType: "PercentageOfRevenue", variableCostValue: 0.40, otherDirectCostsMonthly: 20 } ],
    exampleOpex: [ 
        createOpexItemV1("Salaries & Wages", 3000, 0.02), 
        createOpexItemV1("Rent/Utilities", 500, 0.015), 
        createOpexItemV1("Marketing", 250, 0.03),
        createOpexItemV1("Other Operating Expenses", 150, 0.01),
    ],
    typicalTaxRate: 0.21,
    subTypes: {
        "Non-Profit Organization (General)": {
            description: "General template for a non-profit focusing on program services.",
            exampleRevenueStreams: [ { name: "Grants & Donations (Projected Monthly Avg)", price: 5000, initialVolume: 1, monthlyGrowthRate: 0.005 }, { name: "Program Service Fees (if any)", price: 50, initialVolume: 20, monthlyGrowthRate: 0.01 } ],
            exampleCogs: [ { description: "Direct Program Supplies", revenueStreamNameMatch: "Program Service Fees (if any)", variableCostType: "FixedAmount", variableCostValue: 10 } ], // Costs directly tied to delivering fee-based service
            exampleOpex: [ createOpexItemV1("Program Staff Salaries", 6000), createOpexItemV1("Administrative Salaries", 3000), createOpexItemV1("Office Rent & Utilities", 1000), createOpexItemV1("Fundraising Expenses", 800), createOpexItemV1("Other Program Expenses", 500) ],
            typicalTaxRate: 0, // Non-profits are typically tax-exempt, but may pay UBIT
        },
        "Freelance Creative (e.g., Writer, Designer)": {
            description: "Individual providing creative services on a project or retainer basis.",
            exampleRevenueStreams: [ { name: "Project Fees (Avg per project)", price: 800, initialVolume: 3, monthlyGrowthRate: 0.02 }, { name: "Monthly Retainer Clients", price: 1000, initialVolume: 1, monthlyGrowthRate: 0.01, pricingStrategy: "SubscriptionPrice" } ],
            exampleCogs: [ { description: "Software Subscriptions (Direct Project Use)", variableCostType: "FixedAmount", variableCostValue: 20, otherDirectCostsMonthly: 50 } ], // e.g. Adobe CC if not in OPEX
            exampleOpex: [ createOpexItemV1("Home Office Utilities & Internet (Portion)", 100), createOpexItemV1("Marketing & Networking", 150), createOpexItemV1("Software (General Business)", 80), createOpexItemV1("Professional Development", 50), createOpexItemV1("Other Operating Expenses", 70) ],
            typicalTaxRate: 0.15, // Self-employment tax + income tax
        },
        "Local Handyman Service": {
            description: "Provides general repair, maintenance, and installation services.",
            exampleRevenueStreams: [ { name: "Service Calls (Avg Job Value)", price: 250, initialVolume: 20, monthlyGrowthRate: 0.015 }, { name: "Small Installation Projects", price: 600, initialVolume: 4, monthlyGrowthRate: 0.01 } ],
            exampleCogs: [ { description: "Materials & Parts (Pass-through or % markup)", variableCostType: "PercentageOfRevenue", variableCostValue: 0.20 }, { description: "Fuel for Vehicle", variableCostType: "FixedAmount", variableCostValue: 10 } ], // Avg per job
            exampleOpex: [ createOpexItemV1("Self (Owner's Draw/Salary)", 3500), createOpexItemV1("Vehicle Maintenance & Insurance", 300), createOpexItemV1("Tool Maintenance/Replacement", 100), createOpexItemV1("Local Advertising (Flyers, Online)", 200), createOpexItemV1("Phone & Admin", 150) ],
            typicalTaxRate: 0.18,
        }
    }
  }
};
