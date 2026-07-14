const apiResponse = require('../../shared/utils/apiResponse');

class BlocksController {
  constructor(blocksService) {
    this.service = blocksService;
  }

  getBlocks = async (req, res) => {
    const result = await this.service.getAllBlocks();
    return apiResponse(res, 200, 'Blocks fetched successfully', result);
  };

  createBlock = async (req, res) => {
    const result = await this.service.createBlock(req.body);
    return apiResponse(res, 201, 'Block created successfully', result);
  };

  updateBlock = async (req, res) => {
    const result = await this.service.updateBlock(req.params.id, req.body);
    return apiResponse(res, 200, 'Block updated successfully', result);
  };

  deleteBlock = async (req, res) => {
    await this.service.deleteBlock(req.params.id);
    return apiResponse(res, 200, 'Block deleted successfully');
  };

  createFlat = async (req, res) => {
    const data = {
      blockId: req.params.blockId,
      ...req.body
    };
    const result = await this.service.createFlat(data);
    return apiResponse(res, 201, 'Flat created successfully', result);
  };

  addFamilyMember = async (req, res) => {
    const data = {
      flatId: req.params.flatId,
      ...req.body
    };
    const result = await this.service.addFamilyMember(data);
    return apiResponse(res, 201, 'Family member added successfully', result);
  };

  deleteFamilyMember = async (req, res) => {
    await this.service.removeFamilyMember(req.params.id);
    return apiResponse(res, 200, 'Family member deleted successfully');
  };

  assignResident = async (req, res) => {
    const result = await this.service.assignPrimaryResident(req.params.flatId, req.body);
    return apiResponse(res, 201, 'Resident assigned successfully', result);
  };

  deleteResident = async (req, res) => {
    await this.service.removePrimaryResident(req.params.residentId);
    return apiResponse(res, 200, 'Resident removed successfully');
  };

  getMyFlat = async (req, res) => {
    const result = await this.service.getMyFlat(req.user.id);
    return apiResponse(res, 200, 'My Flat details fetched successfully', result);
  };
}

module.exports = BlocksController;
