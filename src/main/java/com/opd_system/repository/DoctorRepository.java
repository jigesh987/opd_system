package com.opd_system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.opd_system.entity.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByDepartmentAndActiveTrue(String department);
    List<Doctor> findByActiveTrue();

    default List<Doctor> findByDepartmentAndIsActiveTrue(String department) {
        return findByDepartmentAndActiveTrue(department);
    }

    default List<Doctor> findByIsActiveTrue() {
        return findByActiveTrue();
    }
}
