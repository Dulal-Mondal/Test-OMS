// SoftBrainChat push request verify করো
module.exports = (req, res, next) => {
    const key = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    const expected = process.env.OMS_RECEIVE_API_KEY;

    // .env এ key সেট না থাকলে — open (testing এর জন্য)
    if (!expected) return next();

    if (key !== expected) {
        return res.status(401).json({ message: 'Invalid API key' });
    }
    next();
};