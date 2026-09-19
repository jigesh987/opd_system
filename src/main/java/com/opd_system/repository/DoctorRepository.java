package com.opd_system.repository;

import com.opd_system.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByDepartmentAndActiveTrue(String department);
    List<Doctor> findByActiveTrue();
}
