package com.opd_system.api;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sample-only endpoint for the React client. It does not accept or persist patient data.
 */
@RestController
@RequestMapping("/api/demo")
public class DemoController {

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "application", "Smart OPD Connect",
                "mode", "demo",
                "storesPatientData", false,
                "message", "Sample data only. Do not enter real patient information.");
    }
}
