import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getPatientById } from "../services/api"

function PatientDetail() {
  const { patientId } = useParams()
  const [patient, setPatient] = useState(null)

  useEffect(() => {
    getPatientById(patientId).then(res => setPatient(res.data))
  }, [patientId])

  if (!patient) return <p>Loading...</p>

  return (
    <div className="page">
      <h1>{patient.name}</h1>
      <p>Age: {patient.age}</p>
      <p>Gender: {patient.gender}</p>
      <p>Phone: {patient.phone}</p>

      <h3>Appointments</h3>
      <p>Appointments will load here</p>
    </div>
  )
}

export default PatientDetail
