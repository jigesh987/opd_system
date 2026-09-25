import { useState, useEffect, useMemo } from "react";
import { api, type DoctorApi } from "../data/api";

const DEPARTMENTS = [
  "General Medicine",
  "Dermatology",
  "Orthopedics",
  "Gynecology",
  "Pediatrics",
  "ENT",
  "Ophthalmology",
  "Dentistry",
  "Emergency",
];

interface DoctorFormState {
  name: string;
  department: string;
  specialization: string;
  qualification: string;
  experience: string;
  cabinNo: string;
  opdDays: string;
  availableSlots: string;
  active: boolean;
}

const initialForm: DoctorFormState = {
  name: "",
  department: "General Medicine",
  specialization: "",
  qualification: "",
  experience: "",
  cabinNo: "",
  opdDays: "Mon – Sat",
  availableSlots: "09:00 AM,09:30 AM,10:00 AM,10:30 AM,11:00 AM,02:00 PM,02:30 PM,03:00 PM",
  active: true,
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<DoctorApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorApi | null>(null);
  const [formData, setFormData] = useState<DoctorFormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAdminDoctors();
      setDoctors(data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load doctors list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Filtered doctors list
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.department.toLowerCase().includes(search.toLowerCase()) ||
        (doc.specialization ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (doc.cabinNo ?? "").toLowerCase().includes(search.toLowerCase());

      const matchDept = deptFilter === "ALL" || doc.department === deptFilter;

      const isActive = doc.active !== false;
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && isActive) ||
        (statusFilter === "INACTIVE" && !isActive);

      return matchSearch && matchDept && matchStatus;
    });
  }, [doctors, search, deptFilter, statusFilter]);

  const openAddModal = () => {
    setEditingDoctor(null);
    setFormData(initialForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (doc: DoctorApi) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.name,
      department: doc.department,
      specialization: doc.specialization ?? "",
      qualification: doc.qualification ?? "",
      experience: doc.experience ?? "",
      cabinNo: doc.cabinNo ?? "",
      opdDays: doc.opdDays ?? "Mon – Sat",
      availableSlots: doc.availableSlots ?? "09:00 AM,09:30 AM,10:00 AM,10:30 AM",
      active: doc.active !== false,
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDoctor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Doctor name is required.");
      return;
    }
    if (!formData.department.trim()) {
      setFormError("Department is required.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editingDoctor) {
        await api.updateDoctor(editingDoctor.id, formData);
        showNotification(`Successfully updated ${formData.name}`);
      } else {
        await api.addDoctor(formData);
        showNotification(`Successfully added ${formData.name}`);
      }
      closeModal();
      loadDoctors();
    } catch (err: any) {
      setFormError(err.message ?? "Failed to save doctor details.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (doc: DoctorApi) => {
    const currentActive = doc.active !== false;
    const newActive = !currentActive;
    try {
      await api.toggleDoctorStatus(doc.id, newActive);
      showNotification(
        `${doc.name} has been ${newActive ? "activated" : "deactivated"}.`
      );
      loadDoctors();
    } catch (err: any) {
      setError(err.message ?? "Failed to update status.");
    }
  };

  return (
    <div className="admin-doctors-page">
      {/* Top Header & Actions */}
      <div className="admin-doctors-header">
        <div>
          <h2 className="admin-section-title">Manage Hospital Doctors</h2>
          <p className="admin-section-subtitle">Add new doctors, modify schedules, cabin numbers, or toggle availability.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          ➕ Add New Doctor
        </button>
      </div>

      {successMsg && (
        <div className="admin-alert admin-alert-success">
          ✅ {successMsg}
        </div>
      )}

      {error && (
        <div className="admin-alert admin-alert-error">
          ⚠️ {error}
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by doctor name, dept, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="admin-select"
        >
          <option value="ALL">All Departments</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="admin-select"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ fontSize: "2.5rem" }}>⏳</div>
          <p style={{ color: "var(--text-muted)", marginTop: "0.75rem" }}>Loading doctor records…</p>
        </div>
      )}

      {/* Doctor Cards / Table */}
      {!loading && (
        <div className="admin-doctors-grid">
          {filteredDoctors.map((doc) => {
            const isActive = doc.active !== false;
            return (
              <div key={doc.id} className={`admin-doctor-card ${!isActive ? "inactive-card" : ""}`}>
                <div className="admin-doc-card-header">
                  <div className="admin-doc-avatar">
                    {doc.name.replace("Dr. ", "").charAt(0)}
                  </div>
                  <div className="admin-doc-head-info">
                    <h3 className="admin-doc-name">{doc.name}</h3>
                    <span className="admin-doc-dept">{doc.department}</span>
                  </div>
                  <span className={`status-badge ${isActive ? "status-active" : "status-inactive"}`}>
                    {isActive ? "● Active" : "○ Inactive"}
                  </span>
                </div>

                <div className="admin-doc-details">
                  <p><strong>Qualification:</strong> {doc.qualification || "N/A"}</p>
                  <p><strong>Specialization:</strong> {doc.specialization || "General"}</p>
                  <p><strong>Experience:</strong> {doc.experience || "N/A"}</p>
                  <p><strong>Cabin:</strong> {doc.cabinNo || "Not assigned"}</p>
                  <p><strong>OPD Days:</strong> {doc.opdDays || "Mon – Sat"}</p>
                </div>

                <div className="admin-doc-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(doc)}>
                    ✏️ Edit
                  </button>
                  <button
                    className={`btn btn-sm ${isActive ? "btn-danger-outline" : "btn-success-outline"}`}
                    onClick={() => handleToggleStatus(doc)}
                  >
                    {isActive ? "🚫 Deactivate" : "✅ Activate"}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredDoctors.length === 0 && (
            <div className="admin-empty-state">
              <p>No doctors match the selected search/filter criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingDoctor ? "✏️ Edit Doctor Details" : "➕ Add New Doctor"}</h3>
              <button className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>

            {formError && <div className="admin-alert admin-alert-error" style={{ margin: "1rem" }}>{formError}</div>}

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="form-group">
                <label>Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="admin-select"
                  style={{ width: "100%" }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. MBBS, MD (Medicine)"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="admin-input"
                  />
                </div>

                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Cardiologist"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 10+ Yrs Exp"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="admin-input"
                  />
                </div>

                <div className="form-group">
                  <label>Cabin Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Cabin 104, 1st Floor"
                    value={formData.cabinNo}
                    onChange={(e) => setFormData({ ...formData, cabinNo: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>OPD Days</label>
                <input
                  type="text"
                  placeholder="e.g. Mon – Sat"
                  value={formData.opdDays}
                  onChange={(e) => setFormData({ ...formData, opdDays: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>Available Slots (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 AM,10:00 AM,02:00 PM"
                  value={formData.availableSlots}
                  onChange={(e) => setFormData({ ...formData, availableSlots: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div className="form-group-checkbox">
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span>Active Doctor (Visible in Patient Search)</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editingDoctor ? "Save Changes" : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
