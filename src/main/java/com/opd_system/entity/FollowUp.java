package com.opd_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "follow_ups")
@Data
@NoArgsConstructor
public class FollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String appointmentId;

    @Column(nullable = false, length = 15)
    private String mobile;

    @Column(nullable = false, length = 100)
    private String doctor;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(nullable = false)
    private LocalDate followUpDate;

    @Column(nullable = false)
    private boolean reminderSent = false;
}
