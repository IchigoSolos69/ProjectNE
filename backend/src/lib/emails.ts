import { Resend } from 'resend';

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || 'orders@rarecomforts.in';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Asynchronously dispatches email via Resend.
 * Captures any failures and logs them instead of throwing.
 */
async function sendEmailAsync(payload: EmailPayload) {
  // Fire-and-forget: wrap in async IIFE to avoid blocking request loops
  (async () => {
    try {
      if (!resend) {
        console.log(`✉️ [EMAIL MOCK] To: ${payload.to} | Subject: ${payload.subject}`);
        console.log(`✉️ [EMAIL MOCK] Content:\n${payload.html.substring(0, 300)}...\n`);
        return;
      }

      console.log(`✉️ Sending real email to ${payload.to}...`);
      const { data, error } = await resend.emails.send({
        from: `RareComforts <${FROM_EMAIL}>`,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      });

      if (error) {
        console.error(`🚨 [EMAIL ERROR] Failed to send email to ${payload.to}:`, error);
      } else {
        console.log(`✅ [EMAIL SUCCESS] Email sent to ${payload.to}, id: ${data?.id}`);
      }
    } catch (err) {
      console.error(`🚨 [EMAIL CRITICAL ERROR] Exception while sending email to ${payload.to}:`, err);
    }
  })();
}

// Brand email layout wrapper (Navy theme & Serif logo style)
function wrapWithBrandLayout(title: string, bodyContent: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            color: #0F2854;
            background-color: #F5FAFD;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            background-color: #FFFFFF;
            margin: 0 auto;
            border-radius: 12px;
            border: 1px border #BDE8F5;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(15, 40, 84, 0.05);
          }
          .header {
            background-color: #0F2854;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            color: #FFFFFF;
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 24px;
            margin: 0;
            letter-spacing: 1px;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
            font-size: 14px;
          }
          .content h2 {
            font-family: 'Playfair Display', Georgia, serif;
            color: #0F2854;
            font-size: 18px;
            margin-top: 0;
          }
          .btn-container {
            text-align: center;
            margin: 30px 0;
          }
          .btn {
            background-color: #0F2854;
            color: #FFFFFF !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
            display: inline-block;
          }
          .footer {
            background-color: #F5FAFD;
            border-t: 1px solid #BDE8F5;
            padding: 20px;
            text-align: center;
            font-size: 11px;
            color: #5C6B80;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RareComforts</h1>
          </div>
          <div class="content">
            <h2>${title}</h2>
            ${bodyContent}
          </div>
          <div class="footer">
            <p>&copy; 2026 RareComforts Inc. All rights reserved.</p>
            <p>Egyptian cotton and satin bedding designed for restorative sleep.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export const emailService = {
  sendWelcomeEmail: async (email: string, name: string) => {
    const html = wrapWithBrandLayout(
      'Welcome to Quiet Luxury',
      `
      <p>Dear ${name},</p>
      <p>Welcome to the Royal Standard of Sleep. Your registry is now active, giving you early access to order custom sizes, save wishlists, and consult with our bedding concierge.</p>
      <p>We believe that rest is a sanctuary. We hope our hand-woven sheets and mulberry comforters bring absolute stillness to your mornings.</p>
      <div class="btn-container">
        <a href="${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/products" class="btn">Explore Collections</a>
      </div>
      `
    );
    await sendEmailAsync({ to: email, subject: 'Welcome to RareComforts', html });
  },

  sendPasswordResetEmail: async (email: string, token: string, name: string) => {
    const resetUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/auth/reset-password?token=${token}`;
    const html = wrapWithBrandLayout(
      'Reset Your Password',
      `
      <p>Hello ${name},</p>
      <p>We received a request to reset the password for your RareComforts account. Click the button below to configure your new credentials. This link expires in 45 minutes.</p>
      <div class="btn-container">
        <a href="${resetUrl}" class="btn">Reset My Password</a>
      </div>
      <p>If you did not initiate this request, you can safely ignore this email. Your current password remains secure.</p>
      `
    );
    await sendEmailAsync({ to: email, subject: 'RareComforts - Reset Your Password', html });
  },

  sendOrderConfirmationEmail: async (email: string, order: any, name: string) => {
    const orderRef = order.id.slice(-8).toUpperCase();
    const html = wrapWithBrandLayout(
      `Order Confirmed — Reference #${orderRef}`,
      `
      <p>Dear ${name},</p>
      <p>Thank you for choosing RareComforts. Your payment has been verified, and we have confirmed your order.</p>
      <p>Our warehouse team is now carefully packing your premium bedding items. You will receive another notification once it hands off to the shipping courier.</p>
      <h3>Order Summary</h3>
      <p>Reference: #${orderRef}</p>
      <p>Total: <strong>₹${Number(order.total).toLocaleString('en-IN')}</strong></p>
      `
    );
    await sendEmailAsync({ to: email, subject: `RareComforts Order Confirmed - #${orderRef}`, html });
  },

  sendOrderShippedEmail: async (
    email: string,
    order: any,
    name: string,
    trackingNumber: string,
    carrier: string
  ) => {
    const orderRef = order.id.slice(-8).toUpperCase();
    const html = wrapWithBrandLayout(
      `Your Bedding is on the Way — Order #${orderRef}`,
      `
      <p>Dear ${name},</p>
      <p>Great news! Your RareComforts package has been shipped and is currently in transit.</p>
      <p>Details for tracking your delivery:</p>
      <ul>
        <li><strong>Carrier:</strong> ${carrier}</li>
        <li><strong>Tracking Number:</strong> ${trackingNumber}</li>
      </ul>
      <p>Please allow 24 hours for the courier website to reflect package scan events.</p>
      `
    );
    await sendEmailAsync({ to: email, subject: `RareComforts Order Shipped - #${orderRef}`, html });
  },

  sendOrderDeliveredEmail: async (email: string, order: any, name: string) => {
    const orderRef = order.id.slice(-8).toUpperCase();
    const html = wrapWithBrandLayout(
      'Your Bedding Has Arrived',
      `
      <p>Dear ${name},</p>
      <p>Your order #${orderRef} has been delivered. We hope your new premium bedding provides the weight of real rest.</p>
      <p>Once you have unrolled and enjoyed your sheets, we would be honored if you shared a brief review of your experience.</p>
      <div class="btn-container">
        <a href="${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/products" class="btn">Write a Review</a>
      </div>
      `
    );
    await sendEmailAsync({ to: email, subject: `RareComforts Order Delivered - #${orderRef}`, html });
  },

  sendOrderCancelledEmail: async (email: string, order: any, name: string) => {
    const orderRef = order.id.slice(-8).toUpperCase();
    const html = wrapWithBrandLayout(
      `Order Status Update — Order #${orderRef}`,
      `
      <p>Dear ${name},</p>
      <p>Your order #${orderRef} has been cancelled. If a refund applies, it will be processed through the manual channel under which payment was made.</p>
      <p>If you have any questions, please contact our concierge support line.</p>
      `
    );
    await sendEmailAsync({ to: email, subject: `RareComforts Order Cancelled - #${orderRef}`, html });
  },
};
