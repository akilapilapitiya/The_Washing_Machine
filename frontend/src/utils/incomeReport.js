/**
 * Print a professional daily income report
 * Matches the style of the payment receipt
 */
export const printIncomeReport = (payments, startDate, endDate) => {
  const totalIncome = payments.reduce(
    (sum, p) => sum + (Number(p.paymentamount) || 0),
    0,
  );
  const totalTransactions = payments.length;

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

  const paymentMethodLabel = (type) =>
    ({ cash: "Cash", card: "Card", online: "Online" })[type] || type || "—";

  // Group payments by date
  const grouped = {};
  payments.forEach((p) => {
    const date = p.date || "Unknown";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(p);
  });

  // Build table rows grouped by date
  let rowNumber = 0;
  const tableRows = Object.entries(grouped)
    .map(([date, items]) => {
      const dateTotal = items.reduce(
        (sum, p) => sum + (Number(p.paymentamount) || 0),
        0,
      );

      const itemRows = items
        .map((p) => {
          rowNumber++;
          const services = (p.services || [])
            .map((s) => (typeof s === "string" ? s : s.name || s))
            .join(", ");

          return `
          <tr class="data-row">
            <td class="cell cell-num">${rowNumber}</td>
            <td class="cell cell-id">#${String(p.paymentid).padStart(5, "0")}</td>
            <td class="cell cell-customer">${p.cusname || "Walk-in"}</td>
            <td class="cell cell-vehicle">${p.vehplate || "—"}</td>
            <td class="cell cell-services">${services || "General Service"}</td>
            <td class="cell cell-method">${paymentMethodLabel(p.paymenttype)}</td>
            <td class="cell cell-amount">Rs. ${Number(p.paymentamount).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>`;
        })
        .join("");

      return `
        <tr class="date-header">
          <td colspan="6">${formatDate(date)}</td>
          <td style="text-align: right; font-weight: 700; color: #374151;">Rs. ${dateTotal.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        ${itemRows}`;
    })
    .join("");

  const isSingleDay = startDate === endDate;
  const reportTitle = isSingleDay
    ? `Income Report — ${formatDate(startDate)}`
    : `Income Report — ${formatDate(startDate)} to ${formatDate(endDate)}`;

  const reportHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Income Report — The Washing Machine</title>
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
            max-width: 960px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
          }

          /* ── Top Accent ── */
          .accent-bar {
            height: 5px;
            background: linear-gradient(90deg, #DC2626, #991B1B);
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
            color: #DC2626;
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
          .summary-card.revenue {
            background: linear-gradient(135deg, #fef2f2, #fff);
            border-color: #fecaca;
          }
          .summary-card.transactions {
            background: linear-gradient(135deg, #eff6ff, #fff);
            border-color: #bfdbfe;
          }
          .summary-card.average {
            background: linear-gradient(135deg, #f0fdf4, #fff);
            border-color: #bbf7d0;
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
          .summary-card.revenue .summary-value { color: #DC2626; }
          .summary-card.transactions .summary-value { color: #2563eb; }
          .summary-card.average .summary-value { color: #16a34a; }

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
          table thead th:last-child { text-align: right; }

          .date-header td {
            padding: 8px 12px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            background: #f3f4f6;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
          }

          .data-row .cell {
            padding: 9px 12px;
            font-size: 12px;
            color: #374151;
            border-bottom: 1px solid #f3f4f6;
          }
          .cell-num { text-align: center; color: #9ca3af; font-size: 11px; }
          .cell-id { font-family: monospace; font-weight: 600; font-size: 11px; color: #6b7280; }
          .cell-customer { font-weight: 600; }
          .cell-vehicle { font-family: monospace; font-size: 11px; letter-spacing: 0.5px; color: #6b7280; }
          .cell-services { font-size: 11px; color: #6b7280; max-width: 200px; }
          .cell-method { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          .cell-amount { text-align: right; font-weight: 700; white-space: nowrap; }

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
            color: #DC2626;
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
          .footer .terms {
            font-size: 10px;
            color: #9ca3af;
            line-height: 1.6;
            margin-bottom: 16px;
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
            <div class="subtitle">Financial summary and transaction breakdown</div>
          </div>

          <!-- Summary Cards -->
          <div class="summary">
            <div class="summary-card revenue">
              <div class="summary-label">Total Revenue</div>
              <div class="summary-value">Rs. ${totalIncome.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card transactions">
              <div class="summary-label">Transactions</div>
              <div class="summary-value">${totalTransactions}</div>
            </div>
            <div class="summary-card average">
              <div class="summary-label">Avg. per Transaction</div>
              <div class="summary-value">Rs. ${totalTransactions > 0 ? (totalIncome / totalTransactions).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</div>
            </div>
          </div>

          <!-- Transactions Table -->
          <div class="table-section">
            <div class="table-label">Transaction Details</div>
            <table>
              <thead>
                <tr>
                  <th style="text-align: center;">#</th>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Services</th>
                  <th>Method</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${
                  tableRows ||
                  `
                  <tr>
                    <td colspan="7" style="padding: 40px; text-align: center; color: #9ca3af; font-size: 13px;">
                      No transactions recorded for this period.
                    </td>
                  </tr>
                `
                }
              </tbody>
            </table>
          </div>

          <!-- Grand Total -->
          <div class="grand-total">
            <span class="label">Grand Total</span>
            <span class="amount">Rs. ${totalIncome.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="generated">Report generated on ${generatedAt}</div>
            <div class="terms">
              This is a system-generated financial report. Confidential — for internal use only.<br>
              For discrepancies, contact the accounts department immediately.
            </div>
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
