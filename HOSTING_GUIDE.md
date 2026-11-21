# HAVEN — setup & hosting guide

## 0. After updating to v15 (do this once)
1. `cd server && npm install` (new packages: helmet, express-rate-limit, nodemailer).
2. Add the new lines from `server/.env.example` to your `server/.env`
   (CLIENT_URL, SMTP_*, RAZORPAY_*). Make JWT_SECRET 32+ random characters.
3. Existing products need a per-size stock grid: `npm run migrate:variants`
   (spreads each product's current stock evenly; then fix real numbers in Admin → Products → Edit).
4. Restart the server. `npm test` runs the automated checks (no database needed).

## 1. Online payments (Razorpay)
1. Create an account at razorpay.com, stay in **Test mode** and copy the Key ID + Key Secret from Settings → API Keys into `.env`.
2. Test with Razorpay's test UPI/cards (see their docs: "Test card details").
3. Recommended: add a webhook (Settings → Webhooks) pointing to `https://YOUR-API/api/payments/webhook`,
   events `payment.captured` and `order.paid`, and put its secret in `RAZORPAY_WEBHOOK_SECRET`.
   It confirms orders even if a customer pays and then closes the tab.
4. For real money, complete Razorpay KYC, then swap in the **Live** keys.
Unpaid online orders are cancelled automatically after 30 minutes and their stock returns.
Cancelling a paid online order, or marking a return Refunded, refunds the customer through Razorpay.

## 2. Emails
Leave `SMTP_HOST` empty in development — emails print in the server terminal (so you can copy the password-reset link).
For real emails use any SMTP service (Brevo, Resend SMTP, Gmail app password, Mailgun…): fill SMTP_HOST/PORT/USER/PASS and EMAIL_FROM.

## 3. Hosting
**Database — MongoDB Atlas** (free cluster). Orders use transactions, so use Atlas, not a bare local MongoDB.

**Server — Render / Railway:** root `server`, build `npm install`, start `npm start`.
Set every variable from `.env.example`, plus `NODE_ENV=production`, `TRUST_PROXY=1`,
and `CLIENT_URL=https://your-website-address`. Then run `npm run seed` and your create-admin script once.

**Website — Vercel / Netlify:** root `client`, build `npm run build`, output `dist`.
Set `VITE_API_URL=https://YOUR-API/api`. Add a rewrite so page refreshes work
(Vercel: `client/vercel.json` → `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`).

## 4. Before going live
- Replace placeholder photos/videos in `client/public/media` (see its README).
- Edit the size chart in `client/src/data/sizeChart.js`.
- Use a strong admin password; keep `.env` out of Git.
