package com.opd_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 15)
    private String mobile;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 100)
    private String displayUsername;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    // Profile fields (nullable — filled after signup)
    private String firstName;
    private String middleName;
    private String lastName;
    private Integer age;
    private LocalDate dateOfBirth;
    private String gender;
    private String maritalStatus;
    private String email;
    private String address;
    private String district;
    private String state;

    @Column(nullable = false)
    private boolean profileComplete = false;

    public enum Role { PATIENT, ADMIN }

    public User(String mobile, String password, String displayUsername, Role role) {
        this.mobile = mobile;
        this.password = password;
        this.displayUsername = displayUsername;
        this.role = role;
    }
}
