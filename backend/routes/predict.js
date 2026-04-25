const express = require('express');
const router = express.Router();
const controller = require('../controllers/predictController');

// POST /predict
router.post('/', controller.predict);

// GET /predict/history
router.get('/history', controller.getHistory);

module.exports = router;