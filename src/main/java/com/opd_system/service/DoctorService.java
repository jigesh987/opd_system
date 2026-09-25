package com.opd_system.service;

import com.opd_system.dto.DoctorRequest;
import com.opd_system.entity.Doctor;
import com.opd_system.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository repo;

    private static final String DEFAULT_SLOTS = "09:00 AM,09:30 AM,10:00 AM,10:30 AM,11:00 AM,02:00 PM,02:30 PM,03:00 PM";

    public List<Doctor> getAll() {
        return repo.findByIsActiveTrue();
    }

    public List<Doctor> getByDepartment(String department) {
        return repo.findByDepartmentAndIsActiveTrue(department);
    }

    public List<Doctor> getAllForAdmin() {
        return repo.findAll();
    }

    public Doctor createDoctor(DoctorRequest req) {
        Doctor doc = new Doctor();
        populateDoctorFields(doc, req);
        doc.setActive(req.getActive() != null ? req.getActive() : true);
        return repo.save(doc);
    }

    public Doctor updateDoctor(Long id, DoctorRequest req) {
        Doctor doc = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        populateDoctorFields(doc, req);
        if (req.getActive() != null) {
            doc.setActive(req.getActive());
        }
        return repo.save(doc);
    }

    public Doctor toggleDoctorStatus(Long id, Boolean active) {
        Doctor doc = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        if (active != null) {
            doc.setActive(active);
        } else {
            doc.setActive(!doc.isActive());
        }
        return repo.save(doc);
    }

    private void populateDoctorFields(Doctor doc, DoctorRequest req) {
        doc.setName(req.getName());
        doc.setDepartment(req.getDepartment());
        doc.setQualification(req.getQualification());
        doc.setSpecialization(req.getSpecialization());
        doc.setExperience(req.getExperience());
        doc.setCabinNo(req.getCabinNo());
        doc.setOpdDays(req.getOpdDays());
        doc.setAvailableSlots(req.getAvailableSlots() != null && !req.getAvailableSlots().isBlank()
                ? req.getAvailableSlots() : DEFAULT_SLOTS);
    }
}
