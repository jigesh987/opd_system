package com.opd_system.repository;

import com.opd_system.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    List<Appointment> findByMobile(String mobile);

    List<Appointment> findByUserId(Long userId);

    boolean existsByDoctorAndAppointmentDateAndTimeSlot(String doctor, LocalDate date, String slot);

    long countByAppointmentDate(LocalDate date);

    @Query("SELECT a.department, COUNT(a) FROM Appointment a GROUP BY a.department")
    List<Object[]> countByDepartment();

    @Query("SELECT a.preferredLanguage, COUNT(a) FROM Appointment a GROUP BY a.preferredLanguage")
    List<Object[]> countByLanguage();
}
