class PaymentResponseDTO {
  constructor(payment) {
    this.id = payment.id;
    this.billId = payment.billId;
    this.amount = payment.amount;
    this.paymentMode = payment.paymentMode;
    this.transactionId = payment.transactionId;
    this.status = payment.status;
    this.paidAt = payment.paidAt;
    
    if (payment.bill) {
      this.bill = {
        month: payment.bill.billingMonth,
        year: payment.bill.billingYear,
        totalAmount: payment.bill.amount,
        billStatus: payment.bill.status,
      };
    }
  }
}

class RecordPaymentDTO {
  constructor(data) {
    this.billId = data.billId;
    this.amount = data.amount;
    this.paymentMode = data.paymentMode;
    this.transactionId = data.transactionId;
  }
}

module.exports = {
  PaymentResponseDTO,
  RecordPaymentDTO,
};
