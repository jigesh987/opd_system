package com.opd_system.repository;

import com.opd_system.entity.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
    List<FollowUp> findByMobile(String mobile);
    List<FollowUp> findByAppointmentId(String appointmentId);
    long countByFollowUpDateBeforeAndReminderSentFalse(LocalDate date);
}
