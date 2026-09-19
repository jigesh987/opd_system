const en = {
  // Nav
  appName: "Smart OPD Connect",
  home: "Home",
  bookAppointment: "Book Appointment",
  findDoctor: "Find the Right Doctor",
  myFollowUps: "My Follow-ups",
  dashboard: "Admin Dashboard",

  // Emergency
  emergencyNotice:
    "⚠️ For chest pain, difficulty breathing, heavy bleeding, unconsciousness, or other emergencies — go to the Emergency Department immediately.",

  // Home
  heroTitle: "Your Health, Our Priority",
  heroSubtitle:
    "Book appointments, find the right specialist, and manage your follow-ups — all in one place.",
  getStarted: "Get Started",
  featureBooking: "Quick and easy appointment booking with your preferred doctor.",
  featureFinder: "Answer a few questions and get guided to the right department.",
  featureFollowUp: "Track your follow-up appointments and get reminders.",
  demoOnly: "Demo only — do not enter real patient information.",

  // Booking form
  patientName: "Patient Name",
  mobileNumber: "Mobile Number",
  age: "Age",
  gender: "Gender",
  male: "Male",
  female: "Female",
  other: "Other",
  preferredLanguage: "Preferred Language",
  department: "Department",
  doctor: "Doctor",
  preferredDate: "Preferred Date",
  timeSlot: "Time Slot",
  submit: "Submit",
  selectDepartment: "Select Department",
  selectDoctor: "Select Doctor",
  selectSlot: "Select Time Slot",
  selectGender: "Select Gender",
  selectLanguage: "Select Language",

  // Confirmation
  appointmentConfirmed: "Appointment Confirmed!",
  appointmentId: "Appointment ID",
  bookAnother: "Book Another Appointment",
  confirmationMsg:
    "Your appointment has been registered. Please arrive 15 minutes early.",

  // Chatbot
  chatbotTitle: "Doctor / Department Finder",
  chatbotDisclaimer:
    "⚕️ This tool only provides general guidance and is not a medical diagnosis. Please consult a qualified doctor.",
  chatbotStart: "Start",
  chatbotIntro: "Answer a few simple questions to find the right department for your health concern.",
  chatbotRestart: "Start Over",
  bookWithDept: "Book Appointment in this Department",
  q_symptoms: "What symptoms or health concern do you have?",
  q_duration: "Since when are you experiencing this?",
  q_age: "What is the patient's age?",
  q_emergency: "Are you experiencing any of these? Chest pain, difficulty breathing, heavy bleeding, loss of consciousness, sudden severe headache.",
  yes: "Yes",
  no: "No",
  emergencyAlert:
    "🚨 EMERGENCY: Please go to the Emergency Department immediately or call 108.",
  suggestedDept: "Suggested Department",
  deptReason: "Based on your symptoms, we suggest:",
  chatWithUs: "Chat with us",
  liveChatWelcome: "Hello! Tell me your health concern and I will help you find the right department.",
  liveChatPlaceholder: "Type your health concern…",
  liveChatSend: "Send",
  liveChatThinking: "Thinking…",
  liveChatUnavailable: "The live assistant is unavailable. Please try again or call the hospital.",
  liveChatClose: "Close chat",

  // Follow-up
  followUpTitle: "My Follow-ups",
  enterMobileOrId: "Enter Mobile Number or Appointment ID",
  search: "Search",
  followUpDoctor: "Doctor",
  followUpDept: "Department",
  followUpDate: "Follow-up Date",
  reminderStatus: "Reminder Status",
  sendReminder: "Send Reminder",
  reminderSent: "Reminder Sent (Demo)",
  reminderPending: "Pending",
  noFollowUp: "No follow-up records found.",
  followUpHint: "Try a demo mobile number or appointment ID:",

  // Dashboard
  dashboardTitle: "Admin Dashboard",
  totalAppointments: "Total Appointments",
  chatbotRequests: "Chatbot Requests",
  followUpsDue: "Follow-ups Due",
  deptWise: "Department-wise Appointments",
  languageUsage: "Language Usage",

  // Validation
  required: "This field is required.",
  invalidMobile: "Enter a valid 10-digit mobile number.",
  invalidAge: "Enter a valid age (1–120).",
  invalidDate: "Please select a future date.",

  // Auth
  login: "Login",
  register: "Register",
  logout: "Logout",
  username: "Username",
  password: "Password",
  loginTitle: "Patient / Admin Login",
  registerTitle: "Create Account",
  alreadyHaveAccount: "Already have an account? Login",
  noAccount: "No account? Register",
  loggedInAs: "Logged in as",
  myAppointments: "My Appointments",
  completeProfile: "Complete Profile",

  // Departments
  dept_general: "General Medicine",
  dept_derma: "Dermatology",
  dept_ortho: "Orthopedics",
  dept_gynec: "Gynecology",
  dept_pedia: "Pediatrics",
  dept_ent: "ENT",
  dept_ophthal: "Ophthalmology",
  dept_dental: "Dentistry",
  dept_emergency: "Emergency",
};

export default en;
export type TranslationKeys = keyof typeof en;
