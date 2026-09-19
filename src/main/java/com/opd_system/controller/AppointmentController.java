package com.opd_system.controller;

import com.opd_system.dto.AppointmentRequest;
import com.opd_system.dto.AppointmentResponse;
import com.opd_system.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService service;

    /** Book an appointment — JWT required, patient details auto-filled from profile */
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponse> book(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AppointmentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.book(userDetails.getUsername(), req));
    }

    /** Patient — view only their own appointments */
    @GetMapping("/mine")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.getMyAppointments(userDetails.getUsername()));
    }

    /** Admin — view all appointments */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /** Legacy mobile lookup — still used by FollowUp page */
    @GetMapping("/lookup")
    public ResponseEntity<List<AppointmentResponse>> lookup(@RequestParam String mobile) {
        return ResponseEntity.ok(service.lookupByMobile(mobile));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getById(id));
    }
}
