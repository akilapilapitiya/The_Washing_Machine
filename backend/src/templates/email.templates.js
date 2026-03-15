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

export const welcomeTemplate = (password, loginUrl) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4f4f5; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .header { background-color: #ffffff; padding: 32px 20px; text-align: center; border-bottom: 4px solid #DC2626; }
    .header img { max-width: 160px; height: auto; display: block; margin: 0 auto; }
    .content { padding: 48px 40px; background-color: #ffffff; }
    .greeting { font-size: 24px; font-weight: 800; color: #111827; margin-top: 0; margin-bottom: 24px; text-align: left; }
    .text { font-size: 16px; color: #4B5563; margin-bottom: 20px; text-align: left; line-height: 1.7; }
    
    .credentials-box { background-color: #f8fafc; border-left: 4px solid #DC2626; border-radius: 0 8px 8px 0; padding: 24px; margin: 32px 0; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02); }
    .cred-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 8px; display: block; }
    .cred-value { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: 2px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    
    .instruction-step { margin-bottom: 16px; display: flex; align-items: flex-start; }
    .step-number { background-color: #DC2626; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; justify-content: center; align-items: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0; margin-top: 2px; text-align: center; line-height: 24px; }
    .step-text { font-size: 15px; color: #4B5563; margin: 0; }
    .step-text strong { color: #111827; }
    
    .button-container { text-align: center; margin: 40px 0 24px 0; }
    .button { display: inline-block; background-color: #DC2626; color: #ffffff !important; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.4); text-transform: uppercase; letter-spacing: 0.5px; transition: background-color 0.2s; }
    .button:hover { background-color: #b91c1c; }
    
    .divider { height: 1px; background-color: #e2e8f0; margin: 40px 0; }
    
    .footer { background-color: #f8fafc; padding: 32px 40px; text-align: left; border-top: 1px solid #e2e8f0; }
    .footer-heading { font-size: 14px; font-weight: 700; color: #334155; margin-top: 0; margin-bottom: 12px; }
    .footer-text { font-size: 13px; color: #64748b; margin: 0 0 8px 0; line-height: 1.5; }
    .company-name { font-weight: 700; color: #1e293b; margin-top: 16px; display: block; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="cid:logo@washingmachine" alt="The Washing Machine Logo">
    </div>
    
    <div class="content">
      <h2 class="greeting">Welcome to the Team!</h2>
      
      <p class="text">Your employee account at <strong>The Washing Machine</strong> has been successfully created. We are thrilled to have you onboard.</p>
      <p class="text">For security purposes, we have generated a temporary password for your initial login.</p>
      
      <div class="credentials-box">
        <span class="cred-label">Temporary Password</span>
        <p class="cred-value">${password}</p>
      </div>
      
      <div class="divider"></div>
      
      <h3 style="font-size: 18px; color: #111827; margin-bottom: 20px;">Onboarding Checklist</h3>
      
      <div class="instruction-step">
        <div class="step-number">1</div>
        <p class="step-text"><strong>Log into the portal:</strong> Use your email and the temporary password provided above.</p>
      </div>
      
      <div class="instruction-step">
        <div class="step-number">2</div>
        <p class="step-text"><strong>Update your password:</strong> Navigate to your Profile and change this temporary password immediately.</p>
      </div>
      
      <div class="instruction-step">
        <div class="step-number">3</div>
        <p class="step-text"><strong>Connect to Telegram:</strong> In your Profile, click "Connect Telegram" to receive a linking code. Send this code to our Telegram Bot to receive real-time job assignments.</p>
      </div>
      
      <div class="button-container">
        <a href="${loginUrl}" class="button">Access Employee Portal</a>
      </div>
    </div>
    
    <div class="footer">
      <h4 class="footer-heading">Need Support?</h4>
      <p class="footer-text">If you experience any issues logging in or connecting your Telegram account, please contact the management directly.</p>
      <span class="company-name">&copy; ${new Date().getFullYear()} The Washing Machine. All rights reserved.</span>
    </div>
  </div>
</body>
</html>
`;
