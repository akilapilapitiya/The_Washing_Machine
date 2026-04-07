/**
 * Print a professional employee performance report
 * Matches the style of the payment receipt
 */
export const printEmployeePerformanceReport = (reportData, startDate, endDate) => {
  const totalJobs = reportData.reduce(
    (sum, r) => sum + parseInt(r.completed_jobs || 0),
    0,
  );
  const totalRevenue = reportData.reduce(
    (sum, r) => sum + parseFloat(r.total_revenue || 0),
    0,
  );

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-LK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const generatedAt = new Date().toLocaleString("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Build table rows
  let rowNumber = 0;
  const tableRows = reportData
    .map((r) => {
      rowNumber++;
      return `
        <tr class="data-row">
          <td class="cell cell-num">${rowNumber}</td>
          <td class="cell cell-emp" style="font-weight: 700; color: #111827;">
            ${r.empname}
            <div style="font-size: 10px; color: #6b7280; font-weight: 600; text-transform: uppercase;">${r.emptype}</div>
          </td>
          <td class="cell cell-jobs" style="text-align: center; font-weight: 600;">${r.completed_jobs}</td>
          <td class="cell cell-amount">Rs. ${Number(r.total_revenue).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>`;
    })
    .join("");

  const isSingleDay = startDate === endDate;
  const reportTitle = isSingleDay
    ? `Employee Performance — ${formatDate(startDate)}`
    : `Employee Performance — ${formatDate(startDate)} to ${formatDate(endDate)}`;

  const topPerformer = reportData.length > 0 ? reportData[0].empname : "N/A";

  const reportHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Employee Performance Report — The Washing Machine</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f9fafb;
            padding: 24px;
            color: #111827;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .report {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
          }

          /* ── Top Accent ── */
          .accent-bar {
            height: 5px;
            background: linear-gradient(90deg, #2563eb, #1e40af);
          }

          /* ── Header ── */
          .header {
            text-align: center;
            padding: 28px 32px 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          .header h1 {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #111827;
            margin-bottom: 2px;
          }
          .header .tagline {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2.5px;
            color: #2563eb;
            margin-bottom: 12px;
          }
          .header .address {
            font-size: 11px;
            color: #6b7280;
            line-height: 1.5;
          }
          .header .contact {
            font-size: 11px;
            color: #6b7280;
            margin-top: 4px;
          }

          /* ── Report Title ── */
          .report-title {
            padding: 20px 32px;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
          }
          .report-title h2 {
            font-size: 16px;
            font-weight: 800;
            color: #111827;
            letter-spacing: -0.3px;
          }
          .report-title .subtitle {
            font-size: 11px;
            color: #6b7280;
            margin-top: 2px;
          }

          /* ── Summary Cards ── */
          .summary {
            display: flex;
            gap: 16px;
            padding: 20px 32px;
            border-bottom: 1px solid #e5e7eb;
          }
          .summary-card {
            flex: 1;
            padding: 16px 20px;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
          }
          .summary-card.mvp {
            background: linear-gradient(135deg, #fefce8, #fff);
            border-color: #fef08a;
          }
          .summary-card.jobs {
            background: linear-gradient(135deg, #eff6ff, #fff);
            border-color: #bfdbfe;
          }
          .summary-card.staff {
            background: linear-gradient(135deg, #f3f4f6, #fff);
            border-color: #e5e7eb;
          }
          .summary-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #9ca3af;
            margin-bottom: 6px;
          }
          .summary-value {
            font-size: 22px;
            font-weight: 800;
            color: #111827;
            letter-spacing: -0.5px;
          }
          .summary-card.mvp .summary-value { color: #d97706; }
          .summary-card.jobs .summary-value { color: #2563eb; }
          .summary-card.staff .summary-value { color: #4b5563; }

          /* ── Table ── */
          .table-section {
            padding: 0;
          }
          .table-label {
            padding: 16px 32px 8px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #9ca3af;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table thead th {
            padding: 10px 12px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
          }
          table thead th:first-child { width: 36px; text-align: center; }
          table thead th:nth-child(3) { text-align: center; width: 120px; }
          table thead th:last-child { text-align: right; }

          .data-row .cell {
            padding: 12px 12px;
            font-size: 13px;
            color: #374151;
            border-bottom: 1px solid #f3f4f6;
          }
          .cell-num { text-align: center; color: #9ca3af; font-size: 11px; }
          .cell-amount { text-align: right; font-weight: 700; white-space: nowrap; color: #16a34a; }

          /* ── Grand Total ── */
          .grand-total {
            padding: 16px 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 2px solid #111827;
            background: #f9fafb;
          }
          .grand-total .label {
            font-size: 14px;
            font-weight: 800;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .grand-total .amount {
            font-size: 22px;
            font-weight: 800;
            color: #16a34a;
          }

          /* ── Footer ── */
          .footer {
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            padding: 20px 32px;
            text-align: center;
          }
          .footer .generated {
            font-size: 11px;
            font-weight: 500;
            color: #6b7280;
            margin-bottom: 12px;
          }
          .footer .brand-mark {
            display: inline-block;
            padding: 6px 16px;
            background: #111827;
            color: #ffffff;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            border-radius: 4px;
          }

          /* ── Print ── */
          @media print {
            body { background: #fff; padding: 0; }
            .report { border: none; box-shadow: none; border-radius: 0; }
            .accent-bar { display: none; }
            .summary-card { break-inside: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="report">
          <div class="accent-bar"></div>

          <!-- Header -->
          <div class="header">
            <h1>The Washing Machine</h1>
            <div class="tagline">Premium Auto Care Center</div>
            <div class="address">
              488, High Level Road, Pannipitiya<br>
              Colombo, Sri Lanka
            </div>
            <div class="contact">
              Tel: 077 350 7777 &nbsp;•&nbsp; info@thewashingmachine.lk
            </div>
          </div>

          <!-- Report Title -->
          <div class="report-title">
            <h2>${reportTitle}</h2>
            <div class="subtitle">Staff productivity and revenue generation summary</div>
          </div>

          <!-- Summary Cards -->
          <div class="summary">
            <div class="summary-card mvp">
              <div class="summary-label">Top Performer</div>
              <div class="summary-value">${topPerformer}</div>
            </div>
            <div class="summary-card jobs">
              <div class="summary-label">Total Jobs</div>
              <div class="summary-value">${totalJobs}</div>
            </div>
            <div class="summary-card staff">
              <div class="summary-label">Active Staff</div>
              <div class="summary-value">${reportData.length}</div>
            </div>
          </div>

          <!-- Transactions Table -->
          <div class="table-section">
            <div class="table-label">Performance Breakdown</div>
            <table>
              <thead>
                <tr>
                  <th style="text-align: center;">Rank</th>
                  <th>Employee</th>
                  <th>Jobs Completed</th>
                  <th style="text-align: right;">Value Generated</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows || `
                  <tr>
                    <td colspan="4" style="padding: 40px; text-align: center; color: #9ca3af; font-size: 13px;">
                      No performance records found for the selected period.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>

          <!-- Grand Total -->
          <div class="grand-total">
            <span class="label">Total Generated Value</span>
            <span class="amount">Rs. ${totalRevenue.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="generated">Report generated on ${generatedAt}</div>
            <div class="brand-mark">The Washing Machine</div>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  const win = window.open("", "", "width=1000,height=800");
  win.document.write(reportHTML);
  win.document.close();
};
