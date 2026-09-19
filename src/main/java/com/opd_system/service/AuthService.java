package com.opd_system.service;

import com.opd_system.dto.AuthRequest;
import com.opd_system.dto.AuthResponse;
import com.opd_system.dto.ProfileRequest;
import com.opd_system.dto.ProfileResponse;
import com.opd_system.entity.User;
import com.opd_system.repository.UserRepository;
import com.opd_system.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder encoder;

    public AuthResponse login(AuthRequest req) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getMobile(), req.getPassword())
        );
        UserDetails ud = userDetailsService.loadUserByUsername(req.getMobile());
        String token = jwtUtil.generateToken(ud);
        User user = userRepository.findByMobile(req.getMobile()).orElseThrow();
        return new AuthResponse(token, user.getDisplayUsername(), user.getRole().name(),
                user.getMobile(), user.isProfileComplete());
    }

    public AuthResponse register(AuthRequest req) {
        if (userRepository.existsByMobile(req.getMobile())) {
            throw new IllegalArgumentException("Mobile number already registered");
        }
        User user = new User(req.getMobile(), encoder.encode(req.getPassword()),
                req.getDisplayUsername(), User.Role.PATIENT);
        userRepository.save(user);
        UserDetails ud = userDetailsService.loadUserByUsername(req.getMobile());
        String token = jwtUtil.generateToken(ud);
        return new AuthResponse(token, user.getDisplayUsername(), user.getRole().name(),
                user.getMobile(), false);
    }

    // Partial update — only overwrite fields that are non-null in request
    public ProfileResponse saveProfile(String mobile, ProfileRequest req) {
        User user = userRepository.findByMobile(mobile).orElseThrow();

        if (req.getFirstName()    != null) user.setFirstName(req.getFirstName());
        if (req.getMiddleName()   != null) user.setMiddleName(req.getMiddleName());
        if (req.getLastName()     != null) user.setLastName(req.getLastName());
        if (req.getAge()          != null) user.setAge(req.getAge());
        if (req.getDateOfBirth()  != null) user.setDateOfBirth(req.getDateOfBirth());
        if (req.getGender()       != null) user.setGender(req.getGender());
        if (req.getMaritalStatus()!= null) user.setMaritalStatus(req.getMaritalStatus());
        if (req.getEmail()        != null) user.setEmail(req.getEmail());
        if (req.getAddress()      != null) user.setAddress(req.getAddress());
        if (req.getDistrict()     != null) user.setDistrict(req.getDistrict());
        if (req.getState()        != null) user.setState(req.getState());

        // Backend-driven profileComplete — all required fields must be filled
        user.setProfileComplete(isComplete(user));
        userRepository.save(user);
        return toProfileResponse(user);
    }

    public ProfileResponse getProfile(String mobile) {
        return toProfileResponse(userRepository.findByMobile(mobile).orElseThrow());
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
        // 10 tracked fields — each worth 10%
        String[] values = {
            u.getFirstName(), u.getLastName(), u.getMiddleName(),
            u.getGender(), u.getMaritalStatus(), u.getEmail(),
            u.getAddress(), u.getDistrict(), u.getState(),
            u.getAge() != null ? "ok" : null
        };
        int filled = 0;
        for (String v : values) if (hasValue(v)) filled++;
        return filled * 10;
    }

    private ProfileResponse toProfileResponse(User u) {
        ProfileResponse r = new ProfileResponse();
        r.setDisplayUsername(u.getDisplayUsername());
        r.setMobile(u.getMobile());
        r.setFirstName(nvl(u.getFirstName()));
        r.setMiddleName(nvl(u.getMiddleName()));
        r.setLastName(nvl(u.getLastName()));
        r.setAge(u.getAge() != null ? u.getAge().toString() : "");
        r.setDateOfBirth(u.getDateOfBirth() != null ? u.getDateOfBirth().toString() : "");
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

    private boolean hasValue(String s) { return s != null && !s.isBlank(); }
    private String nvl(String s) { return s != null ? s : ""; }
}
