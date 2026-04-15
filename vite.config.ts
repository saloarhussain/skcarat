import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import Razorpay from 'razorpay';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'razorpay-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/payment/order' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk.toString(); });
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body);
                  const amount = data.amount;
                  const currency = data.currency || "INR";
                  
                  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: "Razorpay credentials are not configured" }));
                    return;
                  }

                  const razorpay = new Razorpay({
                    key_id: env.RAZORPAY_KEY_ID,
                    key_secret: env.RAZORPAY_KEY_SECRET,
                  });

                  const options = {
                    amount: amount * 100,
                    currency,
                    receipt: `receipt_${Date.now()}`,
                  };

                  const order = await razorpay.orders.create(options);
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(order));
                } catch (error) {
                  console.error("Razorpay Order Error:", error);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: "Failed to create Razorpay order" }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
