package com.opd_system.controller;

import com.opd_system.dto.ChatRequest;
import com.opd_system.dto.ChatResponse;
import com.opd_system.dto.LiveChatRequest;
import com.opd_system.service.ChatbotService;
import com.opd_system.service.DashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.codec.ServerSentEvent;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final DashboardService dashboardService;

    @PostMapping("/suggest")
    public ResponseEntity<ChatResponse> suggest(@Valid @RequestBody ChatRequest req) {
        dashboardService.incrementChatbot();
        return ResponseEntity.ok(chatbotService.suggest(req));
    }

    @PostMapping(value = "/live", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> live(@Valid @RequestBody LiveChatRequest request) {
        dashboardService.incrementChatbot();
        return chatbotService.liveChat(request)
            .map(chunk -> ServerSentEvent.builder(chunk).event("message").build())
            .concatWithValues(ServerSentEvent.builder("[DONE]").event("done").build());
    }
}
