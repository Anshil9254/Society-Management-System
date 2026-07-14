const apiResponse = require('../../shared/utils/apiResponse');
const { RecordPaymentDTO } = require('./payments.dto');

class PaymentsController {
  constructor(paymentsService) {
    this.service = paymentsService;
  }

  recordPayment = async (req, res) => {
    const dto = new RecordPaymentDTO(req.validatedBody);
    const result = await this.service.recordPayment(req.user.id, dto);
    
    return apiResponse(res, 201, 'Payment recorded successfully', result);
  };

  getPayments = async (req, res) => {
    const result = await this.service.getPayments(req.user, req.query);
    return apiResponse(res, 200, 'Payments fetched successfully', result);
  };
}

module.exports = PaymentsController;
