const apiResponse = require('../../shared/utils/apiResponse');
const { GenerateBillDTO, GenerateBulkBillDTO } = require('./billing.dto');

class BillingController {
  constructor(billingService) {
    this.service = billingService;
  }

  generateBill = async (req, res) => {
    const dto = new GenerateBillDTO(req.validatedBody);
    const result = await this.service.generateBill(dto);
    return apiResponse(res, 201, 'Bill generated successfully', result);
  };

  generateBulkBills = async (req, res) => {
    const dto = new GenerateBulkBillDTO(req.validatedBody);
    const result = await this.service.generateBulkBills(req.user.id, dto);
    return apiResponse(res, 201, `Successfully generated ${result.generatedCount} bills`, result);
  };

  getBills = async (req, res) => {
    const result = await this.service.getBills(req.user, req.query);
    return apiResponse(res, 200, 'Bills fetched successfully', result);
  };

  getBillById = async (req, res) => {
    const result = await this.service.getBillById(req.user, req.params.id);
    return apiResponse(res, 200, 'Bill fetched successfully', result);
  };
}

module.exports = BillingController;
