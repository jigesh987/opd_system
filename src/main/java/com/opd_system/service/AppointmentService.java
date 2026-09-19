package com.opd_system.service;

import com.opd_system.dto.AppointmentRequest;
import com.opd_system.dto.AppointmentResponse;
import com.opd_system.entity.Appointment;
import com.opd_system.entity.User;
import com.opd_system.repository.AppointmentRepository;
import com.opd_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository repo;
    private final UserRepository userRepo;

    /**
     * Book an appointment for the currently authenticated user.
     * Patient details are sourced from their profile — they only choose
     * department, doctor, date, and time slot.
     */
    public AppointmentResponse book(String mobile, AppointmentRequest req) {
        // 1. Load the user from DB
        User user = userRepo.findByMobile(mobile)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        // 2. Profile must be complete before booking
        if (!user.isProfileComplete()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Please complete your profile before booking an appointment.");
        }

        // 3. Prevent duplicate booking for same doctor + date + slot
        if (repo.existsByDoctorAndAppointmentDateAndTimeSlot(
                req.getDoctor(), req.getAppointmentDate(), req.getTimeSlot())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This time slot with " + req.getDoctor() + " is already booked. Please choose a different slot.");
        }

        // 4. Build appointment — patient identity comes from the user's profile
        String fullName = buildFullName(user);

        Appointment a = new Appointment();
        a.setId(generateId());
        a.setUserId(user.getId());
        // Auto-filled from profile
        a.setPatientName(fullName);
        a.setMobile(user.getMobile());
        a.setAge(user.getAge() != null ? user.getAge() : 0);
        a.setGender(user.getGender() != null ? user.getGender() : "");
        // Chosen by user
        a.setDepartment(req.getDepartment());
        a.setDoctor(req.getDoctor());
        a.setAppointmentDate(req.getAppointmentDate());
        a.setTimeSlot(req.getTimeSlot());

        return toResponse(repo.save(a));
    }

    /** Admin — get all appointments */
    public List<AppointmentResponse> getAll() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    /** Patient — get only their own appointments by userId */
    public List<AppointmentResponse> getMyAppointments(String mobile) {
        User user = userRepo.findByMobile(mobile)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return repo.findByUserId(user.getId()).stream().map(this::toResponse).toList();
    }

    /** Legacy lookup by mobile — kept for FollowUp page compatibility */
    public List<AppointmentResponse> lookupByMobile(String mobile) {
        return repo.findByMobile(mobile).stream().map(this::toResponse).toList();
    }

    public AppointmentResponse getById(String id) {
        return repo.findById(id).map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + id));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private String buildFullName(User user) {
        StringBuilder sb = new StringBuilder();
        if (user.getFirstName() != null && !user.getFirstName().isBlank()) sb.append(user.getFirstName()).append(" ");
        if (user.getMiddleName() != null && !user.getMiddleName().isBlank()) sb.append(user.getMiddleName()).append(" ");
        if (user.getLastName() != null && !user.getLastName().isBlank()) sb.append(user.getLastName());
        String name = sb.toString().trim();
        return name.isBlank() ? user.getDisplayUsername() : name;
    }

    private AppointmentResponse toResponse(Appointment a) {
        AppointmentResponse r = new AppointmentResponse();
        r.setId(a.getId());
        r.setPatientName(a.getPatientName());
        r.setMobile(a.getMobile());
        r.setAge(a.getAge());
        r.setGender(a.getGender());
        r.setDepartment(a.getDepartment());
        r.setDoctor(a.getDoctor());
        r.setAppointmentDate(a.getAppointmentDate());
        r.setTimeSlot(a.getTimeSlot());
        r.setStatus(a.getStatus().name());
        return r;
    }

    private String generateId() {
        return "OPD-" + (1000 + new Random().nextInt(9000));
    }
}
