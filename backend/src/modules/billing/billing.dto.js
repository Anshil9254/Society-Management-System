class BillResponseDTO {
  constructor(bill) {
    this.id = bill.id;
    this.billingMonth = bill.billingMonth;
    this.billingYear = bill.billingYear;
    this.amount = bill.amount;
    this.dueDate = bill.dueDate;
    this.status = bill.status;
    this.createdAt = bill.createdAt;
    
    if (bill.flat) {
      this.flat = {
        id: bill.flat.id,
        flatNumber: bill.flat.flatNumber,
        type: bill.flat.type,
        squareFeet: bill.flat.squareFeet,
        blockName: bill.flat.block?.name,
        leaderName: bill.flat.residents?.[0]?.fullName || null
      };
    }
  }
}

class GenerateBillDTO {
  constructor(data) {
    this.flatId = data.flatId;
    this.billingMonth = data.billingMonth;
    this.billingYear = data.billingYear;
    this.amount = data.amount;
    this.dueDate = data.dueDate;
  }
}

class GenerateBulkBillDTO {
  constructor(data) {
    this.billingMonth = data.billingMonth;
    this.billingYear = data.billingYear;
    this.dueDate = data.dueDate;
    this.ratePerSqFt = Number(data.ratePerSqFt);
    this.blockId = data.blockId || null;
  }
}

module.exports = {
  BillResponseDTO,
  GenerateBillDTO,
  GenerateBulkBillDTO,
};
