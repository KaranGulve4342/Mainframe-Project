"use server"

import { apiClient } from "../api"
import { parseStringify } from "../utils"

// CREATE USER
export const createUser = async (user) => {
  try {
    const newUser = await apiClient.createUser(user)
    return parseStringify(newUser)
  } catch (error) {
    console.error("An error occurred while creating a new user:", error)
  }
}

// GET USER
export const getUser = async (userId) => {
  try {
    const user = await apiClient.getUser(userId)
    return parseStringify(user)
  } catch (error) {
    console.error("An error occurred while retrieving the user details:", error)
  }
}

// REGISTER PATIENT
export const registerPatient = async (patient) => {
  try {
    const newPatient = await apiClient.registerPatient(patient)
    return parseStringify(newPatient)
  } catch (error) {
    console.error("An error occurred while creating a new patient:", error)
  }
}

// GET PATIENT
export const getPatient = async (userId) => {
  try {
    const patient = await apiClient.getPatient(userId)
    return parseStringify(patient)
  } catch (error) {
    console.error("An error occurred while retrieving the patient details:", error)
  }
}
