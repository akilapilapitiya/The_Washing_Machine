export const otpTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { background-color: #ffffff; padding: 24px 20px; text-align: center; border-bottom: 3px solid #DC2626; }
    .header img { max-width: 150px; height: auto; display: block; margin: 0 auto; }
    .content { padding: 40px 32px; background-color: #ffffff; }
    .h2 { font-size: 24px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 24px; text-align: center; }
    .text { font-size: 16px; color: #4B5563; margin-bottom: 24px; text-align: center; }
    .otp-container { background-color: #FEF2F2; border: 1px dashed #DC2626; border-radius: 8px; padding: 20px; margin: 32px 0; text-align: center; }
    .otp { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #DC2626; margin: 0; font-family: monospace; }
    .footer { background-color: #F3F4F6; padding: 24px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer-text { font-size: 14px; color: #6B7280; margin: 0; }
    .link { color: #DC2626; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="cid:logo@washingmachine" alt="The Washing Machine Logo">
    </div>
    <div class="content">
      <h2 class="h2">Password Reset Request</h2>
      <p class="text">Hello,</p>
      <p class="text">We received a request to reset your password. Please use the verification code below to complete the process.</p>
      
      <div class="otp-container">
        <p class="otp">${otp}</p>
      </div>
      
      <p class="text">This code will expire in 10 minutes. If you didn't ask for a password reset, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${new Date().getFullYear()} The Washing Machine. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
