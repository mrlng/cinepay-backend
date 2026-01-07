const midtransClient = require('midtrans-client');

class MidtransService {
    constructor() {
        // Initialize Snap API for payment page
        this.snap = new midtransClient.Snap({
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
            serverKey: process.env.MIDTRANS_SERVER_KEY || 'YOUR_SERVER_KEY',
            clientKey: process.env.MIDTRANS_CLIENT_KEY || 'YOUR_CLIENT_KEY'
        });
    }

    /**
     * Create payment transaction
     * @param {string} orderId - Unique order ID
     * @param {number} amount - Transaction amount in IDR
     * @param {object} customerDetails - Customer information
     * @param {array} itemDetails - List of purchased items
     * @returns {Promise<object>} Transaction token and redirect URL
     */
    async createTransaction(orderId, amount, customerDetails, itemDetails) {
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount
            },
            customer_details: {
                first_name: customerDetails.first_name,
                last_name: customerDetails.last_name || '',
                email: customerDetails.email,
                phone: customerDetails.phone
            },
            item_details: itemDetails,
            callbacks: {
                finish: 'cinepay://payment/success',
                error: 'cinepay://payment/error',
                pending: 'cinepay://payment/pending'
            }
        };

        try {
            const transaction = await this.snap.createTransaction(parameter);
            return {
                token: transaction.token,
                redirectUrl: transaction.redirect_url
            };
        } catch (error) {
            console.error('Midtrans createTransaction error:', error);
            throw new Error(`Failed to create transaction: ${error.message}`);
        }
    }

    /**
     * Get transaction status from Midtrans
     * @param {string} orderId - Order ID to check
     * @returns {Promise<object>} Transaction status details
     */
    async getTransactionStatus(orderId) {
        try {
            const status = await this.snap.transaction.status(orderId);
            return status;
        } catch (error) {
            console.error('Midtrans getTransactionStatus error:', error);
            throw new Error(`Failed to get transaction status: ${error.message}`);
        }
    }

    /**
     * Cancel transaction
     * @param {string} orderId - Order ID to cancel
     * @returns {Promise<object>} Cancellation result
     */
    async cancelTransaction(orderId) {
        try {
            const result = await this.snap.transaction.cancel(orderId);
            return result;
        } catch (error) {
            console.error('Midtrans cancelTransaction error:', error);
            throw new Error(`Failed to cancel transaction: ${error.message}`);
        }
    }

    /**
     * Map Midtrans transaction status to our payment status
     * @param {string} transactionStatus - Midtrans transaction status
     * @param {string} fraudStatus - Midtrans fraud status
     * @returns {string} Our payment status (PENDING, COMPLETED, FAILED)
     */
    mapPaymentStatus(transactionStatus, fraudStatus) {
        if (transactionStatus === 'capture') {
            return fraudStatus === 'accept' ? 'COMPLETED' : 'PENDING';
        } else if (transactionStatus === 'settlement') {
            return 'COMPLETED';
        } else if (['cancel', 'deny', 'expire', 'failure'].includes(transactionStatus)) {
            return 'FAILED';
        } else if (transactionStatus === 'pending') {
            return 'PENDING';
        }
        return 'PENDING';
    }
}

module.exports = new MidtransService();
