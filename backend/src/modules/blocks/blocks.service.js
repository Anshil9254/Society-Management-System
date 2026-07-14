const { ConflictError, NotFoundError } = require('../../shared/errors');
const bcrypt = require('bcryptjs');

class BlocksService {
  constructor(blocksRepository) {
    this.repository = blocksRepository;
  }

  async getAllBlocks() {
    return this.repository.findAllBlocks();
  }

  async createBlock(data) {
    const existing = await this.repository.findBlockByName(data.name);
    if (existing) {
      throw new ConflictError(`Block/Wing with name "${data.name}" already exists`);
    }
    return this.repository.createBlock(data);
  }

  async updateBlock(id, data) {
    const existing = await this.repository.findBlockByName(data.name);
    if (existing && existing.id !== id) {
      throw new ConflictError(`Block/Wing with name "${data.name}" already exists`);
    }
    return this.repository.updateBlock(id, data);
  }

  async deleteBlock(id) {
    return this.repository.deleteBlock(id);
  }

  async createFlat(data) {
    const existing = await this.repository.findFlatByNumber(data.blockId, data.flatNumber);
    if (existing) {
      throw new ConflictError(`Flat "${data.flatNumber}" already exists in this wing`);
    }
    return this.repository.createFlat(data);
  }

  async addFamilyMember(data) {
    return this.repository.createFamilyMember(data);
  }

  async removeFamilyMember(id) {
    try {
      return await this.repository.deleteFamilyMember(id);
    } catch (err) {
      throw new NotFoundError('Family member not found');
    }
  }

  async assignPrimaryResident(flatId, data) {
    const existingUser = await this.repository.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError(`Email "${data.email}" is already registered`);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    const userData = {
      email: data.email,
      passwordHash,
      phone: data.phone
    };

    const profileData = {
      fullName: data.fullName,
      moveInDate: data.moveInDate || new Date(),
      isOwner: data.isOwner === true || data.isOwner === 'true'
    };

    return this.repository.createResidentWithUser(flatId, userData, profileData);
  }

  async removePrimaryResident(residentId) {
    const result = await this.repository.deleteResidentProfile(residentId);
    if (!result) {
      throw new NotFoundError('Resident profile not found');
    }
    return result;
  }

  async getMyFlat(userId) {
    const resident = await this.repository.findResidentProfileByUserId(userId);
    if (!resident) {
      throw new NotFoundError('No flat is assigned to your profile');
    }
    const flat = await this.repository.findFlatById(resident.flatId);
    if (!flat) {
      throw new NotFoundError('Flat not found');
    }
    return flat;
  }
}

module.exports = BlocksService;
