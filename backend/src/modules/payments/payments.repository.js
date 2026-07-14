class PaymentsRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findBillById(billId) {
    return this.prisma.maintenanceBill.findUnique({
      where: { id: billId },
      include: { payments: true },
    });
  }

  /**
   * Processes a payment transactionally.
   * If successful, updates the MaintenanceBill status based on total paid vs bill amount.
   */
  async processPayment(userId, data, newBillStatus) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          billId: data.billId,
          userId,
          amount: data.amount,
          paymentMode: data.paymentMode,
          transactionId: data.transactionId,
          status: 'success', // For simplicity, assuming immediate success. In real-world, might be pending -> webhook -> success.
        },
        include: {
          bill: true,
        },
      });

      // 2. Update Bill status
      await tx.maintenanceBill.update({
        where: { id: data.billId },
        data: { status: newBillStatus },
      });

      return payment;
    });
  }

  async findAllPayments(filters = {}, skip = 0, take = 10) {
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: filters,
        skip,
        take,
        orderBy: { paidAt: 'desc' },
        include: { bill: true },
      }),
      this.prisma.payment.count({ where: filters }),
    ]);
    return { payments, total };
  }
}

module.exports = PaymentsRepository;
