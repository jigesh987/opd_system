package com.opd_system.controller;

import com.opd_system.dto.AuthRequest;
import com.opd_system.dto.AuthResponse;
import com.opd_system.dto.ProfileRequest;
import com.opd_system.dto.ProfileResponse;
import com.opd_system.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getProfile(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> saveProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileRequest req) {
        return ResponseEntity.ok(authService.saveProfile(userDetails.getUsername(), req));
    }
}
