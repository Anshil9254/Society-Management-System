class BillingRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createBill(data) {
    return this.prisma.maintenanceBill.create({
      data,
      include: { flat: { include: { block: true } } },
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
        include: { flat: { include: { block: true } } },
      }),
      this.prisma.maintenanceBill.count({ where: filters }),
    ]);
    return { bills, total };
  }

  async findBillById(id) {
    return this.prisma.maintenanceBill.findUnique({
      where: { id },
      include: { flat: { include: { block: true } } },
    });
  }

  async getAllFlats() {
    return this.prisma.flat.findMany();
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
}

module.exports = BillingRepository;
