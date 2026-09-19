package com.opd_system.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AppointmentResponse {
    private String id;
    private String patientName;
    private String mobile;
    private Integer age;
    private String gender;
    private String department;
    private String doctor;
    private LocalDate appointmentDate;
    private String timeSlot;
    private String status;
}
