package com.opd_system.dto;

import java.util.List;

import com.opd_system.entity.Doctor;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;   // displayUsername
    private String role;
    private String mobile;
    private boolean profileComplete;
    private List<Doctor> doctors; // Added field for doctor profiles
}
