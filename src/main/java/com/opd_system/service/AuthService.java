package com.opd_system.service;

import com.opd_system.dto.AuthRequest;
import com.opd_system.dto.AuthResponse;
import com.opd_system.dto.MobileChangeRequest;
import com.opd_system.dto.OtpVerifyRequest;
import com.opd_system.dto.ProfileRequest;
import com.opd_system.dto.ProfileResponse;
import com.opd_system.entity.Doctor;
import com.opd_system.entity.User;
import com.opd_system.repository.DoctorRepository;
import com.opd_system.repository.UserRepository;
import com.opd_system.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder encoder;
    private final OtpService otpService;

    public AuthResponse login(AuthRequest req) {

        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.getMobile(),
                        req.getPassword()
                )
        );

        UserDetails ud =
                userDetailsService.loadUserByUsername(req.getMobile());

        String token = jwtUtil.generateToken(ud);

        User user = userRepository
                .findByMobile(req.getMobile())
                .orElseThrow();

        List<Doctor> doctors = doctorRepository.findByIsActiveTrue();

        return new AuthResponse(
                token,
                user.getDisplayUsername(),
                user.getRole().name(),
                user.getMobile(),
                user.isProfileComplete(),
                doctors
        );
    }

    public AuthResponse register(AuthRequest req) {

        if (userRepository.existsByMobile(req.getMobile())) {
            throw new IllegalArgumentException(
                    "Mobile number already registered"
            );
        }

        User user = new User(
                req.getMobile(),
                encoder.encode(req.getPassword()),
                req.getDisplayUsername(),
                User.Role.PATIENT
        );

        userRepository.save(user);

        UserDetails ud =
                userDetailsService.loadUserByUsername(req.getMobile());

        String token = jwtUtil.generateToken(ud);

        List<Doctor> doctors = doctorRepository.findByIsActiveTrue();

        return new AuthResponse(
                token,
                user.getDisplayUsername(),
                user.getRole().name(),
                user.getMobile(),
                false,
                doctors
        );
    }

    // Partial update — only overwrite fields that are non-null in request
    public ProfileResponse saveProfile(String mobile, ProfileRequest req) {

        User user = userRepository
                .findByMobile(mobile)
                .orElseThrow();

        if (req.getFirstName() != null)
            user.setFirstName(req.getFirstName());

        if (req.getMiddleName() != null)
            user.setMiddleName(req.getMiddleName());

        if (req.getLastName() != null)
            user.setLastName(req.getLastName());

        if (req.getAge() != null)
            user.setAge(req.getAge());

        if (req.getDateOfBirth() != null)
            user.setDateOfBirth(req.getDateOfBirth());

        if (req.getGender() != null)
            user.setGender(req.getGender());

        if (req.getMaritalStatus() != null)
            user.setMaritalStatus(req.getMaritalStatus());

        if (req.getEmail() != null)
            user.setEmail(req.getEmail());

        if (req.getAddress() != null)
            user.setAddress(req.getAddress());

        if (req.getDistrict() != null)
            user.setDistrict(req.getDistrict());

        if (req.getState() != null)
            user.setState(req.getState());

        user.setProfileComplete(isComplete(user));

        userRepository.save(user);

        return toProfileResponse(user);
    }

    public ProfileResponse getProfile(String mobile) {

        return toProfileResponse(
                userRepository.findByMobile(mobile).orElseThrow()
        );
    }

    // ── Mobile change — Step 1: verify password + send OTP ────────────────────

    /**
     * Step 1 of the mobile change flow.
     * - Re-authenticates the user using their current password.
     * - Checks the new mobile is not already taken.
     * - Generates and "sends" a 6-digit OTP to the new mobile.
     */
    public void initiateChangeMyMobile(String currentMobile, MobileChangeRequest req) {

        // Load the user to verify password
        User user = userRepository.findByMobile(currentMobile)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Verify current password — this is the re-authentication gate
        if (!encoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        // Ensure new mobile is different from the current one
        if (currentMobile.equals(req.getNewMobile())) {
            throw new IllegalArgumentException("New mobile number must be different from your current mobile number");
        }

        // Ensure new mobile is not already registered by someone else
        if (userRepository.existsByMobile(req.getNewMobile())) {
            throw new IllegalArgumentException("This mobile number is already registered with another account");
        }

        // Generate OTP and send to new mobile
        otpService.generateAndSend(currentMobile, req.getNewMobile());
    }

    // ── Mobile change — Step 2: verify OTP + commit change ────────────────────

    /**
     * Step 2 of the mobile change flow.
     * - Verifies the OTP against what was generated in Step 1.
     * - Updates User.mobile in the database.
     * - Consumes (invalidates) the OTP so it cannot be reused.
     *
     * After this returns, the caller should clear the client JWT and redirect
     * to login. Any subsequent request using the old JWT will fail because the
     * username (old mobile) no longer matches any active user record for that token.
     *
     * @return the new mobile that was saved — the client must use it to log in next
     */
    public String confirmChangeMyMobile(String currentMobile, OtpVerifyRequest req) {

        // Verify the OTP (checks TTL + target mobile match)
        if (!otpService.verify(currentMobile, req.getNewMobile(), req.getOtp())) {
            throw new IllegalArgumentException("Invalid or expired OTP. Please request a new OTP.");
        }

        // Double-check: ensure no one registered the new number in the window between step 1 and step 2
        if (userRepository.existsByMobile(req.getNewMobile())) {
            otpService.invalidate(currentMobile);
            throw new IllegalArgumentException("This mobile number was registered by someone else. Please start over.");
        }

        // Commit the change
        User user = userRepository.findByMobile(currentMobile)
                .orElseThrow(() -> new IllegalArgumentException("User session invalid. Please log in again."));

        user.setMobile(req.getNewMobile());
        userRepository.save(user);

        // Consume the OTP — prevents replay attacks
        otpService.invalidate(currentMobile);

        return req.getNewMobile();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean isComplete(User u) {

        return hasValue(u.getFirstName())
                && hasValue(u.getLastName())
                && u.getAge() != null
                && hasValue(u.getGender())
                && hasValue(u.getMaritalStatus())
                && hasValue(u.getState());
    }

    private int calcCompletionPercent(User u) {

        String[] values = {
                u.getFirstName(),
                u.getLastName(),
                u.getMiddleName(),
                u.getGender(),
                u.getMaritalStatus(),
                u.getEmail(),
                u.getAddress(),
                u.getDistrict(),
                u.getState(),
                u.getAge() != null ? "ok" : null
        };

        int filled = 0;

        for (String v : values) {
            if (hasValue(v)) {
                filled++;
            }
        }

        return filled * 10;
    }

    private ProfileResponse toProfileResponse(User u) {

        ProfileResponse r = new ProfileResponse();

        r.setDisplayUsername(u.getDisplayUsername());
        r.setMobile(u.getMobile());

        r.setFirstName(nvl(u.getFirstName()));
        r.setMiddleName(nvl(u.getMiddleName()));
        r.setLastName(nvl(u.getLastName()));

        r.setAge(
                u.getAge() != null
                        ? u.getAge().toString()
                        : ""
        );

        r.setDateOfBirth(
                u.getDateOfBirth() != null
                        ? u.getDateOfBirth().toString()
                        : ""
        );

        r.setGender(nvl(u.getGender()));
        r.setMaritalStatus(nvl(u.getMaritalStatus()));
        r.setEmail(nvl(u.getEmail()));
        r.setAddress(nvl(u.getAddress()));
        r.setDistrict(nvl(u.getDistrict()));
        r.setState(nvl(u.getState()));

        r.setProfileComplete(u.isProfileComplete());
        r.setCompletionPercent(calcCompletionPercent(u));

        return r;
    }

    private boolean hasValue(String s) {
        return s != null && !s.isBlank();
    }

    private String nvl(String s) {
        return s != null ? s : "";
    }
}