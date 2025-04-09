"use server"

import { revalidatePath } from "next/cache"
import { apiClient } from "../api"
import { parseStringify } from "../utils"

//  CREATE APPOINTMENT
export const createAppointment = async (appointment) => {
  try {
    const newAppointment = await apiClient.createAppointment(appointment)
    revalidatePath("/admin")
    return parseStringify(newAppointment)
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error)
  }
}

//  GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    const appointments = await apiClient.getRecentAppointmentList()
    return parseStringify(appointments)
  } catch (error) {
    console.error("An error occurred while retrieving the recent appointments:", error)
  }
}

//  SEND SMS NOTIFICATION
export const sendSMSNotification = async (userId, content) => {
  try {
    const message = await apiClient.sendSMSNotification(userId, content)
    return parseStringify(message)
  } catch (error) {
    console.error("An error occurred while sending sms:", error)
  }
}

//  UPDATE APPOINTMENT
export const updateAppointment = async ({ appointmentId, userId, timeZone, appointment, type }) => {
  try {
    // Update appointment
    const updatedAppointment = await apiClient.updateAppointment({
      appointmentId,
      userId,
      timeZone,
      appointment,
      type,
    })

    revalidatePath("/admin")
    return parseStringify(updatedAppointment)
  } catch (error) {
    console.error("An error occurred while scheduling an appointment:", error)
  }
}

// GET APPOINTMENT
export const getAppointment = async (appointmentId) => {
  try {
    const appointment = await apiClient.getAppointment(appointmentId)
    return parseStringify(appointment)
  } catch (error) {
    console.error("An error occurred while retrieving the existing patient:", error)
  }
}
