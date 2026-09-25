package com.opd_system.service;

import com.opd_system.dto.DashboardResponse;
import com.opd_system.entity.User;
import com.opd_system.repository.AppointmentRepository;
import com.opd_system.repository.DoctorRepository;
import com.opd_system.repository.FollowUpRepository;
import com.opd_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DoctorRepository doctorRepo;
    private final AppointmentRepository appointmentRepo;
    private final UserRepository userRepo;
    private final FollowUpRepository followUpRepo;

    // In-memory counter for chatbot requests (no persistence needed for demo)
    private final AtomicLong chatbotCounter = new AtomicLong(0);

    public DashboardResponse getStats() {
        DashboardResponse r = new DashboardResponse();
        r.setTotalDoctors(doctorRepo.count());
        r.setTotalAppointments(appointmentRepo.count());
        r.setTodayAppointments(appointmentRepo.countByAppointmentDate(LocalDate.now()));
        r.setTotalPatients(userRepo.countByRole(User.Role.PATIENT));
        r.setFollowUpsDue(followUpRepo.countByFollowUpDateBeforeAndReminderSentFalse(LocalDate.now().plusDays(7)));
        r.setChatbotRequests(chatbotCounter.get());

        List<Map<String, Object>> deptWise = appointmentRepo.countByDepartment().stream()
                .map(row -> Map.<String, Object>of("department", row[0] != null ? row[0] : "General", "count", row[1]))
                .toList();
        r.setDepartmentWise(deptWise);

        List<Map<String, Object>> langUsage = appointmentRepo.countByLanguage().stream()
                .map(row -> Map.<String, Object>of("language", row[0] != null ? row[0] : "English", "count", row[1]))
                .toList();
        r.setLanguageUsage(langUsage);
        return r;
    }

    public void incrementChatbot() {
        chatbotCounter.incrementAndGet();
    }
}
