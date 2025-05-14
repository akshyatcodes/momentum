# Momentum - The Intuitive Business Projection Launchpad (v1.0 - MVP)

**Momentum** is a client-side web application designed to empower non-financial users to create detailed financial projections and generate polished, investor-ready (aspirational for MVP) reports. This v1.0 release represents the Minimum Viable Product, focusing on core projection capabilities and establishing a foundation for future enhancements, including multi-scenario planning.

## Table of Contents

1.  [Overview](#overview)
2.  [Core Features (v1.0 MVP)](#core-features-v1.0-mvp)
3.  [Technology Stack](#technology-stack)
4.  [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Running Locally](#running-locally)
5.  [File Structure](#file-structure)
6.  [Key Functionality Walkthrough](#key-functionality-walkthrough)
    *   [Scenario Management (Basic)](#scenario-management-basic)
    *   [Data Input Sections](#data-input-sections)
    *   [Reports](#reports)
    *   [Data Persistence & Export](#data-persistence--export)
7.  ["Mock AI" - Guided Setup](#mock-ai---guided-setup)
8.  [PDF Report Generation](#pdf-report-generation)
9.  [Limitations of v1.0](#limitations-of-v10)
10. [Roadmap for v2 & Beyond (Conceptual)](#roadmap-for-v2--beyond-conceptual)
11. [Contributing (Placeholder)](#contributing-placeholder)
12. [License](#license)

## Overview

The primary goal of Momentum is to simplify the complex process of financial forecasting. Users can input data related to their business setup, revenue streams, costs (COGS & OPEX), capital expenditures, and financing to generate:

*   Profit & Loss (P&L) Statement
*   Cash Flow Statement
*   Balance Sheet (Simplified in v1)
*   Break-Even Analysis
*   Summary of Key Assumptions
*   Basic Key Performance Indicators (KPIs) 

The application operates entirely on the client-side for this MVP, utilizing browser local storage for data persistence.

## Core Features (v1.0 MVP)

*   **Guided Setup (Mock AI):** Industry and sub-type selection pre-fills forms with example data.
*   **Comprehensive Input Forms:**
    *   Initial Business Setup (Name, Period, Industry, Sub-type, Setup Mode)
    *   Revenue Forecast (Multiple sources, growth, Q4 uplift, basic advanced seasonality toggle)
    *   Cost of Goods Sold (COGS) (Multiple items, variable/fixed, linking to revenue sources)
    *   Operating Expenses (OPEX) (Standard & custom items, individual growth rates, headcount placeholder)
    *   Capital Expenditures (CapEx) (Asset purchases, useful life, salvage value for depreciation)
    *   Financing (Owner's investment, multiple loans with amortization & interest-only periods, equity/grant placeholders)
    *   Tax Rate Input
*   **Dynamic Financial Reports:**
    *   Monthly and Annual P&L Statement (includes EBITDA, Depreciation, EBIT)
    *   Monthly and Annual Cash Flow Statement (includes CapEx purchases)
    *   Monthly and Annual Balance Sheet (simplified: Cash, Fixed Assets Net, Loans, Equity)
    *   Break-Even Analysis (Units & Revenue)
    *   Key Assumptions Summary
    *   Basic KPI Display (Yet to be implemented)
*   **Data Management:**
    *   Automatic saving to Browser Local Storage.
    *   "Clear Section Data" for individual forms (re-applies template in Guided Mode).
    *   "Clear All Project Data" (clears all scenarios).
    *   (JSON Export/Import for full project data is a v2 consideration).
*   **PDF Report Generation:** Download a summary PDF of the active scenario's projections including key tables, charts (Revenue, Net Profit, Cash Balance), and summaries.
*   **User Interface:**
    *   Clean, intuitive UI built with React and Tailwind CSS.
    *   Sidebar navigation.
    *   Frosted glass effects on input cards.

## Technology Stack

*   **Frontend Framework:** React 18+ (with JSX)
*   **JavaScript:** ES6+
*   **Styling:** Tailwind CSS (via CDN)
*   **Charting:** Chart.js (via CDN)
*   **PDF Generation:** jsPDF & jsPDF-AutoTable (via CDN)
*   **Development Server/Build Tool:** Vite
*   **State Management:** React `useState`, `useMemo`, `useCallback` (within `App.jsx`)
*   **Data Persistence:** Browser `localStorage`

## Getting Started

### Prerequisites

*   A modern web browser (Chrome, Firefox, Edge, Safari recommended)
*   Node.js and npm (or yarn) for local development (to run Vite)

### Running Locally

1.  Clone this repository (if applicable, or download the source code).
    ```bash
    git clone https://github.com/akshyatcodes/momentum.git
    cd momentum-launchpad 
    ```
2.  Install development dependencies:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    or
    ```bash
    yarn dev
    ```
4.  Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

## File Structure
```
momentum-launchpad/
├── public/ # Static assets (e.g., favicon.ico)
├── src/
│ ├── components/ # React UI components
│ │ ├── common/ # Reusable common components (Modal, Tooltip)
│ │ ├── CapExForm.jsx
│ │ ├── CashFlowTable.jsx
│ │ ├── CogsForm.jsx
│ │ ├── ... (all other forms and display components)
│ │ └── SidebarNav.jsx
│ ├── data/ # Static data and templates
│ │ └── industryTemplates.js
│ ├── utils/ # Utility functions
│ │ ├── calculations.js # Core financial projection logic
│ │ └── pdfGenerator.js # PDF report generation logic
│ ├── App.jsx # Main application component, state management
│ └── main.jsx # React application entry point
├── .gitignore
├── index.html # Main HTML entry point, CDN links
├── package.json
├── README.md # This file
└── vite.config.js # Vite configuration
```

## Key Functionality Walkthrough

### Data Input Sections
Navigate using the sidebar:
1.  **Setup:** Define business basics, projection period, industry, and setup mode.
2.  **Revenue:** Detail income streams. Toggle "Advanced Seasonality" for global monthly adjustments or use per-item Q4 uplift.
3.  **COGS:** Define direct costs and link them to revenue sources.
4.  **OPEX:** List operating expenses. Toggle "Headcount-Based Salary" (calculation is a v2 TODO) or input salaries manually.
5.  **CapEx:** List major asset purchases for depreciation and cash flow impact.
6.  **Financing:** Input owner's investment and details for multiple loans. Define tax rate.

### Reports
Calculated reports available via the sidebar:
*   **P&L:** Profit & Loss statement.
*   **Cash Flow:** Cash Flow statement.
*   **Balance Sheet:** Simplified Balance Sheet.
*   **Break-Even:** Break-Even analysis.
*   **KPIs:** Basic Key Performance Indicators.
*   **Assumptions:** Summary of key inputs.

### Data Persistence & Export
*   All data for all scenarios is automatically saved to your browser's local storage as you make changes.
*   You can clear data for the current section of the active scenario or clear all project data (all scenarios).

## "Mock AI" - Guided Setup

When starting a new project or clearing a section in "Guided Setup" mode:
1.  Select an **Industry** (e.g., "Service", "Retail/E-commerce").
2.  If applicable, select a **Business Sub-Type** (e.g., "Dental Practice" under "Service").
3.  The application will pre-fill the Revenue, COGS, OPEX, and CapEx forms with typical example data for that industry/sub-type. This data serves as a starting point and can be fully edited.
4.  The example data is sourced from `src/data/industryTemplates.js`.

## PDF Report Generation

Click the "Download Report" button (available after projections are calculated for the active scenario) to generate a PDF summary. The PDF includes:
*   Cover Page
*   Key Metrics (Year 1)
*   Annual P&L, Cash Flow, and Balance Sheet tables
*   Key Financial Charts (Revenue, Net Profit, Cash Balance trends)
*   KPI Summary (Basic)
*   Key Assumptions List

## Limitations of v1.0

*   **Client-Side Only:** No cloud storage or user accounts.
*   **Simplified Models:** AR/AP, Inventory, and detailed Headcount calculations are placeholders for v2.
*   **Scenario Features:** Basic add/switch/delete. Advanced features like renaming, duplication, or direct comparison are for v2.
*   **Mock AI Simplicity:** Templates are static; no dynamic learning.
*   **No Automated Tests.**
*   **Limited PDF Customization.**
*   **Onboarding tour is a placeholder.**

## Roadmap for v2 & Beyond (Conceptual)

*   **Enhanced Financial Engine:** Full AR/AP/Inventory integration, detailed headcount module, equity/grant financing, advanced loan options.
*   **UI/UX Improvements:** Interactive charts, real-time "what-if" sliders, improved navigation, customizable PDF, user onboarding tour, dark mode.
*   **Advanced Features:** True LLM integration (long-term), sensitivity analysis, comprehensive KPI tracking.
*   **Technical:** State management refinement (if needed), unit/integration testing, error boundaries.
*   *(Refer to the detailed v2 feature list for more.)*


---
Copyright (c) [2025] [Akshyat Sharma FCCA]
