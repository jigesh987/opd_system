package com.opd_system.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ProfileRequest {
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
}
