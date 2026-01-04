import { useState, useEffect } from "react"
import {
  getPatients,
  getPrescriptionsByPatient,
  createPrescription,
  generatePrescriptionAI,
  deletePrescription,
} from "../services/api"
import "./Prescription.css"

const Prescription = () => {
  const [patients, setPatients] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState("")

  const [formData, setFormData] = useState({
    patientId: "",
    diagnosis: "",
    medicines: [],
    notes: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Fetch patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await getPatients()
        setPatients(res.data || [])
      } catch (err) {
        console.error("Error fetching patients:", err)
        const errorMsg = err.response?.data?.detail || "Failed to load patients"
        setError(typeof errorMsg === 'string' ? errorMsg : "Failed to load patients")
      }
    }
    fetchPatients()
  }, [])

  // Fetch prescriptions when patient is selected
  useEffect(() => {
    if (selectedPatientId) {
      const fetchPrescriptions = async () => {
        try {
          const res = await getPrescriptionsByPatient(selectedPatientId)
          setPrescriptions(res.data || [])
        } catch (err) {
          console.error("Error fetching prescriptions:", err)
        }
      }
      fetchPrescriptions()
    }
  }, [selectedPatientId])

  const handlePatientChange = (e) => {
    const patientId = e.target.value
    setSelectedPatientId(patientId)
    setFormData((prev) => ({ ...prev, patientId: patientId }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Generate AI medicines based on diagnosis
  const handleGenerateMedicines = async () => {
    if (!formData.diagnosis) {
      setError("Please enter diagnosis first")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Call AI to generate medicines based on diagnosis
      const aiRes = await generatePrescriptionAI({
        diagnosis: formData.diagnosis,
      })

      const aiMedicines = aiRes.data?.medicines || []

      // Update form with AI-generated medicines
      setFormData((prev) => ({
        ...prev,
        medicines: aiMedicines,
      }))

      setSuccess("✓ Medicines generated successfully!")
    } catch (err) {
      console.error("Error generating medicines:", err)
      
      // Extract proper error message
      let errorMsg = "Failed to generate medicines"
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (Array.isArray(detail)) {
          errorMsg = detail[0]?.msg || "Validation error"
        } else if (typeof detail === 'string') {
          errorMsg = detail
        }
      } else if (err.message) {
        errorMsg = err.message
      }
      
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Save prescription
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.patientId || !formData.diagnosis) {
      setError("Please select patient and enter diagnosis")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const prescriptionData = {
        patient_id: parseInt(formData.patientId),
        diagnosis: formData.diagnosis,
        medicines: formData.medicines,
        notes: formData.notes,
      }

      const res = await createPrescription(prescriptionData)

      // Refetch prescriptions for the patient
      const prescriptionsRes = await getPrescriptionsByPatient(formData.patientId)
      setPrescriptions(prescriptionsRes.data || [])

      // Reset form
      setFormData({
        patientId: formData.patientId,
        diagnosis: "",
        medicines: [],
        notes: "",
      })

      setSuccess("✓ Prescription saved successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error saving prescription:", err)
      
      // Extract proper error message from various response formats
      let errorMsg = "Failed to save prescription"
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        // If detail is an array (Pydantic validation errors), extract first message
        if (Array.isArray(detail)) {
          errorMsg = detail[0]?.msg || detail[0]?.message || "Validation error"
        } else if (typeof detail === 'string') {
          errorMsg = detail
        }
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message
      } else if (err.message) {
        errorMsg = err.message
      }
      
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Delete prescription
  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return
    }

    try {
      setLoading(true)
      await deletePrescription(prescriptionId)

      // Refetch prescriptions
      if (selectedPatientId) {
        const res = await getPrescriptionsByPatient(selectedPatientId)
        setPrescriptions(res.data || [])
      }

      setSuccess("✓ Prescription deleted successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error deleting prescription:", err)
      setError("Failed to delete prescription")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="prescription-page">
      {/* Header */}
      <div className="prescription-header">
        <div>
          <h2 className="prescription-title">E-Prescription</h2>
          <div className="prescription-subtitle">
            Create and manage digital prescriptions for patients
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="error-message">{typeof error === 'string' ? error : 'An error occurred'}</div>}
      {success && <div className="success-message">{typeof success === 'string' ? success : 'Success'}</div>}

      {/* Main Grid */}
      <div className="prescription-grid">
        {/* Left Card - Create Prescription */}
        <div className="prescription-card">
          <div className="card-header">
            <h3 className="card-title">Create Prescription</h3>
          </div>

          <form className="prescription-form" onSubmit={handleSubmit}>
            {/* Patient Selection */}
            <label className="form-label">
              Patient Name
              <select
                value={formData.patientId}
                onChange={handlePatientChange}
                className="form-input"
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} (ID: {patient.id})
                  </option>
                ))}
              </select>
            </label>

            {/* Diagnosis Input */}
            <label className="form-label">
              Diagnosis
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="E.g. Patient has fever and cough"
                rows="4"
                className="form-input"
              ></textarea>
              <button
                type="button"
                onClick={handleGenerateMedicines}
                disabled={loading || !formData.diagnosis}
                className="generate-btn"
              >
                {loading ? "Generating..." : "Generate Medicines (AI)"}
              </button>
            </label>

            {/* AI-Generated Medicines */}
            <label className="form-label">
              Medicines (Auto-generated by AI)
              <div className="medicines-list">
                {formData.medicines && formData.medicines.length > 0 ? (
                  formData.medicines.map((med, index) => (
                    <div key={index} className="medicine-item">
                      <div className="medicine-name">{med.name}</div>
                      <div className="medicine-details">
                        <span className="medicine-dosage">💊 {med.dosage}</span>
                        <span className="medicine-duration">📅 {med.duration}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-text">
                    Medicines will appear here after voice transcription
                  </p>
                )}
              </div>
            </label>

            {/* Notes */}
            <label className="form-label">
              Additional Notes
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="E.g. Take after meals, avoid dairy products"
                rows="2"
                className="form-input"
              ></textarea>
            </label>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !formData.patientId}
            >
              {loading ? "Saving..." : "Save Prescription"}
            </button>
          </form>
        </div>

        {/* Right Card - Patient Prescriptions */}
        <div className="prescription-card">
          <div className="card-header">
            <h3 className="card-title">
              Prescription History
              {selectedPatientId && (
                <span className="prescription-count">{prescriptions.length} records</span>
              )}
            </h3>
          </div>

          {!selectedPatientId ? (
            <div className="empty-state">
              <p>Select a patient to view prescriptions</p>
            </div>
          ) : prescriptions.length > 0 ? (
            <div className="prescriptions-list">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="prescription-record">
                  <div className="record-header">
                    <div className="record-title">
                      <div className="diagnosis">{prescription.diagnosis}</div>
                      <div className="timestamp">{formatDate(prescription.created_at)}</div>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeletePrescription(prescription.id)}
                      title="Delete this prescription"
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  {/* Medicines in Record */}
                  <div className="record-medicines">
                    <h4 className="medicines-heading">Medicines</h4>
                    {prescription.medicines && prescription.medicines.length > 0 ? (
                      <ul className="medicines-ul">
                        {prescription.medicines.map((med, idx) => (
                          <li key={idx} className="medicine-line">
                            <span className="med-name">{med.name}</span>
                            <span className="med-dosage">{med.dosage}</span>
                            <span className="med-duration">{med.duration}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-medicines">No medicines prescribed</p>
                    )}
                  </div>

                  {/* Transcribed Notes */}
                  {prescription.notes && (
                    <div className="record-notes">
                      <h4 className="notes-heading">Transcribed Notes</h4>
                      <p className="notes-text">{prescription.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No prescriptions for this patient yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Prescription

