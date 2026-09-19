import type { DeptKey } from "./doctors";

export interface Appointment {
  id: string;
  patientName: string;
  mobile: string;
  age: number;
  gender: string;
  language: string;
  dept: DeptKey;
  doctor: string;
  date: string;
  slot: string;
}

export interface FollowUp {
  appointmentId: string;
  mobile: string;
  doctor: string;
  dept: DeptKey;
  followUpDate: string;
  reminderSent: boolean;
}

export const SAMPLE_APPOINTMENTS: Appointment[] = [
  { id: "OPD-1001", patientName: "Ramesh Patel", mobile: "9876543210", age: 45, gender: "Male", language: "Gujarati", dept: "dept_general", doctor: "Dr. Anil Sharma", date: "2025-07-20", slot: "10:00 AM" },
  { id: "OPD-1002", patientName: "Sunita Verma", mobile: "9123456780", age: 32, gender: "Female", language: "Hindi", dept: "dept_gynec", doctor: "Dr. Meena Joshi", date: "2025-07-21", slot: "11:00 AM" },
  { id: "OPD-1003", patientName: "Arjun Singh", mobile: "9988776655", age: 28, gender: "Male", language: "English", dept: "dept_ortho", doctor: "Dr. Rajesh Verma", date: "2025-07-22", slot: "09:30 AM" },
  { id: "OPD-1004", patientName: "Kavya Nair", mobile: "9871234560", age: 7, gender: "Female", language: "English", dept: "dept_pedia", doctor: "Dr. Suresh Nair", date: "2025-07-22", slot: "02:00 PM" },
  { id: "OPD-1005", patientName: "Mohan Das", mobile: "9765432100", age: 60, gender: "Male", language: "Hindi", dept: "dept_derma", doctor: "Dr. Sunita Patel", date: "2025-07-23", slot: "03:00 PM" },
];

export const SAMPLE_FOLLOWUPS: FollowUp[] = [
  { appointmentId: "OPD-1001", mobile: "9876543210", doctor: "Dr. Anil Sharma", dept: "dept_general", followUpDate: "2025-08-03", reminderSent: false },
  { appointmentId: "OPD-1002", mobile: "9123456780", doctor: "Dr. Meena Joshi", dept: "dept_gynec", followUpDate: "2025-08-05", reminderSent: true },
  { appointmentId: "OPD-1003", mobile: "9988776655", doctor: "Dr. Rajesh Verma", dept: "dept_ortho", followUpDate: "2025-08-06", reminderSent: false },
];

export const DASHBOARD_STATS = {
  totalAppointments: 128,
  chatbotRequests: 74,
  followUpsDue: 19,
  deptWise: [
    { dept: "dept_general" as DeptKey, count: 42 },
    { dept: "dept_ortho" as DeptKey, count: 21 },
    { dept: "dept_gynec" as DeptKey, count: 18 },
    { dept: "dept_pedia" as DeptKey, count: 15 },
    { dept: "dept_derma" as DeptKey, count: 12 },
    { dept: "dept_ent" as DeptKey, count: 8 },
    { dept: "dept_ophthal" as DeptKey, count: 6 },
    { dept: "dept_dental" as DeptKey, count: 4 },
    { dept: "dept_emergency" as DeptKey, count: 2 },
  ],
  languageUsage: [
    { lang: "English", count: 55 },
    { lang: "Hindi", count: 43 },
    { lang: "Gujarati", count: 30 },
  ],
};
