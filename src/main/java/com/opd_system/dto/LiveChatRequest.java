package com.opd_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class LiveChatRequest {
    @NotBlank
    private String message;
    private String language = "English";
    private List<ChatMessage> history = List.of();

    @Data
    public static class ChatMessage {
        private String role;
        private String content;
    }
}
