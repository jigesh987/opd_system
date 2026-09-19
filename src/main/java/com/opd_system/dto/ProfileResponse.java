package com.opd_system.dto;

import lombok.Data;

@Data
public class ProfileResponse {
    private String displayUsername;
    private String mobile;
    private String firstName;
    private String middleName;
    private String lastName;
    private String age;
    private String dateOfBirth;
    private String gender;
    private String maritalStatus;
    private String email;
    private String address;
    private String district;
    private String state;
    private boolean profileComplete;
    private int completionPercent;
}
