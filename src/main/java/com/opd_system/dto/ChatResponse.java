package com.opd_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatResponse {
    private String suggestedDepartment;
    private String reasoning;
    private boolean emergency;
    private String disclaimer;

    public static final String DISCLAIMER =
        "This tool only provides general guidance and is not a medical diagnosis. Please consult a qualified doctor.";
}
