const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `API error: ${response.status}`)
  }
  return response.json()
}

export const apiClient = {
  // User endpoints
  createUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    return handleResponse(response)
  },

  getUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`)
    return handleResponse(response)
  },

  // Patient endpoints
  registerPatient: async (patientData) => {
    const formData = new FormData()

    // Add all text fields to formData
    Object.keys(patientData).forEach((key) => {
      if (key !== "identificationDocument") {
        formData.append(key, patientData[key])
      }
    })

    // Add file if it exists
    if (patientData.identificationDocument) {
      // If identificationDocument is a FormData, extract the file object
      if (patientData.identificationDocument instanceof FormData) {
        const blobFile = patientData.identificationDocument.get("blobFile")
        if (blobFile) {
          formData.append("identificationDocument", blobFile)
        }
      } else {
        formData.append("identificationDocument", patientData.identificationDocument)
      }
    }

    const response = await fetch(`${API_BASE_URL}/patients/register`, {
      method: "POST",
      body: formData,
    })
    return handleResponse(response)
  },

  getPatient: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/patients/user/${userId}`)
    return handleResponse(response)
  },

  // Appointment endpoints
  createAppointment: async (appointmentData) => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointmentData),
    })
    return handleResponse(response)
  },

  getRecentAppointmentList: async () => {
    const response = await fetch(`${API_BASE_URL}/appointments/recent`)
    return handleResponse(response)
  },

  updateAppointment: async ({ appointmentId, userId, appointment, type, timeZone }) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        ...appointment,
      }),
    })

    const updatedAppointment = await handleResponse(response)

    // Send notification if needed
    if (type === "schedule" || type === "cancel") {
      const formattedDate = new Date(appointment.schedule).toLocaleString("en-US", {
        timeZone: timeZone || "UTC",
        dateStyle: "medium",
        timeStyle: "short",
      })

      const message =
        type === "schedule"
          ? `Your appointment is confirmed for ${formattedDate} with Dr. ${appointment.primaryPhysician}`
          : `We regret to inform that your appointment for ${formattedDate} is cancelled. Reason: ${appointment.cancellationReason}`

      await apiClient.sendSMSNotification(userId, `Greetings from CarePulse. ${message}`)
    }

    return updatedAppointment
  },

  getAppointment: async (appointmentId) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`)
    return handleResponse(response)
  },

  sendSMSNotification: async (userId, content) => {
    const response = await fetch(`${API_BASE_URL}/appointments/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, content }),
    })
    return handleResponse(response)
  },
}
