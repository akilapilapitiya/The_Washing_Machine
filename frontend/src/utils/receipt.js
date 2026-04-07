export const printReceipt = (payment) => {
  const receiptDate = new Date(payment.paymentdate);
  const formattedDate = receiptDate.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = receiptDate.toLocaleTimeString("en-LK", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Parse services — they now come as {name, price} objects from the backend
  const services = (payment.services || []).map((s) => {
    if (typeof s === "string") return { name: s, price: null };
    return {
      name: s.name || s.serviceName || s.servicename || "Service",
      price: s.price != null ? Number(s.price) : null,
    };
  });

  const totalAmount = Number(payment.paymentamount) || 0;
  const servicesSubtotal = services.reduce((sum, s) => sum + (s.price || 0), 0);

  // Build service rows for the table
  const serviceRows = services.length > 0
    ? services
        .map(
          (svc, idx) => `
          <tr>
            <td style="padding: 10px 16px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6;">
              ${idx + 1}
            </td>
            <td style="padding: 10px 16px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6;">
              ${svc.name}
            </td>
            <td style="padding: 10px 16px; font-size: 13px; color: #374151; text-align: right; border-bottom: 1px solid #f3f4f6; font-weight: 600;">
              ${svc.price != null ? `Rs. ${svc.price.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
            </td>
          </tr>`,
        )
        .join("")
    : `<tr>
        <td style="padding: 10px 16px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6;">1</td>
        <td style="padding: 10px 16px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6;">General Service</td>
        <td style="padding: 10px 16px; font-size: 13px; color: #374151; text-align: right; border-bottom: 1px solid #f3f4f6; font-weight: 600;">Rs. ${totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
       </tr>`;

  const paymentMethodLabel = {
    cash: "Cash",
    card: "Credit / Debit Card",
    online: "Online Transfer",
  }[payment.paymenttype] || payment.paymenttype || "N/A";

  const customerName = payment.cusname || null;
  const customerTel = payment.custel || null;

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt #${String(payment.paymentid).padStart(5, "0")} — The Washing Machine</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f9fafb;
            padding: 32px 16px;
            color: #111827;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .receipt {
            max-width: 520px;
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

          /* ── Receipt Meta ── */
          .meta {
            display: flex;
            justify-content: space-between;
            padding: 16px 32px;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
          }
          .meta-group { }
          .meta-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #9ca3af;
            margin-bottom: 2px;
          }
          .meta-value {
            font-weight: 600;
            color: #374151;
          }

          /* ── Customer / Vehicle ── */
          .details-section {
            padding: 20px 32px;
            border-bottom: 1px solid #e5e7eb;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          .detail-item { }
          .detail-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #9ca3af;
            margin-bottom: 2px;
          }
          .detail-value {
            font-size: 13px;
            font-weight: 600;
            color: #374151;
          }

          /* ── Services Table ── */
          .table-section {
            padding: 0;
          }
          .table-header-label {
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
            padding: 10px 16px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
          }
          table thead th:last-child {
            text-align: right;
          }
          table thead th:first-child {
            width: 40px;
            text-align: center;
          }

          /* ── Totals ── */
          .totals {
            padding: 0 32px 24px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 13px;
            color: #6b7280;
          }
          .totals-row.grand {
            border-top: 2px solid #111827;
            margin-top: 8px;
            padding-top: 12px;
            font-size: 16px;
            font-weight: 800;
            color: #111827;
          }
          .totals-row.grand .amount {
            color: #DC2626;
            font-size: 18px;
          }

          /* ── Payment Method Badge ── */
          .payment-method {
            margin: 0 32px 24px;
            padding: 12px 16px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .payment-method .pm-label {
            font-size: 11px;
            font-weight: 600;
            color: #16a34a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .payment-method .pm-value {
            font-size: 13px;
            font-weight: 700;
            color: #15803d;
          }

          /* ── Footer ── */
          .footer {
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            padding: 20px 32px;
            text-align: center;
          }
          .footer .thanks {
            font-size: 13px;
            font-weight: 600;
            color: #374151;
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

          /* ── Print Overrides ── */
          @media print {
            body { background: #fff; padding: 0; }
            .receipt { border: none; box-shadow: none; border-radius: 0; }
            .accent-bar { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
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

          <!-- Receipt Meta -->
          <div class="meta">
            <div class="meta-group">
              <div class="meta-label">Receipt No.</div>
              <div class="meta-value">#${String(payment.paymentid).padStart(5, "0")}</div>
            </div>
            <div class="meta-group" style="text-align: center;">
              <div class="meta-label">Date</div>
              <div class="meta-value">${formattedDate}</div>
            </div>
            <div class="meta-group" style="text-align: right;">
              <div class="meta-label">Booking Ref</div>
              <div class="meta-value">#${String(payment.bookingid || "—").padStart ? String(payment.bookingid).padStart(5, "0") : "—"}</div>
            </div>
          </div>

          <!-- Customer & Vehicle Details -->
          <div class="details-section">
            <div class="details-grid">
              ${customerName ? `
              <div class="detail-item">
                <div class="detail-label">Customer</div>
                <div class="detail-value">${customerName}</div>
              </div>` : ""}
              ${customerTel ? `
              <div class="detail-item">
                <div class="detail-label">Contact</div>
                <div class="detail-value">${customerTel}</div>
              </div>` : ""}
              <div class="detail-item">
                <div class="detail-label">Vehicle</div>
                <div class="detail-value">${payment.vehbrand || "—"} ${payment.vehmodel || ""}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Plate Number</div>
                <div class="detail-value" style="font-family: monospace; letter-spacing: 1px;">${payment.vehplate || "N/A"}</div>
              </div>
            </div>
          </div>

          <!-- Services Table -->
          <div class="table-section">
            <div class="table-header-label">Services Rendered</div>
            <table>
              <thead>
                <tr>
                  <th style="text-align: center;">#</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${serviceRows}
                <!-- Subtotal Row -->
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px 16px;" colspan="1"></td>
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">
                    Subtotal
                  </td>
                  <td style="padding: 12px 16px; font-size: 14px; font-weight: 700; color: #374151; text-align: right; border-top: 1px solid #e5e7eb;">
                    Rs. ${servicesSubtotal > 0 ? servicesSubtotal.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="totals">
            <div class="totals-row grand">
              <span>Total Paid</span>
              <span class="amount">Rs. ${totalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="payment-method">
            <span class="pm-label">✓ &nbsp;Payment Confirmed</span>
            <span class="pm-value">${paymentMethodLabel}</span>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="thanks">Thank you for choosing The Washing Machine!</div>
            <div class="terms">
              This receipt is system-generated and valid without a signature.<br>
              Subject to standard terms &amp; conditions.<br>
              For inquiries, contact us at 077 350 7777 or visit our premises.
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

  const win = window.open("", "", "width=600,height=800");
  win.document.write(receiptHTML);
  win.document.close();
};
