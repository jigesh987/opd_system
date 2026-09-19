import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api, type ProfileResponse } from "../data/api";

const STATE_DISTRICTS: Record<string, string[]> = {
  "Andhra Pradesh": ["Anantapur","Chittoor","East Godavari","Guntur","Krishna","Kurnool","Nellore","Prakasam","Srikakulam","Visakhapatnam","Vizianagaram","West Godavari","YSR Kadapa"],
  "Arunachal Pradesh": ["Anjaw","Changlang","Dibang Valley","East Kameng","East Siang","Kamle","Kra Daadi","Kurung Kumey","Lepa Rada","Lohit","Longding","Lower Dibang Valley","Lower Siang","Lower Subansiri","Namsai","Pakke Kessang","Papum Pare","Shi Yomi","Siang","Tawang","Tirap","Upper Siang","Upper Subansiri","West Kameng","West Siang"],
  "Assam": ["Baksa","Barpeta","Biswanath","Bongaigaon","Cachar","Charaideo","Chirang","Darrang","Dhemaji","Dhubri","Dibrugarh","Dima Hasao","Goalpara","Golaghat","Hailakandi","Hojai","Jorhat","Kamrup","Kamrup Metropolitan","Karbi Anglong","Karimganj","Kokrajhar","Lakhimpur","Majuli","Morigaon","Nagaon","Nalbari","Sivasagar","Sonitpur","South Salmara-Mankachar","Tinsukia","Udalguri","West Karbi Anglong"],
  "Bihar": ["Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar","Darbhanga","East Champaran","Gaya","Gopalganj","Jamui","Jehanabad","Kaimur","Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura","Madhubani","Munger","Muzaffarpur","Nalanda","Nawada","Patna","Purnia","Rohtas","Saharsa","Samastipur","Saran","Sheikhpura","Sheohar","Sitamarhi","Siwan","Supaul","Vaishali","West Champaran"],
  "Chhattisgarh": ["Balod","Baloda Bazar","Balrampur","Bastar","Bemetara","Bijapur","Bilaspur","Dantewada","Dhamtari","Durg","Gariaband","Gaurela-Pendra-Marwahi","Janjgir-Champa","Jashpur","Kabirdham","Kanker","Kondagaon","Korba","Koriya","Mahasamund","Mungeli","Narayanpur","Raigarh","Raipur","Rajnandgaon","Sukma","Surajpur","Surguja"],
  "Goa": ["North Goa","South Goa"],
  "Gujarat": ["Ahmedabad","Amreli","Anand","Aravalli","Banaskantha","Bharuch","Bhavnagar","Botad","Chhota Udaipur","Dahod","Dang","Devbhoomi Dwarka","Gandhinagar","Gir Somnath","Jamnagar","Junagadh","Kheda","Kutch","Mahisagar","Mehsana","Morbi","Narmada","Navsari","Panchmahal","Patan","Porbandar","Rajkot","Sabarkantha","Surat","Surendranagar","Tapi","Vadodara","Valsad"],
  "Haryana": ["Ambala","Bhiwani","Charkhi Dadri","Faridabad","Fatehabad","Gurugram","Hisar","Jhajjar","Jind","Kaithal","Karnal","Kurukshetra","Mahendragarh","Nuh","Palwal","Panchkula","Panipat","Rewari","Rohtak","Sirsa","Sonipat","Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur","Chamba","Hamirpur","Kangra","Kinnaur","Kullu","Lahaul and Spiti","Mandi","Shimla","Sirmaur","Solan","Una"],
  "Jharkhand": ["Bokaro","Chatra","Deoghar","Dhanbad","Dumka","East Singhbhum","Garhwa","Giridih","Godda","Gumla","Hazaribagh","Jamtara","Khunti","Koderma","Latehar","Lohardaga","Pakur","Palamu","Ramgarh","Ranchi","Sahebganj","Seraikela Kharsawan","Simdega","West Singhbhum"],
  "Karnataka": ["Bagalkot","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban","Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga","Dakshina Kannada","Davanagere","Dharwad","Gadag","Hassan","Haveri","Kalaburagi","Kodagu","Kolar","Koppal","Mandya","Mysuru","Raichur","Ramanagara","Shivamogga","Tumakuru","Udupi","Uttara Kannada","Vijayapura","Yadgir"],
  "Kerala": ["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"],
  "Madhya Pradesh": ["Agar Malwa","Alirajpur","Anuppur","Ashoknagar","Balaghat","Barwani","Betul","Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh","Datia","Dewas","Dhar","Dindori","Guna","Gwalior","Harda","Hoshangabad","Indore","Jabalpur","Jhabua","Katni","Khandwa","Khargone","Mandla","Mandsaur","Morena","Narsinghpur","Neemuch","Niwari","Panna","Raisen","Rajgarh","Ratlam","Rewa","Sagar","Satna","Sehore","Seoni","Shahdol","Shajapur","Sheopur","Shivpuri","Sidhi","Singrauli","Tikamgarh","Ujjain","Umaria","Vidisha"],
  "Maharashtra": ["Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara","Buldhana","Chandrapur","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Osmanabad","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"],
  "Manipur": ["Bishnupur","Chandel","Churachandpur","Imphal East","Imphal West","Jiribam","Kakching","Kamjong","Kangpokpi","Noney","Pherzawl","Senapati","Tamenglong","Tengnoupal","Thoubal","Ukhrul"],
  "Meghalaya": ["East Garo Hills","East Jaintia Hills","East Khasi Hills","Eastern West Khasi Hills","North Garo Hills","Ri Bhoi","South Garo Hills","South West Garo Hills","South West Khasi Hills","West Garo Hills","West Jaintia Hills","West Khasi Hills"],
  "Mizoram": ["Aizawl","Champhai","Hnahthial","Khawzawl","Kolasib","Lawngtlai","Lunglei","Mamit","Saiha","Saitual","Serchhip"],
  "Nagaland": ["Chumoukedima","Dimapur","Kiphire","Kohima","Longleng","Mokokchung","Mon","Niuland","Noklak","Peren","Phek","Shamator","Tseminyu","Tuensang","Wokha","Zunheboto"],
  "Odisha": ["Angul","Balangir","Balasore","Bargarh","Bhadrak","Boudh","Cuttack","Deogarh","Dhenkanal","Gajapati","Ganjam","Jagatsinghpur","Jajpur","Jharsuguda","Kalahandi","Kandhamal","Kendrapara","Kendujhar","Khordha","Koraput","Malkangiri","Mayurbhanj","Nabarangpur","Nayagarh","Nuapada","Puri","Rayagada","Sambalpur","Subarnapur","Sundargarh"],
  "Punjab": ["Amritsar","Barnala","Bathinda","Faridkot","Fatehgarh Sahib","Fazilka","Ferozepur","Gurdaspur","Hoshiarpur","Jalandhar","Kapurthala","Ludhiana","Malerkotla","Mansa","Moga","Mohali","Muktsar","Pathankot","Patiala","Rupnagar","Sangrur","Shaheed Bhagat Singh Nagar","Tarn Taran"],
  "Rajasthan": ["Ajmer","Alwar","Banswara","Baran","Barmer","Bharatpur","Bhilwara","Bikaner","Bundi","Chittorgarh","Churu","Dausa","Dholpur","Dungarpur","Hanumangarh","Jaipur","Jaisalmer","Jalore","Jhalawar","Jhunjhunu","Jodhpur","Karauli","Kota","Nagaur","Pali","Pratapgarh","Rajsamand","Sawai Madhopur","Sikar","Sirohi","Sri Ganganagar","Tonk","Udaipur"],
  "Sikkim": ["East Sikkim","North Sikkim","Pakyong","Soreng","South Sikkim","West Sikkim"],
  "Tamil Nadu": ["Ariyalur","Chengalpattu","Chennai","Coimbatore","Cuddalore","Dharmapuri","Dindigul","Erode","Kallakurichi","Kancheepuram","Kanyakumari","Karur","Krishnagiri","Madurai","Mayiladuthurai","Nagapattinam","Namakkal","Nilgiris","Perambalur","Pudukkottai","Ramanathapuram","Ranipet","Salem","Sivaganga","Tenkasi","Thanjavur","Theni","Thoothukudi","Tiruchirappalli","Tirunelveli","Tirupathur","Tiruppur","Tiruvallur","Tiruvannamalai","Tiruvarur","Vellore","Viluppuram","Virudhunagar"],
  "Telangana": ["Adilabad","Bhadradri Kothagudem","Hyderabad","Jagtial","Jangaon","Jayashankar Bhupalpally","Jogulamba Gadwal","Kamareddy","Karimnagar","Khammam","Kumuram Bheem","Mahabubabad","Mahabubnagar","Mancherial","Medak","Medchal-Malkajgiri","Mulugu","Nagarkurnool","Nalgonda","Narayanpet","Nirmal","Nizamabad","Peddapalli","Rajanna Sircilla","Rangareddy","Sangareddy","Siddipet","Suryapet","Vikarabad","Wanaparthy","Warangal Rural","Warangal Urban","Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai","Gomati","Khowai","North Tripura","Sepahijala","South Tripura","Unakoti","West Tripura"],
  "Uttar Pradesh": ["Agra","Aligarh","Ambedkar Nagar","Amethi","Amroha","Auraiya","Ayodhya","Azamgarh","Baghpat","Bahraich","Ballia","Balrampur","Banda","Barabanki","Bareilly","Basti","Bhadohi","Bijnor","Budaun","Bulandshahr","Chandauli","Chitrakoot","Deoria","Etah","Etawah","Farrukhabad","Fatehpur","Firozabad","Gautam Buddha Nagar","Ghaziabad","Ghazipur","Gonda","Gorakhpur","Hamirpur","Hapur","Hardoi","Hathras","Jalaun","Jaunpur","Jhansi","Kannauj","Kanpur Dehat","Kanpur Nagar","Kasganj","Kaushambi","Kushinagar","Lakhimpur Kheri","Lalitpur","Lucknow","Maharajganj","Mahoba","Mainpuri","Mathura","Mau","Meerut","Mirzapur","Moradabad","Muzaffarnagar","Pilibhit","Pratapgarh","Prayagraj","Rae Bareli","Rampur","Saharanpur","Sambhal","Sant Kabir Nagar","Shahjahanpur","Shamli","Shravasti","Siddharthnagar","Sitapur","Sonbhadra","Sultanpur","Unnao","Varanasi"],
  "Uttarakhand": ["Almora","Bageshwar","Chamoli","Champawat","Dehradun","Haridwar","Nainital","Pauri Garhwal","Pithoragarh","Rudraprayag","Tehri Garhwal","Udham Singh Nagar","Uttarkashi"],
  "West Bengal": ["Alipurduar","Bankura","Birbhum","Cooch Behar","Dakshin Dinajpur","Darjeeling","Hooghly","Howrah","Jalpaiguri","Jhargram","Kalimpong","Kolkata","Malda","Murshidabad","Nadia","North 24 Parganas","Paschim Bardhaman","Paschim Medinipur","Purba Bardhaman","Purba Medinipur","Purulia","South 24 Parganas","Uttar Dinajpur"],
  "Andaman and Nicobar Islands": ["Nicobar","North and Middle Andaman","South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli","Daman","Diu"],
  "Delhi": ["Central Delhi","East Delhi","New Delhi","North Delhi","North East Delhi","North West Delhi","Shahdara","South Delhi","South East Delhi","South West Delhi","West Delhi"],
  "Jammu and Kashmir": ["Anantnag","Bandipora","Baramulla","Budgam","Doda","Ganderbal","Jammu","Kathua","Kishtwar","Kulgam","Kupwara","Poonch","Pulwama","Rajouri","Ramban","Reasi","Samba","Shopian","Srinagar","Udhampur"],
  "Ladakh": ["Kargil","Leh"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Karaikal","Mahe","Puducherry","Yanam"],
};

const INDIAN_STATES = Object.keys(STATE_DISTRICTS).sort();

interface FormState {
  firstName: string; middleName: string; lastName: string;
  age: string; dateOfBirth: string;
  gender: string; maritalStatus: string;
  email: string; address: string; district: string; state: string;
}

function capitalize(val: string) {
  return val.length === 0 ? val : val.charAt(0).toUpperCase() + val.slice(1);
}

function progressColor(pct: number) {
  if (pct < 40) return "#ef4444";
  if (pct < 70) return "#f59e0b";
  return "#22c55e";
}

export default function Profile() {
  const { authUser, setAuthUser } = useApp();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<'loading' | 'success' | 'unauthorized' | 'network_error' | 'server_error'>('loading');
  const [fetchErrorMsg, setFetchErrorMsg] = useState("");
  const [apiError, setApiError] = useState("");
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("redirect");
    if (r) setRedirectTo(r);
    // Auto open edit mode if profile incomplete
    if (authUser && !authUser.profileComplete) setEditMode(true);
  }, []);

  const loadProfile = async () => {
    if (!authUser) { navigate("/login", { replace: true }); return; }
    setFetchStatus('loading');
    setFetchErrorMsg("");
    try {
      const data = await api.getProfile();
      setProfile(data);
      setForm({
        firstName: data.firstName, middleName: data.middleName, lastName: data.lastName,
        age: data.age ? String(data.age) : "", dateOfBirth: data.dateOfBirth,
        gender: data.gender, maritalStatus: data.maritalStatus,
        email: data.email, address: data.address,
        district: data.district, state: data.state,
      });
      setFetchStatus('success');
    } catch (err: any) {
      if (err.status === 401) {
        setFetchStatus('unauthorized');
        setFetchErrorMsg("Your session has expired. Please log in again.");
      } else if (err.isNetworkError || err.message?.includes("Unable to connect")) {
        setFetchStatus('network_error');
        setFetchErrorMsg("Unable to connect to OPD server. Please make sure the backend server is running and try again.");
      } else {
        setFetchStatus('server_error');
        setFetchErrorMsg(err.message || "An error occurred while loading your profile.");
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, [authUser]);

  function handleAgeChange(val: string) {
    const age = parseInt(val);
    const updates: Partial<FormState> = { age: val };
    if (!isNaN(age) && age > 0 && age <= 120)
      updates.dateOfBirth = `${new Date().getFullYear() - age}-01-01`;
    setForm((f) => f ? { ...f, ...updates } : f);
  }

  function handleDobChange(val: string) {
    const updates: Partial<FormState> = { dateOfBirth: val };
    if (val) {
      const age = new Date().getFullYear() - new Date(val).getFullYear();
      if (age > 0 && age <= 120) updates.age = String(age);
    }
    setForm((f) => f ? { ...f, ...updates } : f);
  }

  function validate(): boolean {
    if (!form) return false;
    const e: Partial<FormState> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    const age = Number(form.age);
    if (!form.age || isNaN(age) || age < 1 || age > 120) e.age = "Enter valid age (1–120)";
    if (!form.gender) e.gender = "Required";
    if (!form.maritalStatus) e.maritalStatus = "Required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter valid email";
    if (!form.state) e.state = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !form) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await api.saveProfile({
        firstName: form.firstName, middleName: form.middleName, lastName: form.lastName,
        age: Number(form.age), dateOfBirth: form.dateOfBirth || undefined as any,
        gender: form.gender, maritalStatus: form.maritalStatus,
        email: form.email, address: form.address,
        district: form.district, state: form.state,
      });
      setProfile(res);
      if (authUser) setAuthUser({ ...authUser, profileComplete: res.profileComplete });
      setEditMode(false);
      if (redirectTo) navigate(redirectTo);
    } catch (err: any) {
      setApiError(err.message ?? "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  }

  function f(id: keyof FormState, label: string, input: React.ReactNode) {
    return (
      <div className="form-group">
        <label htmlFor={id} className="form-label">{label}</label>
        {input}
        {errors[id] && <span className="form-error">{errors[id]}</span>}
      </div>
    );
  }

  if (fetchStatus === 'loading') {
    return (
      <div className="page" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <div className="spinner" style={{ fontSize: "2rem" }}>⏳</div>
        <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>Loading profile details...</p>
      </div>
    );
  }

  if (fetchStatus === 'unauthorized') {
    return (
      <div className="page">
        <div className="confirmation-card" style={{ borderColor: "var(--danger, #ef4444)" }}>
          <div style={{ fontSize: "2.5rem" }}>🔐</div>
          <h2 style={{ color: "var(--danger, #ef4444)" }}>Session Expired</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem" }}>{fetchErrorMsg}</p>
          <button className="btn btn-primary" onClick={() => navigate("/login", { replace: true })}>
            Log In Again →
          </button>
        </div>
      </div>
    );
  }

  if (fetchStatus === 'network_error' || fetchStatus === 'server_error') {
    return (
      <div className="page">
        <div className="confirmation-card" style={{ borderColor: "var(--warning, #d97706)" }}>
          <div style={{ fontSize: "2.5rem" }}>📡</div>
          <h2 style={{ color: "var(--warning, #d97706)" }}>
            {fetchStatus === 'network_error' ? "Server Unavailable" : "Failed to Load Profile"}
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem" }}>{fetchErrorMsg}</p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={loadProfile}>
              🔄 Try Again
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !form) return null;

  const pct = profile.completionPercent;
  const fullName = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ") || profile.displayUsername;

  return (
    <div className="page">
      {/* Profile header card */}
      <div className="profile-header-card">
        <div className="profile-avatar">{(profile.firstName || profile.displayUsername).charAt(0).toUpperCase()}</div>
        <div className="profile-header-info">
          <h2 className="profile-fullname">{fullName}</h2>
          <span className="profile-username">@{profile.displayUsername}</span>
          <span className="profile-mobile">📱 {profile.mobile}</span>
        </div>
        {!editMode && (
          <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => setEditMode(true)}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Completion progress bar */}
      <div className="profile-progress-wrap">
        <div className="profile-progress-label">
          <span>Profile Completion</span>
          <strong style={{ color: progressColor(pct) }}>{pct}%</strong>
        </div>
        <div className="profile-progress-bar">
          <div className="profile-progress-fill" style={{ width: `${pct}%`, background: progressColor(pct) }} />
        </div>
        {!profile.profileComplete && (
          <p className="profile-progress-hint">Complete your profile to unlock all features.</p>
        )}
      </div>

      {/* View mode */}
      {!editMode && (
        <div className="profile-view">
          <div className="profile-section-title">Personal Information</div>
          <div className="profile-grid">
            <div className="profile-field"><span className="pf-label">First Name</span><span className="pf-value">{profile.firstName || "—"}</span></div>
            <div className="profile-field"><span className="pf-label">Middle Name</span><span className="pf-value">{profile.middleName || "—"}</span></div>
            <div className="profile-field"><span className="pf-label">Last Name</span><span className="pf-value">{profile.lastName || "—"}</span></div>
            <div className="profile-field"><span className="pf-label">Age</span><span className="pf-value">{profile.age || "—"}</span></div>
            <div className="profile-field"><span className="pf-label">Date of Birth</span><span className="pf-value">{profile.dateOfBirth || "—"}</span></div>
            <div className="profile-field"><span className="pf-label">Gender</span><span className="pf-value">{profile.gender || "—"}</span></div>
            <div className="profile-field"><span className="pf-label">Marital Status</span><span className="pf-value">{profile.maritalStatus || "—"}</span></div>
            <div className="profile-field"><span className="pf-label">Email</span><span className="pf-value">{profile.email || "—"}</span></div>
          </div>
          <div className="profile-section-title" style={{ marginTop: "1.5rem" }}>Address</div>
          <div className="profile-grid">
            <div className="profile-field" style={{ gridColumn: "1 / -1" }}><span className="pf-label">Address</span><span className="pf-value">{profile.address || "—"}</span></div>
            <div className="profile-field"><span className="pf-label">District</span><span className="pf-value">{profile.district || "—"}</span></div>
            <div className="profile-field"><span className="pf-label">State</span><span className="pf-value">{profile.state || "—"}</span></div>
          </div>
        </div>
      )}

      {/* Edit mode */}
      {editMode && (
        <form className="appt-form" onSubmit={handleSubmit} noValidate style={{ marginTop: "1.5rem" }}>
          {apiError && <div className="form-error mb-1">{apiError}</div>}
          <div className="form-row">
            {f("firstName", "First Name", <input id="firstName" className={`form-input ${errors.firstName ? "input-error" : ""}`} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: capitalize(e.target.value) })} />)}
            {f("middleName", "Middle Name", <input id="middleName" className="form-input" value={form.middleName} onChange={(e) => setForm({ ...form, middleName: capitalize(e.target.value) })} />)}
            {f("lastName", "Last Name", <input id="lastName" className={`form-input ${errors.lastName ? "input-error" : ""}`} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: capitalize(e.target.value) })} />)}
          </div>
          <div className="form-row">
            {f("age", "Age", <input id="age" type="number" min={1} max={120} className={`form-input ${errors.age ? "input-error" : ""}`} value={form.age} onChange={(e) => handleAgeChange(e.target.value)} />)}
            {f("dateOfBirth", "Date of Birth", <input id="dateOfBirth" type="date" max={new Date().toISOString().split("T")[0]} className="form-input" value={form.dateOfBirth} onChange={(e) => handleDobChange(e.target.value)} />)}
          </div>
          <div className="form-row">
            {f("gender", "Gender",
              <select id="gender" className={`form-input ${errors.gender ? "input-error" : ""}`} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            )}
            {f("maritalStatus", "Marital Status",
              <select id="maritalStatus" className={`form-input ${errors.maritalStatus ? "input-error" : ""}`} value={form.maritalStatus} onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}>
                <option value="">Select Status</option>
                <option value="Unmarried">Unmarried</option>
                <option value="Married">Married</option>
              </select>
            )}
          </div>
          {f("email", "Email Address (optional)", <input id="email" type="email" className={`form-input ${errors.email ? "input-error" : ""}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />)}
          {f("address", "Address", <textarea id="address" className="form-input" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />)}
          <div className="form-row">
            {f("state", "State",
              <select id="state" className={`form-input ${errors.state ? "input-error" : ""}`} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value, district: "" })}>
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            {f("district", "District",
              <select id="district" className="form-input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} disabled={!form.state}>
                <option value="">{form.state ? "Select District" : "Select State first"}</option>
                {(STATE_DISTRICTS[form.state] ?? []).map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Saving…" : "Save Profile"}
            </button>
            {profile.profileComplete && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditMode(false); setErrors({}); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
