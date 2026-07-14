const { ConflictError, NotFoundError, ForbiddenError } = require('../../shared/errors');
const { BillResponseDTO } = require('./billing.dto');
const paginate = require('../../shared/utils/paginate');
const { ROLES } = require('../../shared/constants');

class BillingService {
  constructor(billingRepository, eventBus) {
    this.repository = billingRepository;
    this.eventBus = eventBus;
  }

  async generateBill(createDTO) {
    // Check if bill already exists for this flat/month/year
    const existing = await this.repository.findBillByMonth(
      createDTO.flatId,
      createDTO.billingMonth,
      createDTO.billingYear
    );

    if (existing) {
      throw new ConflictError('Bill already exists for this month and flat');
    }

    const bill = await this.repository.createBill({
      flatId: createDTO.flatId,
      billingMonth: createDTO.billingMonth,
      billingYear: createDTO.billingYear,
      amount: createDTO.amount,
      dueDate: new Date(createDTO.dueDate),
    });

    this.eventBus.emit('bill.generated', bill);

    return new BillResponseDTO(bill);
  }

  async generateBulkBills(adminId, bulkDTO) {
    // 1. Fetch flats (optionally filtered by blockId)
    const filters = {};
    if (bulkDTO.blockId) {
      filters.blockId = bulkDTO.blockId;
    }
    const flats = await this.repository.getAllFlats(filters);
    
    // 2. Prepare bill data based on flat square feet rate
    const billsData = flats.map((flat) => {
      // Calculate amount based on flat's squareFeet and the ratePerSqFt
      const sqft = flat.squareFeet || 1000; // fallback to 1000 sqft if not defined
      const amount = sqft * bulkDTO.ratePerSqFt;
      
      return {
        flatId: flat.id,
        billingMonth: bulkDTO.billingMonth,
        billingYear: bulkDTO.billingYear,
        amount,
        dueDate: new Date(bulkDTO.dueDate),
        status: 'pending',
      };
    }).filter(bill => bill.amount > 0); // Only generate if amount > 0

    if (billsData.length === 0) {
      throw new Error('No bills generated. Check rate configuration and flat types.');
    }

    // 3. Bulk insert (skipDuplicates = true handles existing bills safely)
    const result = await this.repository.createBulkBills(billsData);

    this.eventBus.emit('bill.bulkGenerated', {
      count: result.count,
      month: bulkDTO.billingMonth,
      year: bulkDTO.billingYear,
    });

    return { generatedCount: result.count };
  }

  async getBills(user, queryParams) {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {};

    // Resident can only see their own flat's bills
    if (user.role === ROLES.RESIDENT) {
      if (!user.residentProfile || !user.residentProfile.flatId) {
        return paginate([], 0, page, limit);
      }
      filters.flatId = user.residentProfile.flatId;
    } else if (queryParams.flatId) {
      // Admin/Committee can filter by specific flat
      filters.flatId = queryParams.flatId;
    }

    if (queryParams.status) filters.status = queryParams.status;
    if (queryParams.month) filters.billingMonth = parseInt(queryParams.month);
    if (queryParams.year) filters.billingYear = parseInt(queryParams.year);

    const { bills, total } = await this.repository.findAllBills(filters, skip, limit);
    const mapped = bills.map((b) => new BillResponseDTO(b));
    return paginate(mapped, total, page, limit);
  }

  async getBillById(user, billId) {
    const bill = await this.repository.findBillById(billId);
    if (!bill) {
      throw new NotFoundError('Bill not found');
    }

    if (user.role === ROLES.RESIDENT) {
      if (!user.residentProfile || bill.flatId !== user.residentProfile.flatId) {
        throw new ForbiddenError('You can only access bills for your own flat');
      }
    }

    return new BillResponseDTO(bill);
  }

  async payBill(user, billId, paymentMode = 'upi') {
    const bill = await this.repository.findBillById(billId);
    if (!bill) {
      throw new NotFoundError('Bill not found');
    }

    if (user.role === ROLES.RESIDENT) {
      if (!user.residentProfile || bill.flatId !== user.residentProfile.flatId) {
        throw new ForbiddenError('You can only pay bills for your own flat');
      }
    }

    if (bill.status === 'paid') {
      throw new ConflictError('Bill is already paid');
    }

    // Create payment record
    const payment = await this.repository.createPayment({
      billId: bill.id,
      userId: user.id,
      amount: bill.amount,
      paymentMode,
      status: 'success',
      transactionId: `TXN${Date.now()}`
    });

    // Update bill status
    await this.repository.updateBillStatus(bill.id, 'paid');

    this.eventBus.emit('bill.paid', payment);
    return payment;
  }

  async deleteBill(billId) {
    const bill = await this.repository.findBillById(billId);
    if (!bill) {
      throw new NotFoundError('Bill not found');
    }
    await this.repository.deleteBill(billId);
  }
}

module.exports = BillingService;
