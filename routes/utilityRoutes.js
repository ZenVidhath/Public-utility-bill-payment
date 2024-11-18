const express = require('express');
const router = express.Router();
const utilityController = require('../controllers/utilityController');

router.post('/payment-request', utilityController.createPaymentRequest); // Endpoint 1
router.post('/process-payment', utilityController.processPayment);       // Endpoint 2
router.post('/undo-transaction', utilityController.undoLastTransaction); // Endpoint 3
router.get('/transaction-log', utilityController.viewTransactionLog);    // Endpoint 4

module.exports = router;
