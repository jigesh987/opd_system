package com.opd_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class MobileChangeRequest {

    /** The new mobile number the user wants to switch to */
    @NotBlank(message = "New mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
    private String newMobile;

    /** Current account password — re-verified server-side before issuing OTP */
    @NotBlank(message = "Current password is required for verification")
    private String currentPassword;
}
