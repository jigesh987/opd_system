package com.opd_system.controller;

import com.opd_system.entity.Doctor;
import com.opd_system.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService service;

    @GetMapping
    public ResponseEntity<List<Doctor>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/by-department")
    public ResponseEntity<List<Doctor>> getByDepartment(@RequestParam String department) {
        return ResponseEntity.ok(service.getByDepartment(department));
    }
}
