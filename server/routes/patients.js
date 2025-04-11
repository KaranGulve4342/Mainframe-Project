const express = require("express")
const router = express.Router()
const path = require("path")
const multer = require("multer") // added multer
const upload = multer({ dest: "uploads/" }) // configured multer
const { executeQuery, generateUniqueId, formatDate } = require("../db")

// Register a new patient
// router.post("/register", upload.single("identificationDocument"), async (req, res) => {
//   try {
//     // Debug: Log request contents
//     console.log("Debug: Received registration request for userId:", req.body.userId);
//     console.log("Debug: Request body:", req.body);
//     console.log("Debug: File info:", req.file);

//     const {
//       userId,
//       name,
//       email,
//       phone,
//       birthDate,
//       gender,
//       address,
//       occupation,
//       emergencyContactName,
//       emergencyContactNumber,
//       primaryPhysician,
//       insuranceProvider,
//       insurancePolicyNumber,
//       allergies,
//       currentMedication,
//       familyMedicalHistory,
//       pastMedicalHistory,
//       identificationType,
//       identificationNumber,
//       privacyConsent,
//     } = req.body

//     console.log("Request body:", req.body)
//     console.log("File:", req.file)

//     if (!userId || !name || !email || !phone) {
//       return res.status(400).json({ error: "User ID, name, email, and phone are required" })
//     }
//     console.log("Debug: Valid input fields received");

//     // Check if user exists
//     const users = await executeQuery("SELECT * FROM USERS WHERE USERID = ?", [userId])

//     if (users.length === 0) {
//       return res.status(404).json({ error: "User not found" })
//     }
//     console.log("Debug: User found", users[0]);

//     // Check if patient already exists for this user
//     const existingPatients = await executeQuery("SELECT * FROM PATIENTS WHERE USERID = ?", [userId])

//     if (existingPatients.length > 0) {
//       return res.status(200).json({
//         $id: existingPatients[0].PATIENTID,
//         userId: existingPatients[0].USERID,
//         name: existingPatients[0].NAME,
//         email: existingPatients[0].EMAIL,
//         phone: existingPatients[0].PHONE,
//         birthDate: existingPatients[0].BIRTHDATE,
//         gender: existingPatients[0].GENDER,
//         address: existingPatients[0].ADDRESS,
//         occupation: existingPatients[0].OCCUPATION,
//         emergencyContactName: existingPatients[0].EMERGENCY_CONTACT_NAME,
//         emergencyContactNumber: existingPatients[0].EMERGENCY_CONTACT_NUMBER,
//         primaryPhysician: existingPatients[0].PRIMARY_PHYSICIAN,
//         insuranceProvider: existingPatients[0].INSURANCE_PROVIDER,
//         insurancePolicyNumber: existingPatients[0].INSURANCE_POLICY_NUMBER,
//         allergies: existingPatients[0].ALLERGIES,
//         currentMedication: existingPatients[0].CURRENT_MEDICATION,
//         familyMedicalHistory: existingPatients[0].FAMILY_MEDICAL_HISTORY,
//         pastMedicalHistory: existingPatients[0].PAST_MEDICAL_HISTORY,
//         identificationType: existingPatients[0].IDENTIFICATION_TYPE,
//         identificationNumber: existingPatients[0].IDENTIFICATION_NUMBER,
//         identificationDocumentUrl: existingPatients[0].IDENTIFICATION_DOCUMENT_PATH
//           ? `/uploads/${path.basename(existingPatients[0].IDENTIFICATION_DOCUMENT_PATH)}`
//           : null,
//         privacyConsent: !!existingPatients[0].PRIVACY_CONSENT,
//         $createdAt: existingPatients[0].CREATED_AT,
//       })
//     }
//     console.log("Debug: No existing patient found for user", userId);

//     // Process file upload
//     let identificationDocumentPath = null
//     if (req.file) {
//       identificationDocumentPath = req.file.path
//       console.log("Debug: File uploaded, path:", identificationDocumentPath);
//     } else {
//       console.log("Debug: No file uploaded");
//     }

