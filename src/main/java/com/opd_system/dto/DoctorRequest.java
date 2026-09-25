package com.opd_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DoctorRequest {

    @NotBlank(message = "Doctor name is required")
    private String name;

    @NotBlank(message = "Department is required")
    private String department;

    private String qualification;
    private String availableSlots;
    private String specialization;
    private String experience;
    private String cabinNo;
    private String opdDays;
    private Boolean active;
}
