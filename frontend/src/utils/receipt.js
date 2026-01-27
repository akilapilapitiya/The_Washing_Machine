export const printReceipt = (payment) => {
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt #${payment.paymentid}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #111; }
          .receipt-container { max-width: 400px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 30px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #111; }
          .header p { margin: 5px 0 0; color: #6b7280; font-size: 13px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .label { color: #6b7280; font-weight: 500; }
          .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; margin-top: 15px; color: #DC2626; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #9ca3af; }
          .car-details { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
          @media print {
            body { padding: 0; }
            .receipt-container { border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>The Washing Machine</h1>
            <p>Premium Auto Care Center</p>
            <p>488, High level Road, Pannipitiya, Colombo, Sri Lanka</p>
          </div>
          
          <div class="info-row">
            <span class="label">Receipt No</span>
            <span>#${payment.paymentid}</span>
          </div>
          <div class="info-row">
            <span class="label">Date</span>
            <span>${new Date(payment.paymentdate).toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span class="label">Payment Method</span>
            <span style="text-transform: capitalize">${payment.paymenttype}</span>
          </div>

          <div class="car-details">
            <div class="info-row">
              <span class="label">Vehicle</span>
              <span style="font-weight: 600;">${payment.vehbrand || "Vehicle"} ${payment.vehmodel || ""}</span>
            </div>
            <div class="info-row" style="margin-bottom: 0;">
              <span class="label">Plate No</span>
              <span style="font-weight: 600;">${payment.vehplate || "N/A"}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="info-row">
            <span class="label">Services Rendered</span>
          </div>
          <div style="margin-bottom: 10px; font-size: 14px; line-height: 1.5;">
            ${(payment.services || []).map((s) => (typeof s === "string" ? s : s.serviceName)).join("<br>")}
          </div>

          <div class="divider"></div>
          
          <div class="total-row">
            <span style="color: #111;">Total Paid</span>
            <span>Rs. ${Number(payment.paymentamount).toLocaleString()}</span>
          </div>
          
          <div class="footer">
            <p>Subject to standard terms and conditions.</p>
            <p>Thank you for choosing The Washing Machine.</p>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  const win = window.open("", "", "width=450,height=600");
  win.document.write(receiptHTML);
  win.document.close();
};