//     // Create new patient
//     const patientId = generateUniqueId()
//     console.log("Debug: Generated patientId:", patientId);
//     const formattedBirthDate = new Date(birthDate).toISOString().substring(0, 10);
//     console.log("Debug: Formatted birthDate:", formattedBirthDate);
//     const privacyConsentValue = privacyConsent === "true" || privacyConsent === true ? 1 : 0
//     console.log("Debug: Privacy consent value:", privacyConsentValue);

//     await executeQuery(
//       `INSERT INTO PATIENTS (
//         PATIENTID, USERID, NAME, EMAIL, PHONE, BIRTHDATE, GENDER, ADDRESS, OCCUPATION,
//         EMERGENCY_CONTACT_NAME, EMERGENCY_CONTACT_NUMBER, PRIMARY_PHYSICIAN,
//         INSURANCE_PROVIDER, INSURANCE_POLICY_NUMBER, ALLERGIES, CURRENT_MEDICATION,
//         FAMILY_MEDICAL_HISTORY, PAST_MEDICAL_HISTORY, IDENTIFICATION_TYPE,
//         IDENTIFICATION_NUMBER, IDENTIFICATION_DOCUMENT_PATH, PRIVACY_CONSENT
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

//       [
//         patientId,
//         userId,
//         name,
//         email,
//         phone,
//         formattedBirthDate,
//         gender,
//         address,
//         occupation,
//         emergencyContactName,
//         emergencyContactNumber,
//         primaryPhysician,
//         insuranceProvider,
//         insurancePolicyNumber,
//         allergies,
//         currentMedication,
//         familyMedicalHistory,
//         pastMedicalHistory,
//         identificationType,
//         identificationNumber,
//         identificationDocumentPath,
//         privacyConsentValue,
//       ],
//     )
//     console.log("Debug: Patient record inserted into database");

//     const newPatient = {
//       $id: patientId,
//       userId,
//       name,
//       email,
//       phone,
//       birthDate: formattedBirthDate,
//       gender,
//       address,
//       occupation,
//       emergencyContactName,
//       emergencyContactNumber,
//       primaryPhysician,
//       insuranceProvider,
//       insurancePolicyNumber,
//       allergies,
//       currentMedication,
//       familyMedicalHistory,
//       pastMedicalHistory,
//       identificationType,
//       identificationNumber,
//       identificationDocumentUrl: identificationDocumentPath
//         ? `/uploads/${path.basename(identificationDocumentPath)}`
//         : null,
//       privacyConsent: !!privacyConsentValue,
//       $createdAt: new Date(),
//     }
//     console.log("Debug: New patient registration complete", newPatient);

//     res.status(201).json(newPatient)
//   } catch (error) {
//     console.error("Debug: Error during patient registration:", error);
//     res.status(500).json({ error: "Failed to register patient" })
//   }
// })

// // Get patient by user ID
// router.get("/user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params

//     const patients = await executeQuery("SELECT * FROM PATIENTS WHERE USERID = ?", [userId])

//     if (patients.length === 0) {
//       return res.status(404).json({ error: "Patient not found" })
//     }

//     const patient = patients[0]

//     res.status(200).json({
//       $id: patient.PATIENTID,
//       userId: patient.USERID,
//       name: patient.NAME,
//       email: patient.EMAIL,
//       phone: patient.PHONE,
//       birthDate: patient.BIRTHDATE,
//       gender: patient.GENDER,
//       address: patient.ADDRESS,
//       occupation: patient.OCCUPATION,
//       emergencyContactName: patient.EMERGENCY_CONTACT_NAME,
//       emergencyContactNumber: patient.EMERGENCY_CONTACT_NUMBER,
//       primaryPhysician: patient.PRIMARY_PHYSICIAN,
//       insuranceProvider: patient.INSURANCE_PROVIDER,
//       insurancePolicyNumber: patient.INSURANCE_POLICY_NUMBER,
//       allergies: patient.ALLERGIES,
//       currentMedication: patient.CURRENT_MEDICATION,
//       familyMedicalHistory: patient.FAMILY_MEDICAL_HISTORY,
//       pastMedicalHistory: patient.PAST_MEDICAL_HISTORY,
//       identificationType: patient.IDENTIFICATION_TYPE,
//       identificationNumber: patient.IDENTIFICATION_NUMBER,
//       identificationDocumentUrl: patient.IDENTIFICATION_DOCUMENT_PATH
//         ? `/uploads/${path.basename(patient.IDENTIFICATION_DOCUMENT_PATH)}`
//         : null,
//       privacyConsent: !!patient.PRIVACY_CONSENT,
//       $createdAt: patient.CREATED_AT,
//     })
//   } catch (error) {
//     console.error("Error getting patient:", error)
//     res.status(500).json({ error: "Failed to get patient" })
//   }
// })


