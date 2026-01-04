import { useState, useEffect, useMemo, useRef } from "react";
import { getPatients, createBill, getBillsByPatient, updateBill, deleteBill } from "../services/api";
import "./Billing.css";

function Billing() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const dropdownRef = useRef(null);

  // Load patients on component mount
  useEffect(() => {
    loadPatients();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load bills when patient is selected
  useEffect(() => {
    if (selectedPatientId) {
      loadBills(selectedPatientId);
    } else {
      setBills([]);
    }
  }, [selectedPatientId]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients();
      // sort alphabetically by name
      const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));
      setPatients(sorted);
      setError("");
    } catch (err) {
      setError("Failed to load patients");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBills = async (patientId) => {
    try {
      setLoading(true);
      const response = await getBillsByPatient(patientId);
      setBills(response.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load bills");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.name.toLowerCase().includes(q));
  }, [patients, searchQuery]);

  const handlePatientSelectFromList = (patient) => {
    setSelectedPatientId(patient.id);
    setSelectedPatientName(patient.name);
    setSearchQuery(patient.name);
    setShowDropdown(false);
    // Ensure the selected patient is present in the patients list and keep it sorted
    setPatients((prev) => {
      const exists = prev.some((p) => p.id === patient.id);
      if (exists) return prev;
      const next = [...prev, patient].sort((a, b) => a.name.localeCompare(b.name));
      return next;
    });
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();

    if (!selectedPatientId || !amount || !description) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await createBill({
        patient_id: selectedPatientId,
        amount: parseFloat(amount),
        description,
        status: "unpaid",
      });

      setBills([...bills, response.data]);
      setAmount("");
      setDescription("");
      setSuccess("Bill created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setError("");
    } catch (err) {
      setError("Failed to create bill");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBillStatus = async (billId, newStatus) => {
    try {
      setLoading(true);
      const response = await updateBill(billId, { status: newStatus });

      setBills(
        bills.map((bill) =>
          bill.id === billId ? response.data : bill
        )
      );
      setSuccess("Bill updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setError("");
    } catch (err) {
      setError("Failed to update bill");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteBill(billId);

      setBills(bills.filter((bill) => bill.id !== billId));
      setSuccess("Bill deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setError("");
    } catch (err) {
      setError("Failed to delete bill");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    return bills.reduce((sum, bill) => sum + (bill.amount || 0), 0).toFixed(2);
  };

  const calculatePaidAmount = () => {
    return bills
      .filter((bill) => bill.status === "paid")
      .reduce((sum, bill) => sum + (bill.amount || 0), 0)
      .toFixed(2);
  };

  const calculateUnpaidAmount = () => {
    return bills
      .filter((bill) => bill.status === "unpaid")
      .reduce((sum, bill) => sum + (bill.amount || 0), 0)
      .toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="billing-container">
      <h2>Billing Management</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading && <div className="loading">Loading...</div>}

      <div className="billing-content">
        {/* Create Bill Section */}
        <div className="create-bill-section">
          <h3>Create New Bill</h3>

          <form className="billing-form" onSubmit={handleCreateBill}>
            <div className="form-group" ref={dropdownRef}>
              <label htmlFor="patient-search">Select Patient *</label>
              <input
                id="patient-search"
                type="text"
                placeholder="Search patient by name..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
                required
              />

              {showDropdown && (
                <ul className="search-dropdown">
                  {filteredPatients.length === 0 ? (
                    <li className="no-results">No patients</li>
                  ) : (
                    filteredPatients.map((p) => (
                      <li key={p.id} onMouseDown={() => handlePatientSelectFromList(p)}>
                        {p.name} (ID: {p.id})
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Service Description *</label>
              <input
                id="description"
                type="text"
                placeholder="e.g., Consultation, Checkup, Medicine"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (₹) *</label>
              <input
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Bill"}
            </button>
          </form>
        </div>

        {/* Bills List Section */}
        {selectedPatientId && (
          <div className="bills-section">
            <h3>Bills for {selectedPatientName}</h3>

            {bills.length === 0 ? (
              <p className="no-bills">No bills found for this patient</p>
            ) : (
              <>
                <div className="bill-summary">
                  <div className="summary-card">
                    <h4>Total Amount</h4>
                    <p className="amount">₹{calculateTotalAmount()}</p>
                  </div>
                  <div className="summary-card paid">
                    <h4>Paid</h4>
                    <p className="amount">₹{calculatePaidAmount()}</p>
                  </div>
                  <div className="summary-card unpaid">
                    <h4>Pending</h4>
                    <p className="amount">₹{calculateUnpaidAmount()}</p>
                  </div>
                </div>

                <div className="bills-list">
                  <table>
                    <thead>
                      <tr>
                        <th>Bill ID</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((bill) => (
                        <tr key={bill.id}>
                          <td>#{bill.id}</td>
                          <td>{bill.description || "N/A"}</td>
                          <td className="amount">₹{(bill.amount || 0).toFixed(2)}</td>
                          <td>{formatDate(bill.created_at)}</td>
                          <td>
                            <span
                              className={`status-badge status-${bill.status.toLowerCase()}`}
                            >
                              {bill.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="actions">
                            {bill.status === "unpaid" ? (
                              <button
                                className="btn-small btn-success"
                                onClick={() =>
                                  handleUpdateBillStatus(bill.id, "paid")
                                }
                                disabled={loading}
                              >
                                Mark Paid
                              </button>
                            ) : (
                              <button
                                className="btn-small btn-warning"
                                onClick={() =>
                                  handleUpdateBillStatus(bill.id, "unpaid")
                                }
                                disabled={loading}
                              >
                                Mark Unpaid
                              </button>
                            )}
                            <button
                              className="btn-small btn-danger"
                              onClick={() => handleDeleteBill(bill.id)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Billing;
