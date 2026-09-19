package com.opd_system.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AppointmentRequest {

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Doctor is required")
    private String doctor;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Date must be today or in the future")
    private LocalDate appointmentDate;

    @NotBlank(message = "Time slot is required")
    private String timeSlot;
}