// Register patients (supports both single and bulk registrations)
router.post("/register", async (req, res) => {
  try {
    console.log("📥 Incoming registration request");
    console.log("➡️ req.body:", req.body);

    // Check if the input is an array (bulk registration) or single object
    const isArray = Array.isArray(req.body);
    const patientsData = isArray ? req.body : [req.body];

    console.log(`🔄 Processing ${isArray ? 'bulk' : 'single'} registration with ${patientsData.length} records`);
    
    // To collect results
    const results = {
      successful: [],
      failed: []
    };

    // Process each patient registration
    for (const patientData of patientsData) {
      try {
        // Extract or normalize field names (supporting both camelCase and UPPERCASE)
        const userId = patientData.userId || patientData.USERID;
        const name = patientData.name || patientData.NAME;
        const email = patientData.email || patientData.EMAIL;
        const phone = patientData.phone || patientData.PHONE;

        // Basic validation
        if (!userId || !name || !email || !phone) {
          console.warn("⚠️ Missing required fields for patient:", { userId, name });
          results.failed.push({
            data: patientData,
            error: "User ID, name, email, and phone are required"
          });
          continue;
        }

        // Check if the user exists
        const users = await executeQuery("SELECT * FROM USERS WHERE USERID = ?", [userId]);

        if (users.length === 0) {
          console.warn("❌ User not found for userId:", userId);
          results.failed.push({
            data: patientData,
            error: "User not found"
          });
          continue;
        }

        console.log("👤 User found:", users[0]);

        // Check if patient already exists for this user
        const existingPatients = await executeQuery("SELECT * FROM PATIENTS WHERE USERID = ?", [userId]);

        if (existingPatients.length > 0) {
          console.log("⚠️ Patient already exists for user:", userId);
          results.successful.push({
            userId,
            name,
            message: "Patient already exists",
            patientId: existingPatients[0].PATIENTID
          });
          continue;
        }

        // Generate patient ID
        const patientId = generateUniqueId();
        
        // Create new patient (minimal version - could be expanded with more fields)
        await executeQuery(
          `INSERT INTO PATIENTS (
            PATIENTID, USERID, NAME, EMAIL, PHONE
          ) VALUES (?, ?, ?, ?, ?)`,
          [patientId, userId, name, email, phone]
        );

        results.successful.push({
          userId,
          name,
          message: "Patient successfully registered",
          patientId
        });

        console.log("✅ Registered patient:", { patientId, userId, name });

      } catch (patientError) {
        console.error("❌ Error processing patient:", patientError);
        results.failed.push({
          data: patientData,
          error: "Failed to process patient: " + patientError.message
        });
      }
    }

    // Return appropriate response based on results
    if (results.failed.length === 0) {
      return res.status(200).json({
        success: true,
        message: `Successfully registered ${results.successful.length} patients`,
        results: isArray ? results : results.successful[0]
      });
    } else if (results.successful.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to register any patients",
        errors: isArray ? results.failed : results.failed[0]
      });
    } else {
      return res.status(207).json({
        success: true,
        message: `Successfully registered ${results.successful.length} patients, ${results.failed.length} failed`,
        results
      });
    }

  } catch (error) {
    console.error("🔥 Error during patient registration:", error);
    res.status(500).json({ error: "Something went wrong on the server" });
  }
});


// get all patients
router.get("/", async (req, res) => {
  try {
    const patients = await executeQuery("SELECT * FROM PATIENTS");
    res.status(200).json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// get patientId and userId of all patients
router.get("/ids", async (req, res) => {
  try {
    const patients = await executeQuery("SELECT PATIENTID, USERID FROM PATIENTS");
    res.status(200).json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});



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
