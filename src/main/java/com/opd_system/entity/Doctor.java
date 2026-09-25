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
    private String opdDays;

    @Column(name = "is_active", nullable = false, columnDefinition = "tinyint(1) default 1")
    private boolean active = true;

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
