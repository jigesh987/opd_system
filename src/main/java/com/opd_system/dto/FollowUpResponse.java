package com.opd_system.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class FollowUpResponse {
    private Long id;
    private String appointmentId;
    private String mobile;
    private String doctor;
    private String department;
    private LocalDate followUpDate;
    private boolean reminderSent;
}
