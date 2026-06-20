const router = require('express').Router();
const ctrl = require('../controllers/order.controller');

router.get('/', ctrl.list);
router.post('/', ctrl.create);        // manual order entry
router.post('/pull', ctrl.pullFromSBC);   // SoftBrainChat থেকে টানো
router.get('/:id', ctrl.getOne);
router.patch('/:id', ctrl.updateStatus);
router.delete('/:id', ctrl.remove);

module.exports = router;