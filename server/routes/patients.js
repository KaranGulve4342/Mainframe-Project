const express = require("express")
const router = express.Router()
const path = require("path")
const multer = require("multer") // added multer
const upload = multer({ dest: "uploads/" }) // configured multer
const { executeQuery, generateUniqueId, formatDate } = require("../db")

// Register a new patient
router.post("/register", upload.single("identificationDocument"), async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      phone,
      birthDate,
      gender,
      address,
      occupation,
      emergencyContactName,
      emergencyContactNumber,
      primaryPhysician,
      insuranceProvider,
      insurancePolicyNumber,
      allergies,
      currentMedication,
      familyMedicalHistory,
      pastMedicalHistory,
      identificationType,
      identificationNumber,
      privacyConsent,
    } = req.body

    if (!userId || !name || !email || !phone) {
      return res.status(400).json({ error: "User ID, name, email, and phone are required" })
    }

    // Check if user exists
    const users = await executeQuery("SELECT * FROM USERS WHERE USERID = ?", [userId])

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check if patient already exists for this user
    const existingPatients = await executeQuery("SELECT * FROM PATIENTS WHERE USERID = ?", [userId])

    if (existingPatients.length > 0) {
      return res.status(200).json({
        $id: existingPatients[0].PATIENTID,
        userId: existingPatients[0].USERID,
        name: existingPatients[0].NAME,
        email: existingPatients[0].EMAIL,
        phone: existingPatients[0].PHONE,
        birthDate: existingPatients[0].BIRTHDATE,
        gender: existingPatients[0].GENDER,
        address: existingPatients[0].ADDRESS,
        occupation: existingPatients[0].OCCUPATION,
        emergencyContactName: existingPatients[0].EMERGENCY_CONTACT_NAME,
        emergencyContactNumber: existingPatients[0].EMERGENCY_CONTACT_NUMBER,
        primaryPhysician: existingPatients[0].PRIMARY_PHYSICIAN,
        insuranceProvider: existingPatients[0].INSURANCE_PROVIDER,
        insurancePolicyNumber: existingPatients[0].INSURANCE_POLICY_NUMBER,
        allergies: existingPatients[0].ALLERGIES,
        currentMedication: existingPatients[0].CURRENT_MEDICATION,
        familyMedicalHistory: existingPatients[0].FAMILY_MEDICAL_HISTORY,
        pastMedicalHistory: existingPatients[0].PAST_MEDICAL_HISTORY,
        identificationType: existingPatients[0].IDENTIFICATION_TYPE,
        identificationNumber: existingPatients[0].IDENTIFICATION_NUMBER,
        identificationDocumentUrl: existingPatients[0].IDENTIFICATION_DOCUMENT_PATH
          ? `/uploads/${path.basename(existingPatients[0].IDENTIFICATION_DOCUMENT_PATH)}`
          : null,
        privacyConsent: !!existingPatients[0].PRIVACY_CONSENT,
        $createdAt: existingPatients[0].CREATED_AT,
      })
    }

    // Process file upload
    let identificationDocumentPath = null
    if (req.file) {
      identificationDocumentPath = req.file.path
    }

    // Create new patient
    const patientId = generateUniqueId()
    const formattedBirthDate = formatDate(birthDate)
    const privacyConsentValue = privacyConsent === "true" || privacyConsent === true ? 1 : 0

    await executeQuery(
      `INSERT INTO PATIENTS (
        PATIENTID, USERID, NAME, EMAIL, PHONE, BIRTHDATE, GENDER, ADDRESS, OCCUPATION,
        EMERGENCY_CONTACT_NAME, EMERGENCY_CONTACT_NUMBER, PRIMARY_PHYSICIAN,
        INSURANCE_PROVIDER, INSURANCE_POLICY_NUMBER, ALLERGIES, CURRENT_MEDICATION,
        FAMILY_MEDICAL_HISTORY, PAST_MEDICAL_HISTORY, IDENTIFICATION_TYPE,
        IDENTIFICATION_NUMBER, IDENTIFICATION_DOCUMENT_PATH, PRIVACY_CONSENT
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

      [
        patientId,
        userId,
        name,
        email,
        phone,
        formattedBirthDate,
        gender,
        address,
        occupation,
        emergencyContactName,
        emergencyContactNumber,
        primaryPhysician,
        insuranceProvider,
        insurancePolicyNumber,
        allergies,
        currentMedication,
        familyMedicalHistory,
        pastMedicalHistory,
        identificationType,
        identificationNumber,
        identificationDocumentPath,
        privacyConsentValue,
      ],
    )

    const newPatient = {
      $id: patientId,
      userId,
      name,
      email,
      phone,
      birthDate: formattedBirthDate,
      gender,
      address,
      occupation,
      emergencyContactName,
      emergencyContactNumber,
      primaryPhysician,
      insuranceProvider,
      insurancePolicyNumber,
      allergies,
      currentMedication,
      familyMedicalHistory,
      pastMedicalHistory,
      identificationType,
      identificationNumber,
      identificationDocumentUrl: identificationDocumentPath
        ? `/uploads/${path.basename(identificationDocumentPath)}`
        : null,
      privacyConsent: !!privacyConsentValue,
      $createdAt: new Date(),
    }

    res.status(201).json(newPatient)
  } catch (error) {
    console.error("Error registering patient:", error)
    res.status(500).json({ error: "Failed to register patient" })
  }
})

// Get patient by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const patients = await executeQuery("SELECT * FROM PATIENTS WHERE USERID = ?", [userId])

    if (patients.length === 0) {
      return res.status(404).json({ error: "Patient not found" })
    }

    const patient = patients[0]

    res.status(200).json({
      $id: patient.PATIENTID,
      userId: patient.USERID,
      name: patient.NAME,
      email: patient.EMAIL,
      phone: patient.PHONE,
      birthDate: patient.BIRTHDATE,
      gender: patient.GENDER,
      address: patient.ADDRESS,
      occupation: patient.OCCUPATION,
      emergencyContactName: patient.EMERGENCY_CONTACT_NAME,
      emergencyContactNumber: patient.EMERGENCY_CONTACT_NUMBER,
      primaryPhysician: patient.PRIMARY_PHYSICIAN,
      insuranceProvider: patient.INSURANCE_PROVIDER,
      insurancePolicyNumber: patient.INSURANCE_POLICY_NUMBER,
      allergies: patient.ALLERGIES,
      currentMedication: patient.CURRENT_MEDICATION,
      familyMedicalHistory: patient.FAMILY_MEDICAL_HISTORY,
      pastMedicalHistory: patient.PAST_MEDICAL_HISTORY,
      identificationType: patient.IDENTIFICATION_TYPE,
      identificationNumber: patient.IDENTIFICATION_NUMBER,
      identificationDocumentUrl: patient.IDENTIFICATION_DOCUMENT_PATH
        ? `/uploads/${path.basename(patient.IDENTIFICATION_DOCUMENT_PATH)}`
        : null,
      privacyConsent: !!patient.PRIVACY_CONSENT,
      $createdAt: patient.CREATED_AT,
    })
  } catch (error) {
    console.error("Error getting patient:", error)
    res.status(500).json({ error: "Failed to get patient" })
  }
})

// Get patient by ID
router.get("/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params

    const patients = await executeQuery("SELECT * FROM PATIENTS WHERE PATIENTID = ?", [patientId])

    if (patients.length === 0) {
      return res.status(404).json({ error: "Patient not found" })
    }

    const patient = patients[0]

    res.status(200).json({
      $id: patient.PATIENTID,
      userId: patient.USERID,
      name: patient.NAME,
      email: patient.EMAIL,
      phone: patient.PHONE,
      birthDate: patient.BIRTHDATE,
      gender: patient.GENDER,
      address: patient.ADDRESS,
      occupation: patient.OCCUPATION,
      emergencyContactName: patient.EMERGENCY_CONTACT_NAME,
      emergencyContactNumber: patient.EMERGENCY_CONTACT_NUMBER,
      primaryPhysician: patient.PRIMARY_PHYSICIAN,
      insuranceProvider: patient.INSURANCE_PROVIDER,
      insurancePolicyNumber: patient.INSURANCE_POLICY_NUMBER,
      allergies: patient.ALLERGIES,
      currentMedication: patient.CURRENT_MEDICATION,
      familyMedicalHistory: patient.FAMILY_MEDICAL_HISTORY,
      pastMedicalHistory: patient.PAST_MEDICAL_HISTORY,
      identificationType: patient.IDENTIFICATION_TYPE,
      identificationNumber: patient.IDENTIFICATION_NUMBER,
      identificationDocumentUrl: patient.IDENTIFICATION_DOCUMENT_PATH
        ? `/uploads/${path.basename(patient.IDENTIFICATION_DOCUMENT_PATH)}`
        : null,
      privacyConsent: !!patient.PRIVACY_CONSENT,
      $createdAt: patient.CREATED_AT,
    })
  } catch (error) {
    console.error("Error getting patient:", error)
    res.status(500).json({ error: "Failed to get patient" })
  }
})

module.exports = router
