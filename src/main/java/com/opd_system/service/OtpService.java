package com.opd_system.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OTP Service — development-safe implementation.
 *
 * Architecture:
 *  - OTPs are stored in-memory with a 5-minute TTL.
 *  - In DEV mode, the OTP is logged to console (no real SMS sent).
 *  - To connect a real SMS provider (Twilio, MSG91, etc.), implement
 *    sendSms(String mobile, String message) and replace the log statement.
 *
 * This class is the SINGLE place to change when wiring a real SMS provider.
 */
@Slf4j
@Service
public class OtpService {

    // OTP valid for 5 minutes
    private static final long OTP_TTL_MS = 5 * 60 * 1000L;

    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Internal record: OTP value + creation timestamp + the target mobile it was issued for.
     * Keyed by the CURRENT mobile (the logged-in user's identifier).
     */
    private record OtpEntry(String otp, String targetMobile, long createdAt) {}

    // currentMobile → OtpEntry
    private final ConcurrentHashMap<String, OtpEntry> store = new ConcurrentHashMap<>();

    /**
     * Generate a 6-digit OTP, associate it with (currentMobile → newMobile), and
     * "send" it to newMobile.
     *
     * @param currentMobile the logged-in user's current mobile (used as session key)
     * @param newMobile     the new mobile that should receive the OTP
     */
    public void generateAndSend(String currentMobile, String newMobile) {
        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        store.put(currentMobile, new OtpEntry(otp, newMobile, System.currentTimeMillis()));

        // ── SMS integration point ──────────────────────────────────────────────
        // Replace the line below with a real SMS provider call, e.g.:
        //   smsProvider.send(newMobile, "Your Smart OPD mobile change OTP is: " + otp + ". Valid for 5 minutes.");
        // ─────────────────────────────────────────────────────────────────────
        log.info("=== [DEV OTP] Mobile change OTP for new number {} : {} (expires in 5 min) ===",
                newMobile, otp);
    }

    /**
     * Verify the OTP submitted by the user.
     *
     * @param currentMobile the logged-in user's current mobile (session key)
     * @param newMobile     must match the newMobile stored when OTP was issued
     * @param submittedOtp  the OTP the user typed
     * @return true if valid and not expired; false otherwise
     */
    public boolean verify(String currentMobile, String newMobile, String submittedOtp) {
        OtpEntry entry = store.get(currentMobile);
        if (entry == null) return false;

        boolean expired = (System.currentTimeMillis() - entry.createdAt()) > OTP_TTL_MS;
        if (expired) {
            store.remove(currentMobile);
            return false;
        }

        boolean mobileMatches = entry.targetMobile().equals(newMobile);
        boolean otpMatches = entry.otp().equals(submittedOtp);
        return mobileMatches && otpMatches;
    }

    /**
     * Invalidate (consume) the OTP after a successful mobile change.
     * Must be called after successful verification to prevent OTP reuse.
     */
    public void invalidate(String currentMobile) {
        store.remove(currentMobile);
    }
}
