// src/utils/pdfGenerator.js

// Helper to format currency for PDF (might be slightly different than display)
const formatPdfCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  const options = { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 };
  // For PDF, sometimes parentheses for negatives are preferred
  if (value < 0) {
    return `(${Math.abs(value).toLocaleString('en-US', options)})`.replace(/\$/g, ''); // Remove $ from inside parentheses
  }
  return value.toLocaleString('en-US', options);
};


// Helper to draw a chart to an offscreen canvas and return its data URL
// Chart.js must be globally available (from CDN)
const getChartDataUrl = async (chartConfig, width = 600, height = 300) => {
  return new Promise((resolve) => {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    // offscreenCanvas.style.display = 'none'; // Keep it off-screen
    // document.body.appendChild(offscreenCanvas); // Temporarily append to render

    const chartContext = offscreenCanvas.getContext('2d');
    const chart = new Chart(chartContext, chartConfig);

    // Chart.js rendering is asynchronous, wait for it to complete
    // A common trick is to use a short timeout or animation complete callback
    // For simplicity, a timeout, but for robustness, use chart.options.animation.onComplete
    setTimeout(() => {
        const dataUrl = chart.toBase64Image();
        chart.destroy(); // Important to free resources
        // document.body.removeChild(offscreenCanvas); // Clean up
        resolve(dataUrl);
    }, 500); // Adjust timeout if charts are complex or render slowly
  });
};


