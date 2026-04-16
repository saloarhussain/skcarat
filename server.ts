import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import Stripe from 'stripe';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending order notifications
  app.post('/api/notifications/order-update', async (req, res) => {
    const { email, orderId, customerName, amount, items, type, smtpConfig } = req.body;

    if (!email || !orderId || !type) {
      return res.status(400).json({ error: 'Email, Order ID, and Type are required' });
    }

    // SMTP configuration: priority is Body (for testing) -> Environment Variables
    const smtpHost = smtpConfig?.host || process.env.SMTP_HOST;
    const smtpPort = parseInt(smtpConfig?.port || process.env.SMTP_PORT || '587');
    const smtpUser = smtpConfig?.username || process.env.SMTP_USER;
    const smtpPass = smtpConfig?.password || process.env.SMTP_PASS;

    try {
      let transporter;

      if (smtpHost && smtpUser && smtpPass) {
        transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465 || smtpConfig?.encryption === 'SSL/TLS',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            // Do not fail on invalid certs
            rejectUnauthorized: false
          }
        });
      } else {
        console.log(`--- MOCK EMAIL SENT (${type.toUpperCase()}) ---`);
        console.log(`To: ${email}`);
        console.log(`Subject: Order ${type} - #${orderId}`);
        console.log(`Body: Hi ${customerName}, your order of ₹${amount} status is now: ${type}.`);
        console.log(`Note: To send real emails, set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.`);
        console.log('-----------------------');
        return res.json({ success: true, message: `Email logged to console (${type} Mode)` });
      }

      let subject = '';
      let title = '';
      let message = '';
      let color = '#D4AF37'; // Default Gold

      switch (type) {
        case 'confirmed':
          subject = `Order Confirmed! Your Aura Jewelry Order #${orderId.slice(-6).toUpperCase()}`;
          title = 'Order Confirmation';
          message = 'Thank you for shopping with Aura Jewelry! Your order has been successfully placed and is being processed.';
          break;
        case 'cancelled':
          subject = `Order Cancelled - #${orderId.slice(-6).toUpperCase()}`;
          title = 'Order Cancelled';
          message = 'Your order has been cancelled. If you have already paid, a refund will be initiated shortly.';
          color = '#ef4444'; // Red
          break;
        case 'failed':
          subject = `Payment Failed - #${orderId.slice(-6).toUpperCase()}`;
          title = 'Payment Failed';
          message = 'Unfortunately, the payment for your order has failed. Please try again or contact support if the issue persists.';
          color = '#f59e0b'; // Amber
          break;
        default:
          subject = `Order Update - #${orderId.slice(-6).toUpperCase()}`;
          title = 'Order Update';
          message = `Your order status has been updated to: ${type}.`;
      }

      const itemsHtml = items ? items.map((item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
        </tr>
      `).join('') : '';

      const mailOptions = {
        from: `"Aura Jewelry" <${smtpUser}>`,
        to: email,
        subject: subject,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: ${color}; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; letter-spacing: 5px;">AURA</h1>
            </div>
            <div style="padding: 30px;">
              <h2 style="color: #333;">${title}</h2>
              <p>Hi ${customerName},</p>
              <p>${message}</p>
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">Order ID:</p>
                <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 18px;">#${orderId.toUpperCase()}</p>
              </div>

              ${itemsHtml ? `
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                  <tr style="background-color: #f5f5f5;">
                    <th style="padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #999;">Item</th>
                    <th style="padding: 10px; text-align: center; font-size: 12px; text-transform: uppercase; color: #999;">Qty</th>
                    <th style="padding: 10px; text-align: right; font-size: 12px; text-transform: uppercase; color: #999;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 20px 10px 10px; text-align: right; font-weight: bold;">Total</td>
                    <td style="padding: 20px 10px 10px; text-align: right; font-weight: bold; font-size: 18px; color: ${color};">₹${amount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
              ` : ''}

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
                <p>If you have any questions, please contact our support team.</p>
                <p>&copy; 2024 Aura Jewelry. All rights reserved.</p>
              </div>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'Notification email sent' });
    } catch (error) {
      console.error('Email Error:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // API Route for creating Razorpay orders
  app.post('/api/payment/order', async (req, res) => {
    const { amount, currency = 'INR' } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const keyId = process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay keys not configured in environment variables');
      return res.status(500).json({ error: 'Razorpay keys not configured' });
    }

    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Razorpay expects amount in paise (sub-units)
        currency: currency,
        receipt: `receipt_${Date.now()}`,
      });

      res.json(order);
    } catch (error) {
      console.error('Razorpay Error:', error);
      res.status(500).json({ error: 'Failed to create payment order' });
    }
  });

  // API Route for creating Stripe Payment Intent
  app.post('/api/payment/stripe-intent', async (req, res) => {
    const { amount, currency = 'inr' } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      console.error('Stripe secret key not configured in environment variables');
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    try {
      const stripe = new Stripe(stripeSecretKey);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents/paise
        currency: currency.toLowerCase(),
        metadata: { integration_check: 'accept_a_payment' },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error('Stripe Error:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
