package com.opd_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(length = 100)
    private String qualification;

    @Column(length = 200)
    private String availableSlots;

    @Column(length = 150)
    private String specialization;

    @Column(length = 50)
    private String experience;

    @Column(length = 50)
    private String cabinNo;

    @Column(length = 50)
    private String opdDays = "Mon - Sat";

    @Column(nullable = false)
    private boolean active = true;
}
