const express = require("express")
const router = express.Router()
const { executeQuery, generateUniqueId, formatDate } = require("../db") 
const twilio = require('twilio');


const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Add helper to convert a date string into DB2 format (YYYY-MM-DD HH:mm:ss)
function convertToDb2Format(dateStr) {
	const date = new Date(dateStr)
	const pad = (num) => num.toString().padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

// Create a new appointment
router.post("/", async (req, res) => {
  // Debug log for incoming appointment creation request
  console.debug("[appointments] POST / - Request Body:", req.body)
  try {
    const { userId, patient: patientId, primaryPhysician, schedule, reason, status, note } = req.body

    if (!userId || !patientId || !primaryPhysician || !schedule || !status) {
      return res.status(400).json({
        error: "User ID, patient ID, primary physician, schedule, and status are required",
      })
    }

    // Check if patient exists
    const patients = await executeQuery("SELECT * FROM PATIENTS WHERE PATIENTID = ?", [patientId])

    if (patients.length === 0) {
      return res.status(404).json({ error: "Patient not found" })
    }

    // Create new appointment
    const appointmentId = generateUniqueId()
    const formattedSchedule = convertToDb2Format(schedule)

    await executeQuery(
      `INSERT INTO APPOINTMENTS (
        APPOINTMENTID, PATIENTID, USERID, PRIMARY_PHYSICIAN, SCHEDULE, REASON, NOTE, STATUS
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

      [appointmentId, patientId, userId, primaryPhysician, formattedSchedule, reason, note, status],
    )

    // Get patient details for response
    const patient = patients[0]

    const newAppointment = {
      $id: appointmentId,
      patient: {
        $id: patient.PATIENTID,
        name: patient.NAME,
        email: patient.EMAIL,
        phone: patient.PHONE,
      },
      userId,
      primaryPhysician,
      schedule: formattedSchedule,
      reason,
      note,
      status,
      cancellationReason: null,
      $createdAt: new Date(),
    }

    res.status(201).json(newAppointment)
  } catch (error) {
    console.error("Error creating appointment:", error)
    res.status(500).json({ error: "Failed to create appointment" })
  }
})

// Get recent appointments
router.get("/recent", async (req, res) => {
  // Debug log for incoming recent appointments request
  console.debug("[appointments] GET /recent - Request received")
  try {
    // Get all appointments ordered by creation date
    const appointments = await executeQuery(
      `SELECT a.*, p.NAME as PATIENT_NAME, p.EMAIL as PATIENT_EMAIL, p.PHONE as PATIENT_PHONE
       FROM APPOINTMENTS a
       JOIN PATIENTS p ON a.PATIENTID = p.PATIENTID
       ORDER BY a.CREATED_AT DESC`,
    )

    // Count appointments by status
    const statusCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    }

    const formattedAppointments = appointments.map((appointment) => {
      // Update status counts
      if (appointment.STATUS === "scheduled") {
        statusCounts.scheduledCount++
      } else if (appointment.STATUS === "pending") {
        statusCounts.pendingCount++
      } else if (appointment.STATUS === "cancelled") {
        statusCounts.cancelledCount++
      }

      return {
        $id: appointment.APPOINTMENTID,
        patient: {
          $id: appointment.PATIENTID,
          name: appointment.PATIENT_NAME,
          email: appointment.PATIENT_EMAIL,
          phone: appointment.PATIENT_PHONE,
        },
        userId: appointment.USERID,
        primaryPhysician: appointment.PRIMARY_PHYSICIAN,
        schedule: appointment.SCHEDULE,
        reason: appointment.REASON,
        note: appointment.NOTE,
        status: appointment.STATUS,
        cancellationReason: appointment.CANCELLATION_REASON,
        $createdAt: appointment.CREATED_AT,
      }
    })

    const response = {
      totalCount: appointments.length,
      ...statusCounts,
      documents: formattedAppointments,
    }

    res.status(200).json(response)
  } catch (error) {
    console.error("Error getting recent appointments:", error)
    res.status(500).json({ error: "Failed to get recent appointments" })
  }
})

// Update appointment
router.put("/:appointmentId", async (req, res) => {
  // Debug log for incoming update appointment request
  console.debug("[appointments] PUT /:appointmentId - Request Body:", req.body)
  try {
    const { appointmentId } = req.params
    const { primaryPhysician, schedule, status, cancellationReason } = req.body

    if (!primaryPhysician || !schedule || !status) {
      return res.status(400).json({
        error: "Primary physician, schedule, and status are required",
      })
    }

    // Check if appointment exists
    const appointments = await executeQuery("SELECT * FROM APPOINTMENTS WHERE APPOINTMENTID = ?", [appointmentId])

    if (appointments.length === 0) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    const formattedSchedule = convertToDb2Format(schedule)

    // Update appointment
    await executeQuery(
      `UPDATE APPOINTMENTS SET 
        PRIMARY_PHYSICIAN = ?, 
        SCHEDULE = ?, 
        STATUS = ?, 
        CANCELLATION_REASON = ?
       WHERE APPOINTMENTID = ?`,
      [primaryPhysician, formattedSchedule, status, cancellationReason || null, appointmentId],
    )

    // Get updated appointment
    const updatedAppointments = await executeQuery(
      `SELECT a.*, p.NAME as PATIENT_NAME, p.EMAIL as PATIENT_EMAIL, p.PHONE as PATIENT_PHONE
       FROM APPOINTMENTS a
       JOIN PATIENTS p ON a.PATIENTID = p.PATIENTID
       WHERE a.APPOINTMENTID = ?`,
      [appointmentId],
    )

    if (updatedAppointments.length === 0) {
      return res.status(404).json({ error: "Updated appointment not found" })
    }

    const appointment = updatedAppointments[0]

    const response = {
      $id: appointment.APPOINTMENTID,
      patient: {
        $id: appointment.PATIENTID,
        name: appointment.PATIENT_NAME,
        email: appointment.PATIENT_EMAIL,
        phone: appointment.PATIENT_PHONE,
      },
      userId: appointment.USERID,
      primaryPhysician: appointment.PRIMARY_PHYSICIAN,
      schedule: appointment.SCHEDULE,
      reason: appointment.REASON,
      note: appointment.NOTE,
      status: appointment.STATUS,
      cancellationReason: appointment.CANCELLATION_REASON,
      $createdAt: appointment.CREATED_AT,
    }

    res.status(200).json(response)
  } catch (error) {
    console.error("Error updating appointment:", error)
    res.status(500).json({ error: "Failed to update appointment" })
  }
})

// Get appointment by ID
router.get("/:appointmentId", async (req, res) => {
  // Debug log for fetching an appointment by ID
  console.debug("[appointments] GET /:appointmentId - Params:", req.params)
  try {
    const { appointmentId } = req.params

    const appointments = await executeQuery(
      `SELECT a.*, p.NAME as PATIENT_NAME, p.EMAIL as PATIENT_EMAIL, p.PHONE as PATIENT_PHONE
       FROM APPOINTMENTS a
       JOIN PATIENTS p ON a.PATIENTID = p.PATIENTID
       WHERE a.APPOINTMENTID = ?`,
      [appointmentId],
    )

    if (appointments.length === 0) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    const appointment = appointments[0]

    const response = {
      $id: appointment.APPOINTMENTID,
      patient: {
        $id: appointment.PATIENTID,
        name: appointment.PATIENT_NAME,
        email: appointment.PATIENT_EMAIL,
        phone: appointment.PATIENT_PHONE,
      },
      userId: appointment.USERID,
      primaryPhysician: appointment.PRIMARY_PHYSICIAN,
      schedule: appointment.SCHEDULE,
      reason: appointment.REASON,
      note: appointment.NOTE,
      status: appointment.STATUS,
      cancellationReason: appointment.CANCELLATION_REASON,
      $createdAt: appointment.CREATED_AT,
    }

    res.status(200).json(response)
  } catch (error) {
    console.error("Error getting appointment:", error)
    res.status(500).json({ error: "Failed to get appointment" })
  }
})

// Send SMS notification (mock implementation)
router.post("/notify", async (req, res) => {
  // Debug log for incoming SMS notification request
  console.debug("[appointments] POST /notify - Request Body:", req.body)
  try {
    const { userId, content } = req.body

    if (!userId || !content) {
      return res.status(400).json({ error: "User ID and content are required" })
    }


    console.log("userId : ", userId);
    console.log("content : ", content);

    // Format mobile number if necessary (e.g., ensure it starts with '+')
    const formattedMobile = userId.startsWith('+') ? userId : `+${userId}`;

    // Send SMS via Twilio
    const message = await twilioClient.messages.create({
      body: content,
      to: formattedMobile,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    // Log the message SID
    console.log(`SMS sent with SID: ${message.sid}`);

    res.status(200).json({
      $id: message.sid,
      userId,
      content,
      status: "sent",
      $createdAt: new Date(),
    })
  } catch (error) {
    console.error("Error sending SMS notification:", error)
    res.status(500).json({ error: "Failed to send SMS notification" })
  }
})

module.exports = router
