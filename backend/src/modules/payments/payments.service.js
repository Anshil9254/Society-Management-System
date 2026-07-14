const { NotFoundError, ConflictError, BadRequestError } = require('../../shared/errors');
const { PaymentResponseDTO } = require('./payments.dto');
const paginate = require('../../shared/utils/paginate');
const { ROLES } = require('../../shared/constants');

class PaymentsService {
  constructor(paymentsRepository, eventBus) {
    this.repository = paymentsRepository;
    this.eventBus = eventBus;
  }

  async recordPayment(userId, paymentDTO) {
    const { billId, amount, transactionId } = paymentDTO;

    // 1. Validate Bill
    const bill = await this.repository.findBillById(billId);
    if (!bill) {
      throw new NotFoundError('Maintenance Bill not found');
    }

    if (bill.status === 'paid') {
      throw new ConflictError('This bill is already fully paid');
    }

    // 2. Idempotency Check: Did this transactionId already process?
    // Handled natively by Prisma due to `@unique` constraint on transactionId, 
    // but we can also do a proactive check or rely on Prisma's P2002 error.
    try {
      // 3. Calculate new status
      const totalPaidSoFar = bill.payments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const newTotalPaid = totalPaidSoFar + parseFloat(amount);
      const billAmount = parseFloat(bill.amount);

      if (newTotalPaid > billAmount) {
        throw new BadRequestError(`Payment amount exceeds the due amount. Due: ${billAmount - totalPaidSoFar}`);
      }

      const newBillStatus = newTotalPaid === billAmount ? 'paid' : 'partially_paid';

      // 4. Execute Transaction
      const payment = await this.repository.processPayment(userId, paymentDTO, newBillStatus);

      // 5. Emit Event
      this.eventBus.emit('payment.received', payment);

      return new PaymentResponseDTO(payment);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('transaction_id')) {
        throw new ConflictError('A payment with this Transaction ID has already been recorded');
      }
      throw error;
    }
  }

  async getPayments(user, queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {};

    // Residents only see their own payments
    if (user.role === ROLES.RESIDENT) {
      filters.userId = user.id;
    } else if (queryParams.userId) {
      filters.userId = queryParams.userId;
    }

    if (queryParams.billId) filters.billId = queryParams.billId;

    const { payments, total } = await this.repository.findAllPayments(filters, skip, limit);
    const mapped = payments.map((p) => new PaymentResponseDTO(p));
    return paginate(mapped, total, page, limit);
  }
}

module.exports = PaymentsService;
