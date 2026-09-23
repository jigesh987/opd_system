package com.opd_system.config;

import com.opd_system.entity.Doctor;
import com.opd_system.entity.FollowUp;
import com.opd_system.entity.User;
import com.opd_system.entity.Appointment;
import com.opd_system.repository.AppointmentRepository;
import com.opd_system.repository.DoctorRepository;
import com.opd_system.repository.FollowUpRepository;
import com.opd_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepo;
    private final DoctorRepository doctorRepo;
    private final AppointmentRepository appointmentRepo;
    private final FollowUpRepository followUpRepo;
    private final PasswordEncoder encoder;

    @Bean
    CommandLineRunner seed() {
        return args -> {
            seedUsers();
            seedDoctors();
            seedAppointments();
            seedFollowUps();
            log.info("✅ Smart OPD Connect — seed data loaded.");
        };
    }

    private void seedUsers() {
        if (userRepo.count() > 0) return;
        User admin = new User("0000000000", encoder.encode("admin123"), "Admin", User.Role.ADMIN);
        admin.setProfileComplete(true);
        User patient = new User("9876543210", encoder.encode("patient123"), "patient1", User.Role.PATIENT);
        userRepo.saveAll(List.of(admin, patient));
    }

    private void seedDoctors() {
        if (doctorRepo.count() > 0) return;
        String slots = "09:00 AM,09:30 AM,10:00 AM,10:30 AM,11:00 AM,02:00 PM,02:30 PM,03:00 PM";
        doctorRepo.saveAll(List.of(
            doctor("Dr. Anil Sharma",    "General Medicine", "Senior Consultant",        "MBBS, MD (Medicine)",  "15+ Yrs Exp", "Cabin 101, 1st Floor", "Mon – Sat", slots),
            doctor("Dr. Priya Mehta",    "General Medicine", "Consultant Physician",      "MBBS, DNB (Medicine)", "8+ Yrs Exp",  "Cabin 102, 1st Floor", "Mon – Fri", slots),
            doctor("Dr. Sunita Patel",   "Dermatology",      "Dermatologist & Cosmetologist", "MBBS, MD (Skin)",  "12+ Yrs Exp", "Cabin 204, 2nd Floor", "Mon – Sat", slots),
            doctor("Dr. Rajesh Verma",   "Orthopedics",      "Senior Joint Replacement Specialist", "MBBS, MS (Ortho)", "18+ Yrs Exp", "Cabin 305, 3rd Floor", "Mon – Sat", slots),
            doctor("Dr. Kavita Singh",   "Orthopedics",      "Consultant Orthopedic Surgeon", "MBBS, DNB (Ortho)", "7+ Yrs Exp",  "Cabin 306, 3rd Floor", "Tue – Sun", slots),
            doctor("Dr. Meena Joshi",    "Gynecology",       "Senior Gynecologist & Obstetrician", "MBBS, MS (Gynec)", "14+ Yrs Exp", "Cabin 201, 2nd Floor", "Mon – Sat", slots),
            doctor("Dr. Suresh Nair",    "Pediatrics",       "Senior Pediatrician",       "MBBS, MD (Pediatrics)","11+ Yrs Exp", "Cabin 108, 1st Floor", "Mon – Sat", slots),
            doctor("Dr. Anita Rao",      "Pediatrics",       "Child Health Specialist",   "MBBS, DCH",            "6+ Yrs Exp",  "Cabin 109, 1st Floor", "Mon – Fri", slots),
            doctor("Dr. Farhan Qureshi", "ENT",              "ENT Specialist & Surgeon",  "MBBS, MS (ENT)",       "10+ Yrs Exp", "Cabin 210, 2nd Floor", "Mon – Sat", slots),
            doctor("Dr. Leela Iyer",     "Ophthalmology",    "Eye Specialist & Surgeon",  "MBBS, MS (Ophth)",     "13+ Yrs Exp", "Cabin 215, 2nd Floor", "Mon – Sat", slots),
            doctor("Dr. Nikhil Shah",    "Dentistry",        "Dental & Maxillofacial Surgeon", "BDS, MDS",        "9+ Yrs Exp",  "Cabin 112, 1st Floor", "Mon – Sat", slots),
            doctor("Dr. On-Duty Staff",  "Emergency",        "Emergency Care Team",       "MBBS",                 "24x7 Duty",   "Emergency Block A",    "Everyday",  "24x7")
        ));
    }

    private Doctor doctor(String name, String dept, String spec, String qual,
                          String exp, String cabin, String days, String slots) {

        Doctor d = new Doctor();

        d.setName(name);
        d.setDepartment(dept);
        d.setSpecialization(spec);
        d.setQualification(qual);
        d.setExperience(exp);
        d.setCabinNo(cabin);
        d.setOpdDays(days);
        d.setAvailableSlots(slots);
        d.setActive(true);

        return d;
    }
    private void seedAppointments() {
        if (appointmentRepo.count() > 0) return;
        LocalDate base = LocalDate.now().plusDays(1);
        appointmentRepo.saveAll(List.of(
            appt("OPD-1001","Ramesh Patel",  "9876543210",45,"Male",  "General Medicine","Dr. Anil Sharma",  base,      "10:00 AM"),
            appt("OPD-1002","Sunita Verma",  "9123456780",32,"Female","Gynecology",      "Dr. Meena Joshi",  base.plusDays(1),"11:00 AM"),
            appt("OPD-1003","Arjun Singh",   "9988776655",28,"Male",  "Orthopedics",     "Dr. Rajesh Verma", base.plusDays(2),"09:30 AM"),
            appt("OPD-1004","Kavya Nair",    "9871234560", 7,"Female","Pediatrics",      "Dr. Suresh Nair",  base.plusDays(2),"02:00 PM"),
            appt("OPD-1005","Mohan Das",     "9765432100",60,"Male",  "Dermatology",     "Dr. Sunita Patel", base.plusDays(3),"03:00 PM")
        ));
    }

    private Appointment appt(String id, String name, String mobile, int age, String gender,
                              String dept, String doctor, LocalDate date, String slot) {
        Appointment a = new Appointment();
        a.setId(id); a.setPatientName(name); a.setMobile(mobile); a.setAge(age);
        a.setGender(gender); a.setDepartment(dept);
        a.setDoctor(doctor); a.setAppointmentDate(date); a.setTimeSlot(slot);
        return a;
    }

    private void seedFollowUps() {
        if (followUpRepo.count() > 0) return;
        LocalDate base = LocalDate.now().plusDays(14);
        followUpRepo.saveAll(List.of(
            followUp("OPD-1001","9876543210","Dr. Anil Sharma",  "General Medicine",base,         false),
            followUp("OPD-1002","9123456780","Dr. Meena Joshi",  "Gynecology",      base.plusDays(2),true),
            followUp("OPD-1003","9988776655","Dr. Rajesh Verma", "Orthopedics",     base.plusDays(4),false)
        ));
    }

    private FollowUp followUp(String apptId, String mobile, String doctor,
                               String dept, LocalDate date, boolean sent) {
        FollowUp f = new FollowUp();
        f.setAppointmentId(apptId); f.setMobile(mobile); f.setDoctor(doctor);
        f.setDepartment(dept); f.setFollowUpDate(date); f.setReminderSent(sent);
        return f;
    }
}
