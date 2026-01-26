export const printReceipt = (payment) => {
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt #${payment.paymentid}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .receipt-container { max-width: 400px; margin: 0 auto; border: 1px solid #eee; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 24px; color: #DC2626; text-transform: uppercase; }
          .header p { margin: 5px 0 0; color: #666; font-size: 12px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .label { font-weight: bold; color: #555; }
          .divider { border-top: 2px dashed #ddd; margin: 20px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-top: 10px; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; }
          .car-details { background: #f9f9f9; padding: 10px; border-radius: 4px; margin: 15px 0; font-size: 13px; }
          @media print {
            body { padding: 0; }
            .receipt-container { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>The Washing Machine</h1>
            <p>Premium Auto Care Center</p>
            <p>123 Service Road, City</p>
          </div>
          
          <div class="info-row">
            <span class="label">Receipt No:</span>
            <span>#${payment.paymentid}</span>
          </div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span>${new Date(payment.paymentdate).toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span class="label">Payment Method:</span>
            <span style="text-transform: capitalize">${payment.paymenttype}</span>
          </div>

          <div class="car-details">
            <div class="info-row">
              <span class="label">Vehicle:</span>
              <span>${payment.vehbrand || "Vehicle"} ${payment.vehmodel || ""}</span>
            </div>
            <div class="info-row">
              <span class="label">Plate No:</span>
              <span>${payment.vehplate || "N/A"}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="info-row">
            <span class="label">Service Description:</span>
          </div>
          <div style="margin-bottom: 10px; font-size: 14px;">
            ${(payment.services || []).map((s) => (typeof s === "string" ? s : s.serviceName)).join("<br>")}
          </div>

          <div class="divider"></div>
          
          <div class="total-row">
            <span>TOTAL PAID</span>
            <span>Rs. ${Number(payment.paymentamount).toLocaleString()}</span>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing us!</p>
            <p>For questions: contact@washingmachine.com</p>
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
