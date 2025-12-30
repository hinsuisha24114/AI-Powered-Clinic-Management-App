import { useEffect, useState, useRef } from "react";
import { getPatients, createPrescription, generatePrescriptionAI, transcribeVoice, getPrescriptionsByPatient, deletePrescription } from "../services/api";
import "./Prescription.css";

const Prescription = () => {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    diagnosis: "",
    medicines: "",
    notes: ""
  });
  const [symptoms, setSymptoms] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPatients();
        setPatients(res.data || []);
      } catch (err) {
        setError("Could not load patients.");
      }
    })();
  }, []);

  useEffect(() => {
    if (form.patientId) {
      loadRecent(form.patientId);
    } else {
      setRecent([]);
    }
  }, [form.patientId]);

  const loadRecent = async (patientId) => {
    try {
      const res = await getPrescriptionsByPatient(patientId);
      setRecent(res.data || []);
    } catch {
      setRecent([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.patientId || !form.diagnosis || !form.medicines) {
      setError("Please fill patient, diagnosis and medicines.");
      return;
    }

    const medsArray = form.medicines
      .split("\n")
      .map((m) => m.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      await createPrescription({
        patient_id: Number(form.patientId),
        diagnosis: form.diagnosis,
        medicines: medsArray,
        notes: form.notes || undefined
      });
      setMessage("Prescription saved.");
      setForm({ patientId: "", diagnosis: "", medicines: "", notes: "" });
      setSymptoms("");
      loadRecent(form.patientId);
    } catch (err) {
      setError("Failed to save prescription.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    setError("");
    setMessage("");
    if (!form.diagnosis) {
      setError("Enter a diagnosis first.");
      return;
    }
    try {
      setAiLoading(true);
      const res = await generatePrescriptionAI({
        diagnosis: form.diagnosis,
        symptoms: symptoms || undefined
      });
      const medsText = (res.data.medicines || [])
        .map((m) => `${m.name} – ${m.dosage} – ${m.duration}`)
        .join("\n");
      setForm((prev) => ({
        ...prev,
        medicines: medsText,
        notes: res.data.notes || prev.notes
      }));
      setMessage("AI-generated medicines filled in. Please review.");
    } catch (err) {
      setError("Failed to generate with AI.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleTranscribe = async (file) => {
    if (!file) return;
    setError("");
    setMessage("");
    try {
      setTranscribing(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await transcribeVoice(fd);
      setSymptoms((prev) => (prev ? `${prev}\n${res.data.text}` : res.data.text));
      setMessage("Transcript added to symptoms.");
    } catch (err) {
      setError("Transcription failed. Ensure OPENAI_API_KEY is set.");
    } finally {
      setTranscribing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startRecording = async () => {
    setError("");
    setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        await handleTranscribe(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      setError("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
    }
    setRecording(false);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  return (
    <div className="eprescription-page">
      <div className="eprescription-header">
        <div>
          <h2 className="eprescription-title">E-Prescription</h2>
          <p className="eprescription-subtitle">
            Create and manage digital prescriptions for patients
          </p>
        </div>
        <div className="header-actions">
          <span className="badge soft">AI ready</span>
          <span className="badge soft blue">{patients.length} patients</span>
        </div>
      </div>

      <div className="eprescription-grid">
        <div className="eprescription-card">
          <div className="card-top">
            <h3 className="card-title">Prescription Details</h3>
          </div>

          {error && <div className="error-banner">{error}</div>}
          {message && <div className="success-banner">{message}</div>}

          <form className="prescription-form" onSubmit={handleSubmit}>
            <label className="form-label">
              Patient
              <select
                name="patientId"
                value={form.patientId}
                onChange={handleChange}
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (#{p.id})
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              Diagnosis
              <input
                name="diagnosis"
                type="text"
                placeholder="E.g. Fever, Diabetes"
                value={form.diagnosis}
                onChange={handleChange}
              />
            </label>

            <label className="form-label">
              Symptoms / Transcript
              <textarea
                name="symptoms"
                rows="3"
                placeholder="Optional: symptoms or voice transcript"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              ></textarea>
            <div className="voice-row">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => handleTranscribe(e.target.files?.[0])}
              />
              {transcribing && <span className="loading">Transcribing...</span>}
              <button
                type="button"
                className="secondary-btn"
                onClick={recording ? stopRecording : startRecording}
              >
                {recording ? "Stop Recording" : "Record Voice"}
              </button>
            </div>
            </label>

            <label className="form-label">
              Medicines (one per line)
              <textarea
                name="medicines"
                rows="4"
                placeholder="Paracetamol 500mg – twice a day"
                value={form.medicines}
                onChange={handleChange}
              ></textarea>
            </label>

            <label className="form-label">
              Instructions / Notes
              <textarea
                name="notes"
                rows="3"
                placeholder="E.g. Take after meals"
                value={form.notes}
                onChange={handleChange}
              ></textarea>
            </label>

            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={handleGenerateAI} disabled={aiLoading}>
                {aiLoading ? "Generating..." : "Generate with AI"}
              </button>
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Prescription"}
              </button>
            </div>
          </form>
        </div>

        <div className="eprescription-card">
          <div className="card-top">
            <h3 className="card-title">Recent Prescriptions</h3>
          </div>
          <div className="prescription-list">
            {recent.map((p) => (
              <div key={p.id} className="prescription-row">
                <div>
                  <div className="patient-name">{p.diagnosis}</div>
                  <div className="patient-notes">
                    {(p.medicines || []).slice(0, 2).join(", ")}
                  </div>
                </div>
                <div className="queue-actions">
                  <button
                    className="view-btn"
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        diagnosis: p.diagnosis,
                        medicines: (p.medicines || []).join("\n"),
                        notes: p.notes || ""
                      }));
                      setMessage("Loaded prescription into form. Edit and save to duplicate.");
                    }}
                  >
                    Load
                  </button>
                  <button
                    className="small-btn"
                    type="button"
                    onClick={async () => {
                      try {
                        await deletePrescription(p.id);
                        loadRecent(form.patientId);
                      } catch {
                        setError("Failed to delete prescription.");
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {recent.length === 0 && <div className="empty">No prescriptions yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prescription;
