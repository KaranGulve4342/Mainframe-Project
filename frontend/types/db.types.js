export const Gender = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
  }
  
  export const Status = {
    PENDING: "pending",
    SCHEDULED: "scheduled",
    CANCELLED: "cancelled",
  }
  
  export const Patient = {
    $id: "",
    userId: "",
    name: "",
    email: "",
    phone: "",
    birthDate: new Date(),
    gender: Gender.MALE,
    address: "",
    occupation: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    primaryPhysician: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    allergies: "",
    currentMedication: "",
    familyMedicalHistory: "",
    pastMedicalHistory: "",
    identificationType: "",
    identificationNumber: "",
    identificationDocumentUrl: "",
    privacyConsent: 0,
    $createdAt: new Date(),
  }
  
  export const Appointment = {
    $id: "",
    patient: Patient,
    schedule: new Date(),
    status: Status.PENDING,
    primaryPhysician: "",
    reason: "",
    note: "",
    userId: "",
    cancellationReason: null,
    $createdAt: new Date(),
  }
