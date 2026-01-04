import axios from "axios"

/**
 * Axios instance
 * Central place to control API behavior
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json"
  }
})

/* =========================
   PATIENTS
========================= */

export const getPatients = () => API.get("/patients")

export const getPatientById = (patientId) =>
  API.get(`/patients/${patientId}`)

export const createPatient = (data) =>
  API.post("/patients", data)

export const getPatientAppointments = (patientId) =>
  API.get(`/patients/${patientId}/appointments`)


/* =========================
   APPOINTMENTS
========================= */

export const getAppointments = () =>
  API.get("/appointments")

export const getAppointmentById = (appointmentId) =>
  API.get(`/appointments/${appointmentId}`)

export const createAppointment = (data) =>
  API.post("/appointments", data)


/* =========================
   PRESCRIPTIONS
========================= */

export const createPrescription = (data) =>
  API.post("/prescriptions", data)

export const getPrescriptionByAppointment = (appointmentId) =>
  API.get(`/prescriptions/appointment/${appointmentId}`)

export const getPrescriptionsByPatient = (patientId) =>
  API.get(`/prescriptions/patient/${patientId}`)

export const getPrescriptionById = (prescriptionId) =>
  API.get(`/prescriptions/${prescriptionId}`)

export const deletePrescription = (prescriptionId) =>
  API.delete(`/prescriptions/${prescriptionId}`)


/* =========================
   BILLING
========================= */

export const createBill = (data) =>
  API.post("/billing", data)

export const getBillByAppointment = (appointmentId) =>
  API.get(`/billing/appointment/${appointmentId}`)

export const getAllBills = () =>
  API.get("/billing")

export const getBillsByPatient = (patientId) =>
  API.get(`/billing/patient/${patientId}`)

export const getBillById = (billId) =>
  API.get(`/billing/${billId}`)

export const updateBill = (billId, data) =>
  API.put(`/billing/${billId}`, data)

export const deleteBill = (billId) =>
  API.delete(`/billing/${billId}`)


/* =========================
   QUEUE MANAGEMENT
========================= */

export const getQueueStatus = (appointmentId) =>
  API.get(`/queue/${appointmentId}`)

export const createQueueToken = (data) =>
  API.post("/queue", data)


/* =========================
   AI ASSISTANT
========================= */

export const generatePrescriptionAI = (data) =>
  API.post("/ai/prescription-suggest", data)

export const generateSOAPNotes = (data) =>
  API.post("/ai/soap", data)

export default API
