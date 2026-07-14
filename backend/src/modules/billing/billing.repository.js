class BillingRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createBill(data) {
    return this.prisma.maintenanceBill.create({
      data,
      include: { flat: { include: { block: true, residents: true } } },
    });
  }

  async findBillByMonth(flatId, billingMonth, billingYear) {
    return this.prisma.maintenanceBill.findUnique({
      where: {
        flatId_billingMonth_billingYear: {
          flatId,
          billingMonth,
          billingYear,
        },
      },
    });
  }

  async findAllBills(filters = {}, skip = 0, take = 10) {
    const [bills, total] = await Promise.all([
      this.prisma.maintenanceBill.findMany({
        where: filters,
        skip,
        take,
        orderBy: [{ billingYear: 'desc' }, { billingMonth: 'desc' }],
        include: { flat: { include: { block: true, residents: true } } },
      }),
      this.prisma.maintenanceBill.count({ where: filters }),
    ]);
    return { bills, total };
  }

  async findBillById(id) {
    return this.prisma.maintenanceBill.findUnique({
      where: { id },
      include: { flat: { include: { block: true, residents: true } } },
    });
  }

  async getAllFlats(filters = {}) {
    return this.prisma.flat.findMany({ where: filters });
  }

  /**
   * Bulk insert bills using Prisma's createMany.
   */
  async createBulkBills(billsData) {
    return this.prisma.maintenanceBill.createMany({
      data: billsData,
      skipDuplicates: true, // Prevents crashing if a bill for that month/year already exists
    });
  }

  async createPayment(data) {
    return this.prisma.payment.create({ data });
  }

  async updateBillStatus(id, status) {
    return this.prisma.maintenanceBill.update({
      where: { id },
      data: { status }
    });
  }

  async deleteBill(id) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Delete associated payments first to prevent foreign key constraint violations
      await tx.payment.deleteMany({
        where: { billId: id }
      });
      
      // 2. Delete the bill
      return tx.maintenanceBill.delete({
        where: { id }
      });
    });
  }
}

module.exports = BillingRepository;
