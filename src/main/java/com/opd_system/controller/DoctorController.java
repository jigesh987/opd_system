package com.opd_system.controller;

import com.opd_system.dto.DoctorRequest;
import com.opd_system.entity.Doctor;
import com.opd_system.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService service;

    // Public / Patient endpoints
    @GetMapping("/api/doctors")
    public ResponseEntity<List<Doctor>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/api/doctors/by-department")
    public ResponseEntity<List<Doctor>> getByDepartment(@RequestParam String department) {
        return ResponseEntity.ok(service.getByDepartment(department));
    }

    // Admin endpoints (strictly protected with ROLE_ADMIN)
    @GetMapping("/api/admin/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Doctor>> getAllForAdmin() {
        return ResponseEntity.ok(service.getAllForAdmin());
    }

    @PostMapping("/api/admin/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Doctor> createDoctor(@Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(service.createDoctor(request));
    }

    @PutMapping("/api/admin/doctors/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(service.updateDoctor(id, request));
    }

    @PatchMapping("/api/admin/doctors/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Doctor> toggleDoctorStatus(@PathVariable Long id, @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(service.toggleDoctorStatus(id, active));
    }
}
