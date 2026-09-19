export type DeptKey =
  | "dept_general"
  | "dept_derma"
  | "dept_ortho"
  | "dept_gynec"
  | "dept_pedia"
  | "dept_ent"
  | "dept_ophthal"
  | "dept_dental"
  | "dept_emergency";

export interface Doctor {
  id: string;
  name: string;
  dept: DeptKey;
  slots: string[];
}

export interface Department {
  key: DeptKey;
  doctors: Doctor[];
}

export const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
];

export const DEPARTMENTS: Department[] = [
  {
    key: "dept_general",
    doctors: [
      { id: "d1", name: "Dr. Anil Sharma", dept: "dept_general", slots: TIME_SLOTS },
      { id: "d2", name: "Dr. Priya Mehta", dept: "dept_general", slots: TIME_SLOTS },
    ],
  },
  {
    key: "dept_derma",
    doctors: [
      { id: "d3", name: "Dr. Sunita Patel", dept: "dept_derma", slots: TIME_SLOTS },
    ],
  },
  {
    key: "dept_ortho",
    doctors: [
      { id: "d4", name: "Dr. Rajesh Verma", dept: "dept_ortho", slots: TIME_SLOTS },
      { id: "d5", name: "Dr. Kavita Singh", dept: "dept_ortho", slots: TIME_SLOTS },
    ],
  },
  {
    key: "dept_gynec",
    doctors: [
      { id: "d6", name: "Dr. Meena Joshi", dept: "dept_gynec", slots: TIME_SLOTS },
    ],
  },
  {
    key: "dept_pedia",
    doctors: [
      { id: "d7", name: "Dr. Suresh Nair", dept: "dept_pedia", slots: TIME_SLOTS },
      { id: "d8", name: "Dr. Anita Rao", dept: "dept_pedia", slots: TIME_SLOTS },
    ],
  },
  {
    key: "dept_ent",
    doctors: [
      { id: "d9", name: "Dr. Farhan Qureshi", dept: "dept_ent", slots: TIME_SLOTS },
    ],
  },
  {
    key: "dept_ophthal",
    doctors: [
      { id: "d10", name: "Dr. Leela Iyer", dept: "dept_ophthal", slots: TIME_SLOTS },
    ],
  },
  {
    key: "dept_dental",
    doctors: [
      { id: "d11", name: "Dr. Nikhil Shah", dept: "dept_dental", slots: TIME_SLOTS },
    ],
  },
  {
    key: "dept_emergency",
    doctors: [
      { id: "d12", name: "Dr. On-Duty Staff", dept: "dept_emergency", slots: TIME_SLOTS },
    ],
  },
];
