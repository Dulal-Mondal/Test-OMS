require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'Test OMS', time: new Date() }));

// Routes
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/webhook', require('./routes/webhook.routes'));  // SoftBrainChat push এখানে আসবে

// 404
app.use((req, res) => res.status(404).json({ message: `Not found: ${req.originalUrl}` }));

// Error handler
app.use((err, _req, res, _next) => {
    console.error('❌', err.message);
    res.status(err.status || 500).json({ message: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`\n🚀 Test OMS backend running → http://localhost:${PORT}`);
    console.log(`📥 Webhook (receive orders): http://localhost:${PORT}/api/webhook/order`);
});