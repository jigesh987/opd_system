package com.opd_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
public class Appointment {

    @Id
    @Column(length = 20)
    private String id;

    @Column(nullable = false, length = 100)
    private String patientName;

    @Column(nullable = false, length = 15)
    private String mobile;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false, length = 10)
    private String gender;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(nullable = false, length = 100)
    private String doctor;

    @Column(nullable = false)
    private LocalDate appointmentDate;

    @Column(nullable = false, length = 20)
    private String timeSlot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.CONFIRMED;

    /** FK to the User who booked — null for legacy/seeded data */
    @Column(name = "user_id")
    private Long userId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(nullable = true, length = 50)
    private String preferredLanguage;

    public enum Status { CONFIRMED, CANCELLED, COMPLETED }
}
