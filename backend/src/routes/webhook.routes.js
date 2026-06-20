const router = require('express').Router();
const ctrl = require('../controllers/webhook.controller');
const apiKey = require('../middlewares/apikey.middleware');

// SoftBrainChat connection test
router.get('/ping', ctrl.ping);

// SoftBrainChat order push (protected by API key)
router.post('/order', apiKey, ctrl.receiveOrder);

module.exports = router;
