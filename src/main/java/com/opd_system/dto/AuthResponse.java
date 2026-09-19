package com.opd_system.dto;

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
}
