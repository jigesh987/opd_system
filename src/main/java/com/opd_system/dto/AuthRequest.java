package com.opd_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    private String mobile;
    private String displayUsername;
    @NotBlank
    private String password;
}
