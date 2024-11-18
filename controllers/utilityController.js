const utilityModel = require('../models/utilityModel');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create Payment Request
exports.createPaymentRequest = (req, res) => {
    const { type, amount, isUrgent } = req.body;
    if (!type || !amount) {
        return res.status(400).json({ message: 'Invalid input. Type and amount are required.' });
    }

    const request = {
        id: uuidv4(),
        type,
        amount,
        isUrgent: isUrgent || false,
        timestamp: new Date(),
    };

    if (isUrgent) {
        utilityModel.addToPriorityQueue(request);
    } else {
        utilityModel.addToQueue(request);
    }

    res.status(201).json({ message: 'Payment request created', request });
};

// Process Next Payment
exports.processPayment = (req, res) => {
    const request = utilityModel.processNextRequest();

    if (!request) {
        return res.status(404).json({ message: 'No payment requests in the queue' });
    }

    const transaction = {
        ...request,
        status: 'Processed',
        processedAt: new Date(),
    };

    utilityModel.pushToHistory(transaction);
    utilityModel.logTransaction(transaction);
    generateInvoice(transaction);

    res.status(200).json({ message: 'Payment processed', transaction });
};

// Undo Last Transaction
exports.undoLastTransaction = (req, res) => {
    const lastTransaction = utilityModel.popFromHistory();

    if (!lastTransaction) {
        return res.status(404).json({ message: 'No transactions to undo' });
    }

    res.status(200).json({ message: 'Transaction undone', lastTransaction });
};

// View Transaction Log
exports.viewTransactionLog = (req, res) => {
    const logPath = utilityModel.transactionLogPath;

    if (!fs.existsSync(logPath)) {
        return res.status(404).json({ message: 'No transaction log found' });
    }

    const transactions = JSON.parse(fs.readFileSync(logPath));
    res.status(200).json({ transactions });
};

// Generate Invoice (Helper Function)
function generateInvoice(transaction) {
    const invoicePath = path.join(__dirname, `../invoices/invoice_${transaction.id}.pdf`);
    const doc = new PDFDocument();

    fs.mkdirSync(path.dirname(invoicePath), { recursive: true });

    doc.pipe(fs.createWriteStream(invoicePath));
    doc.text(`Invoice ID: ${transaction.id}`);
    doc.text(`Type: ${transaction.type}`);
    doc.text(`Amount: $${transaction.amount}`);
    doc.text(`Processed At: ${transaction.processedAt}`);
    doc.end();
}
