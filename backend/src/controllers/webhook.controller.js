const prisma = require('../lib/prisma');

// ── POST /api/webhook/order ──────────────────────────────────
// SoftBrainChat order confirm হলে এখানে POST করবে
// SoftBrainChat default payload format:
// {
//   order_id, source, status, platform,
//   customer: { name, phone, address },
//   product:  { name, price, quantity },
//   notes, ordered_at
// }
exports.receiveOrder = async (req, res, next) => {
    try {
        const body = req.body;

        // SoftBrainChat format এবং custom format দুটোই handle করো
        const orderId = body.order_id || body.orderId || `SBC-${Date.now()}`;
        const customer = body.customer || {};
        const product = body.product || {};

        if (!customer.name && !customer.phone) {
            return res.status(400).json({ message: 'Invalid payload: customer info missing' });
        }

        // Duplicate check
        const existing = await prisma.order.findUnique({ where: { sourceOrderId: orderId } });
        if (existing) {
            return res.json({ success: true, message: 'Order already exists', id: existing.id });
        }

        const order = await prisma.order.create({
            data: {
                sourceOrderId: orderId,
                source: 'SoftBrainChat',
                platform: body.platform || null,
                customerName: customer.name || 'Unknown',
                customerPhone: customer.phone || '',
                customerAddress: customer.address || '',
                productName: product.name || 'Unknown Product',
                productCode: product.code || null,
                productPrice: product.price || null,
                productSize: product.size || null,
                productQuantity: product.quantity || 1,
                productImage: product.image || null,
                notes: body.notes || null,
                status: 'PENDING',
            },
        });

        console.log(`📥 New order received from SoftBrainChat: ${orderId}`);

        res.status(201).json({
            success: true,
            id: order.id,
            order_id: order.sourceOrderId,
            message: 'Order received successfully',
        });
    } catch (err) { next(err); }
};

// ── GET /api/webhook/ping ────────────────────────────────────
// SoftBrainChat connection test এখানে আসবে
exports.ping = (_req, res) => {
    res.json({ success: true, message: 'Test OMS webhook is alive', time: new Date() });
};