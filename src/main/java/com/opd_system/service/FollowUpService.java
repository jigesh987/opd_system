package com.opd_system.service;

import com.opd_system.dto.FollowUpResponse;
import com.opd_system.entity.FollowUp;
import com.opd_system.repository.FollowUpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class FollowUpService {

    private final FollowUpRepository repo;

    public List<FollowUpResponse> lookup(String query) {
        String q = query.trim();
        List<FollowUp> byMobile = repo.findByMobile(q);
        List<FollowUp> byId = repo.findByAppointmentId(q.toUpperCase());
        return Stream.concat(byMobile.stream(), byId.stream())
                .distinct()
                .map(this::toResponse)
                .toList();
    }

    public FollowUpResponse sendReminder(Long id) {
        FollowUp f = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Follow-up not found: " + id));
        f.setReminderSent(true);
        return toResponse(repo.save(f));
    }

    private FollowUpResponse toResponse(FollowUp f) {
        FollowUpResponse r = new FollowUpResponse();
        r.setId(f.getId()); r.setAppointmentId(f.getAppointmentId());
        r.setMobile(f.getMobile()); r.setDoctor(f.getDoctor());
        r.setDepartment(f.getDepartment()); r.setFollowUpDate(f.getFollowUpDate());
        r.setReminderSent(f.isReminderSent());
        return r;
    }
}
