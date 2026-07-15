class ServiceRequestResponseDTO {
  constructor(sr) {
    this.id = sr.id;
    this.serviceType = sr.serviceType;
    this.preferredDate = sr.preferredDate;
    this.status = sr.status;
    this.notes = sr.notes;
    this.imageUrl = sr.imageUrl;
    this.createdAt = sr.createdAt;

    if (sr.user) {
      this.resident = {
        id: sr.user.id,
        email: sr.user.email,
        phone: sr.user.phone,
        profile: sr.user.residentProfile ? {
          fullName: sr.user.residentProfile.fullName,
          flat: sr.user.residentProfile.flat ? {
            flatNumber: sr.user.residentProfile.flat.flatNumber,
            block: sr.user.residentProfile.flat.block?.name
          } : null
        } : null
      };
    }
  }
}

class CreateServiceRequestDTO {
  constructor(data, imageUrl = null) {
    this.serviceType = data.serviceType;
    this.preferredDate = data.preferredDate;
    this.notes = data.notes;
    this.imageUrl = imageUrl;
  }
}

class UpdateServiceRequestStatusDTO {
  constructor(data) {
    this.status = data.status;
  }
}

module.exports = {
  ServiceRequestResponseDTO,
  CreateServiceRequestDTO,
  UpdateServiceRequestStatusDTO,
};
