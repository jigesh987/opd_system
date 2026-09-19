package com.opd_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatRequest {
    @NotBlank
    private String symptoms;
    private String duration;
    private String age;
    private String language;
}
