package com.opd_system.service;

import com.opd_system.entity.Doctor;
import com.opd_system.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository repo;

    public List<Doctor> getAll() {
        return repo.findByActiveTrue();
    }

    public List<Doctor> getByDepartment(String department) {
        return repo.findByDepartmentAndActiveTrue(department);
    }
}
