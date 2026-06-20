const prisma = require('../lib/prisma');
const axios = require('axios');

// ── GET /api/orders ───────────────────────────────────────────
exports.list = async (req, res, next) => {
    try {
        const { status, source, search } = req.query;

        const where = {};
        if (status) where.status = status;
        if (source) where.source = source;
        if (search) {
            where.OR = [
                { customerName: { contains: search, mode: 'insensitive' } },
                { customerPhone: { contains: search, mode: 'insensitive' } },
                { productName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [orders, total, statusGroups] = await Promise.all([
            prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 }),
            prisma.order.count({ where }),
            prisma.order.groupBy({ by: ['status'], _count: true }),
        ]);

        const stats = {};
        statusGroups.forEach(g => { stats[g.status] = g._count; });

        res.json({ orders, total, stats });
    } catch (err) { next(err); }
};

// ── GET /api/orders/:id ───────────────────────────────────────
exports.getOne = async (req, res, next) => {
    try {
        const order = await prisma.order.findUnique({ where: { id: req.params.id } });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ order });
    } catch (err) { next(err); }
};

// ── POST /api/orders — manual order entry ────────────────────
exports.create = async (req, res, next) => {
    try {
        const {
            customerName, customerPhone, customerAddress,
            productName, productPrice, productQuantity, notes,
        } = req.body;

        if (!customerName || !customerPhone || !customerAddress || !productName) {
            return res.status(400).json({ message: 'Required: customerName, customerPhone, customerAddress, productName' });
        }

        const order = await prisma.order.create({
            data: {
                sourceOrderId: `MANUAL-${Date.now()}`,
                source: 'Manual',
                customerName,
                customerPhone,
                customerAddress,
                productName,
                productPrice: productPrice || null,
                productQuantity: parseInt(productQuantity) || 1,
                notes: notes || null,
                status: 'PENDING',
            },
        });

        res.status(201).json({ order });
    } catch (err) { next(err); }
};

// ── PATCH /api/orders/:id — status update + sync back ────────
exports.updateStatus = async (req, res, next) => {
    try {
        const { status, notes } = req.body;
        const valid = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (status && !valid.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Use: ${valid.join(', ')}` });
        }

        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { ...(status && { status }), ...(notes !== undefined && { notes }) },
        });

        // SoftBrainChat কে status জানাও (sync back)
        if (status && order.source === 'SoftBrainChat' && process.env.SBC_API_URL && process.env.SBC_API_KEY) {
            try {
                await axios.patch(
                    `${process.env.SBC_API_URL}/orders/${order.sourceOrderId}`,
                    { status: status.toLowerCase(), oms_order_id: order.id },
                    { headers: { 'X-API-Key': process.env.SBC_API_KEY }, timeout: 10000 }
                );
                await prisma.order.update({ where: { id: order.id }, data: { syncedBack: true } });
            } catch (syncErr) {
                console.warn('SBC sync-back failed:', syncErr.message);
            }
        }

        res.json({ order });
    } catch (err) { next(err); }
};

// ── DELETE /api/orders/:id ────────────────────────────────────
exports.remove = async (req, res, next) => {
    try {
        await prisma.order.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) { next(err); }
};

// ── POST /api/orders/pull — SoftBrainChat থেকে orders টানো ───
exports.pullFromSBC = async (req, res, next) => {
    try {
        if (!process.env.SBC_API_URL || !process.env.SBC_API_KEY) {
            return res.status(400).json({ message: 'SBC_API_URL ও SBC_API_KEY .env এ সেট করুন' });
        }

        const { data } = await axios.get(
            `${process.env.SBC_API_URL}/orders?status=pending&limit=100`,
            { headers: { 'X-API-Key': process.env.SBC_API_KEY }, timeout: 15000 }
        );

        let imported = 0;
        for (const o of data.orders || []) {
            const existing = await prisma.order.findUnique({ where: { sourceOrderId: o.order_id } });
            if (existing) continue;

            await prisma.order.create({
                data: {
                    sourceOrderId: o.order_id,
                    source: 'SoftBrainChat',
                    platform: o.platform || null,
                    customerName: o.customer?.name || 'Unknown',
                    customerPhone: o.customer?.phone || '',
                    customerAddress: o.customer?.address || '',
                    productName: o.product?.name || 'Unknown',
                    productCode: o.product?.code || null,
                    productPrice: o.product?.price || null,
                    productSize: o.product?.size || null,
                    productQuantity: o.product?.quantity || 1,
                    productImage: o.product?.image || null,
                    status: 'PENDING',
                },
            });
            imported++;
        }

        res.json({ success: true, imported, totalFetched: data.orders?.length || 0 });
    } catch (err) { next(err); }
};