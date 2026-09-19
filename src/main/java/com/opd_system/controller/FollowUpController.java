package com.opd_system.controller;

import com.opd_system.dto.FollowUpResponse;
import com.opd_system.service.FollowUpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/followups")
@RequiredArgsConstructor
public class FollowUpController {

    private final FollowUpService service;

    @GetMapping("/lookup")
    public ResponseEntity<List<FollowUpResponse>> lookup(@RequestParam String query) {
        return ResponseEntity.ok(service.lookup(query));
    }

    @PostMapping("/{id}/remind")
    public ResponseEntity<FollowUpResponse> sendReminder(@PathVariable Long id) {
        return ResponseEntity.ok(service.sendReminder(id));
    }
}
