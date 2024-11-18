const fs = require('fs');
const path = require('path');

class UtilityModel {
    constructor() {
        this.queue = []; // Regular queue
        this.priorityQueue = []; // Priority queue
        this.historyStack = []; // Stack for historical transactions
        this.transactionLogPath = path.join(__dirname, '../data/transactions.json');
    }

    addToQueue(request) {
        this.queue.push(request);
    }

    addToPriorityQueue(request) {
        this.priorityQueue.push(request);
    }

    processNextRequest() {
        if (this.priorityQueue.length > 0) {
            return this.priorityQueue.shift();
        } else if (this.queue.length > 0) {
            return this.queue.shift();
        } else {
            return null;
        }
    }

    pushToHistory(transaction) {
        this.historyStack.push(transaction);
    }

    popFromHistory() {
        return this.historyStack.pop();
    }

    logTransaction(transaction) {
        try {
            fs.mkdirSync(path.dirname(this.transactionLogPath), { recursive: true });
            const transactions = fs.existsSync(this.transactionLogPath)
                ? JSON.parse(fs.readFileSync(this.transactionLogPath, 'utf8'))
                : [];
            transactions.push(transaction);
            fs.writeFileSync(this.transactionLogPath, JSON.stringify(transactions, null, 2), 'utf8');
        } catch (error) {
            console.error('Error logging transaction:', error.message);
        }
    }
}

module.exports = new UtilityModel();
