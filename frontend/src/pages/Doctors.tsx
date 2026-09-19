import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api, type DoctorApi } from "../data/api";
import type { DeptKey } from "../data/doctors";

const DEPARTMENTS_LIST = [
  { key: "ALL", label: "All Doctors" },
  { key: "General Medicine", label: "General Medicine" },
  { key: "Dermatology", label: "Dermatology" },
  { key: "Orthopedics", label: "Orthopedics" },
  { key: "Gynecology", label: "Gynecology" },
  { key: "Pediatrics", label: "Pediatrics" },
  { key: "ENT", label: "ENT" },
  { key: "Ophthalmology", label: "Ophthalmology" },
  { key: "Dentistry", label: "Dentistry" },
  { key: "Emergency", label: "Emergency" },
];

const NAME_TO_DEPT_KEY: Record<string, DeptKey> = {
  "General Medicine": "dept_general",
  "Dermatology": "dept_derma",
  "Orthopedics": "dept_ortho",
  "Gynecology": "dept_gynec",
  "Pediatrics": "dept_pedia",
  "ENT": "dept_ent",
  "Ophthalmology": "dept_ophthal",
  "Dentistry": "dept_dental",
  "Emergency": "dept_emergency",
};

export default function Doctors() {
  const { setPreselectedDept, setPreselectedDoctor } = useApp();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<DoctorApi[]>([]);
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getDoctors();
      setDoctors(res);
    } catch (err: any) {
      setError(err.message ?? "Failed to load doctor profiles from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((d) => {
    const matchesDept = selectedDept === "ALL" || d.department === selectedDept;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      (d.specialization && d.specialization.toLowerCase().includes(q)) ||
      (d.qualification && d.qualification.toLowerCase().includes(q)) ||
      d.department.toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });

  const handleBookDoctor = (doc: DoctorApi) => {
    const deptKey = NAME_TO_DEPT_KEY[doc.department] ?? "dept_general";
    setPreselectedDept(deptKey);
    setPreselectedDoctor(doc.name);
    navigate("/book");
  };

  return (
    <div className="page">
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 className="page-title" style={{ marginBottom: "0.5rem" }}>🧑‍⚕️ OPD Medical Specialists</h2>
        <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto" }}>
          Browse our hospital's certified doctors, inspect OPD room locations & schedules, and book appointments directly.
        </p>
      </div>

      {/* Search & Department Filter Bar */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search doctor by name, specialization, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ fontSize: "1rem", padding: "0.75rem 1rem" }}
          />
        </div>

        {/* Filter Pills */}
        <div className="dept-pills-wrap">
          {DEPARTMENTS_LIST.map((dept) => (
            <button
              key={dept.key}
              className={`dept-pill ${selectedDept === dept.key ? "active" : ""}`}
              onClick={() => setSelectedDept(dept.key)}
            >
              {dept.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <div style={{ fontSize: "2rem" }}>⏳</div>
          <p style={{ color: "var(--text-muted)", marginTop: "0.75rem" }}>Loading doctor directory from server...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="confirmation-card" style={{ borderColor: "var(--warning, #d97706)" }}>
          <div style={{ fontSize: "2.5rem" }}>📡</div>
          <h2 style={{ color: "var(--warning, #d97706)" }}>Failed to Load Doctors</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem" }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchDoctors}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredDoctors.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>👨‍⚕️</div>
          <p style={{ color: "var(--text-muted)" }}>No doctors match your search criteria.</p>
        </div>
      )}

      {/* Doctor Profile Cards Grid */}
      {!loading && !error && filteredDoctors.length > 0 && (
        <div className="doctor-grid">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="doc-card">
              <div className="doc-card-header">
                <div className="doc-avatar">{doc.name.charAt(4) || "D"}</div>
                <div>
                  <h3 className="doc-name">{doc.name}</h3>
                  <div className="doc-spec">{doc.specialization || doc.qualification}</div>
                  <span className="doc-dept-badge">{doc.department}</span>
                </div>
              </div>

              <div className="doc-card-body">
                <div className="doc-info-row">
                  <span>🎓 Qualification</span>
                  <strong>{doc.qualification || "MBBS"}</strong>
                </div>
                <div className="doc-info-row">
                  <span>💼 Experience</span>
                  <strong style={{ color: "var(--primary-color, #2563eb)" }}>{doc.experience || "10+ Yrs"}</strong>
                </div>
                <div className="doc-info-row">
                  <span>📍 Cabin Location</span>
                  <strong>{doc.cabinNo || "OPD Block"}</strong>
                </div>
                <div className="doc-info-row">
                  <span>📅 OPD Days</span>
                  <strong>{doc.opdDays || "Mon – Sat"}</strong>
                </div>
              </div>

              <button className="btn btn-primary btn-full mt-1" onClick={() => handleBookDoctor(doc)}>
                📅 Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