export const generatePdfReport = async (projectData) => {
  const { jsPDF } = window.jspdf; // Get jsPDF from global scope
  const doc = new jsPDF();

  const { setup, projections } = projectData;
  const { annualPnl, annualCashFlow, breakEven, assumptionsSummary } = projections;

  let yPos = 20; // Current Y position on the PDF page
  const pageHeight = doc.internal.pageSize.height;
  const leftMargin = 15;
  const rightMargin = doc.internal.pageSize.width - 15;
  const contentWidth = rightMargin - leftMargin;

  const checkNewPage = (neededHeight = 40) => {
    if (yPos + neededHeight > pageHeight - 20) { // 20 for bottom margin
      doc.addPage();
      yPos = 20;
    }
  };

  // --- 1. Cover Page ---
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(setup.businessName || "Financial Projections", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  yPos += 15;

  if (setup.logoDataUrl) {
    try {
        const imgProps = doc.getImageProperties(setup.logoDataUrl);
        const imgWidth = 50; // Max width for logo
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        doc.addImage(setup.logoDataUrl, 'PNG', (doc.internal.pageSize.width - imgWidth) / 2, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;
    } catch (e) {
        console.error("Error adding logo to PDF:", e);
        doc.setFontSize(10);
        doc.text("(Logo could not be loaded)", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
        yPos += 10;
    }
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Financial Projections Report", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  yPos += 20;
  checkNewPage();

  // --- 2. Key Metrics Summary (Year 1) ---
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Key Metrics Summary (Year 1)", leftMargin, yPos);
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  if (annualPnl && annualPnl.length > 0) {
    doc.text(`Total Revenue (Year 1): ${formatPdfCurrency(annualPnl[0].totalRevenue)}`, leftMargin, yPos); yPos += 7;
    doc.text(`Net Profit (Year 1): ${formatPdfCurrency(annualPnl[0].netProfit)}`, leftMargin, yPos); yPos += 7;
  }
  if (breakEven && breakEven.calculationPossible) {
    doc.text(`Break-Even Units (Monthly): ${breakEven.breakEvenUnits.toLocaleString()} units`, leftMargin, yPos); yPos += 7;
    doc.text(`Break-Even Revenue (Monthly): ${formatPdfCurrency(breakEven.breakEvenRevenue)}`, leftMargin, yPos); yPos += 7;
  }
  yPos += 10;
  checkNewPage();

  // --- 3. Simplified P&L Statement (Annual) ---
  doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text("Annual Profit & Loss Statement", leftMargin, yPos); yPos += 10;
  if (annualPnl && annualPnl.length > 0) {
    const pnlTableHead = [['Metric', ...annualPnl.map(a => `Year ${a.year}`)]];
    const pnlTableBody = [
      ["Total Revenue", ...annualPnl.map(a => formatPdfCurrency(a.totalRevenue))],
      ["COGS", ...annualPnl.map(a => formatPdfCurrency(a.totalCogs))],
      ["Gross Profit", ...annualPnl.map(a => formatPdfCurrency(a.grossProfit))],
      ["Operating Expenses (OPEX)", ...annualPnl.map(a => formatPdfCurrency(a.totalOpex))],
      ["Operating Profit (EBITDA)", ...annualPnl.map(a => formatPdfCurrency(a.operatingProfit))],
      ["Interest Expense", ...annualPnl.map(a => formatPdfCurrency(a.interestExpense))],
      ["Earnings Before Tax (EBT)", ...annualPnl.map(a => formatPdfCurrency(a.earningsBeforeTax))],
      ["Tax Amount", ...annualPnl.map(a => formatPdfCurrency(a.taxAmount))],
      ["Net Profit", ...annualPnl.map(a => formatPdfCurrency(a.netProfit))],
    ];
    doc.autoTable({
      startY: yPos, head: pnlTableHead, body: pnlTableBody,
      theme: 'striped', headStyles: { fillColor: [22, 160, 133] }, // Example theme
      didDrawPage: (data) => { yPos = data.cursor.y + 5; } // Update yPos after table
    });
    yPos += 10; // Add some space after the table (autoTable updates yPos)
  } else { doc.setFontSize(12); doc.text("P&L data not available.", leftMargin, yPos); yPos += 10; }
  checkNewPage();


  // --- 4. Simplified Cash Flow Statement (Annual) ---
  doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text("Annual Cash Flow Statement", leftMargin, yPos); yPos += 10;
  if (annualCashFlow && annualCashFlow.length > 0) {
    const cfTableHead = [['Metric', ...annualCashFlow.map(a => `Year ${a.year}`)]];
    const cfTableBody = [
        ["Starting Cash Balance", ...annualCashFlow.map(a => formatPdfCurrency(a.startingCashBalance))],
        ["Total Cash In", ...annualCashFlow.map(a => formatPdfCurrency(a.totalCashIn))],
        ["Total Cash Out", ...annualCashFlow.map(a => formatPdfCurrency(a.totalCashOut))],
        ["Net Cash Flow", ...annualCashFlow.map(a => formatPdfCurrency(a.netCashFlow))],
        ["Ending Cash Balance", ...annualCashFlow.map(a => formatPdfCurrency(a.endingCashBalance))],
    ];
    doc.autoTable({
        startY: yPos, head: cfTableHead, body: cfTableBody,
        theme: 'grid', headStyles: { fillColor: [41, 128, 185] },
        didDrawPage: (data) => { yPos = data.cursor.y + 5; }
    });
    yPos += 10;
  } else { doc.setFontSize(12); doc.text("Cash Flow data not available.", leftMargin, yPos); yPos += 10; }
  checkNewPage();


  // --- 5. Key Charts (Example: Revenue & Net Profit Trends) ---
  doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text("Key Financial Charts", leftMargin, yPos); yPos += 10;

  if (annualPnl && annualPnl.length > 0) {
    try {
        // Revenue Trend Chart
        const revenueChartConfig = {
            type: 'line',
            data: {
                labels: annualPnl.map(a => `Year ${a.year}`),
                datasets: [{
                    label: 'Total Annual Revenue',
                    data: annualPnl.map(a => a.totalRevenue),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: { responsive: false, animation: false, plugins: { title: { display: true, text: 'Annual Revenue Trend' } } } // Disable animation for faster image conversion
        };
        const revenueChartUrl = await getChartDataUrl(revenueChartConfig, contentWidth * 0.9 * (28.346/10), contentWidth * 0.5 * (28.346/10)); // A4 width approximation in pixels
        if (revenueChartUrl) {
            doc.addImage(revenueChartUrl, 'PNG', leftMargin, yPos, contentWidth * 0.9, contentWidth * 0.5);
            yPos += contentWidth * 0.5 + 10;
            checkNewPage(contentWidth * 0.5 + 10);
        }

        // Net Profit Trend Chart
        const netProfitChartConfig = { /* ... similar config for net profit ... */ 
            type: 'bar',
            data: {
                labels: annualPnl.map(a => `Year ${a.year}`),
                datasets: [{
                    label: 'Annual Net Profit',
                    data: annualPnl.map(a => a.netProfit),
                    backgroundColor: annualPnl.map(a => a.netProfit >= 0 ? 'rgba(75, 192, 192, 0.5)' : 'rgba(255, 99, 132, 0.5)'),
                    borderColor: annualPnl.map(a => a.netProfit >= 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'),
                    borderWidth: 1
                }]
            },
            options: { responsive: false, animation: false, plugins: { title: { display: true, text: 'Annual Net Profit' } } }
        };
        const netProfitChartUrl = await getChartDataUrl(netProfitChartConfig);
        if (netProfitChartUrl) {
            doc.addImage(netProfitChartUrl, 'PNG', leftMargin, yPos, contentWidth * 0.9, contentWidth * 0.5);
            yPos += contentWidth * 0.5 + 10;
        }
    } catch (chartError) {
        console.error("Error generating chart for PDF:", chartError);
        doc.setFontSize(10); doc.text("(Chart generation failed)", leftMargin, yPos); yPos += 10;
    }
  } else { doc.setFontSize(12); doc.text("Chart data not available.", leftMargin, yPos); yPos += 10; }
  checkNewPage();


  // --- 6. Assumptions Summary ---
  doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text("Key Assumptions", leftMargin, yPos); yPos += 10;
  doc.setFontSize(10); doc.setFont("helvetica", "normal");

  if (assumptionsSummary && assumptionsSummary.length > 0) {
    assumptionsSummary.forEach(category => {
      checkNewPage(category.items.length * 6 + 10); // Estimate height needed
      doc.setFont("helvetica", "bold");
      doc.text(category.category, leftMargin, yPos); yPos += 6;
      doc.setFont("helvetica", "normal");
      category.items.forEach(item => {
        checkNewPage(6);
        doc.text(`${item.label}: ${item.value}`, leftMargin + 5, yPos); yPos += 6;
      });
      yPos += 4; // Space between categories
    });
  } else { doc.text("Assumptions not available.", leftMargin, yPos); yPos += 10; }

  // --- Save the PDF ---
  doc.save(`${setup.businessName || 'FinancialProjections'}_Report.pdf`);
};