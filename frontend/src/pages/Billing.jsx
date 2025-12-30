import { useEffect, useState } from "react";
import { getPatients, createBill } from "../services/api";
import "./Billing.css";

function Billing() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    amount: "",
    status: "unpaid",
    note: ""
  });
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const generateBill = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.patientId || !form.amount) {
      setError("Please select patient and amount.");
      return;
    }

    try {
      setLoading(true);
      const res = await createBill({
        patient_id: Number(form.patientId),
        amount: Number(form.amount),
        status: form.status
      });
      setBill(res.data);
      setSummary(
        `Bill #${res.data.id} | Patient #${res.data.patient_id} | Amount ₹${res.data.amount} | Status: ${res.data.status}`
      );
      setForm({ patientId: "", amount: "", status: "unpaid", note: "" });
    } catch (err) {
      setError("Failed to create bill.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="billing-container">
      <h2>Billing</h2>
      {error && <div className="error-banner">{error}</div>}

      <form className="billing-form" onSubmit={generateBill}>
        <label>Patient</label>
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

        <label>Amount (₹)</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
        />

        <label>Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Generate Bill"}
        </button>
      </form>

      {bill && (
        <div className="bill-preview">
          <h3>Bill Summary</h3>
          <p><b>Bill ID:</b> {bill.id}</p>
          <p><b>Patient ID:</b> {bill.patient_id}</p>
          <p><b>Amount:</b> ₹{bill.amount}</p>
          <p><b>Status:</b> {bill.status}</p>
          <p><b>Date:</b> {bill.created_at ? new Date(bill.created_at).toLocaleString() : "-"}</p>
          {summary && <p><b>Summary:</b> {summary}</p>}
          <button
            type="button"
            onClick={() => {
              const text = summary || `Bill #${bill.id} Amount ₹${bill.amount} Status ${bill.status}`;
              navigator.clipboard?.writeText(text);
            }}
          >
            Copy Summary
          </button>
        </div>
      )}
    </div>
  );
}

export default Billing;
