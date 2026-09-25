package com.opd_system.controller;

import com.opd_system.dto.AuthRequest;
import com.opd_system.dto.AuthResponse;
import com.opd_system.dto.MobileChangeRequest;
import com.opd_system.dto.OtpVerifyRequest;
import com.opd_system.dto.ProfileRequest;
import com.opd_system.dto.ProfileResponse;
import com.opd_system.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    /**
     * Step 1 — Initiate mobile number change.
     * Verifies current password, checks new mobile availability, sends OTP to new mobile.
     * Requires: valid JWT (any authenticated user)
     */
    @PostMapping("/mobile/change-request")
    public ResponseEntity<Map<String, String>> initiateChangeMobile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MobileChangeRequest req) {

        authService.initiateChangeMyMobile(userDetails.getUsername(), req);
        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to new mobile number. Please verify within 5 minutes."
        ));
    }

    /**
     * Step 2 — Verify OTP and commit mobile number change.
     * On success, the old JWT becomes invalid (mobile no longer maps to any user).
     * Frontend must clear session and redirect to login.
     * Requires: valid JWT (any authenticated user)
     */
    @PostMapping("/mobile/verify-otp")
    public ResponseEntity<Map<String, String>> verifyAndChangeMobile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OtpVerifyRequest req) {

        String newMobile = authService.confirmChangeMyMobile(userDetails.getUsername(), req);
        return ResponseEntity.ok(Map.of(
                "message", "Mobile number changed successfully. Please log in with your new mobile number.",
                "newMobile", newMobile,
                // Signal to frontend: invalidate current session and redirect to login
                "sessionInvalidated", "true"
        ));
    }
}

