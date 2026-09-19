package com.opd_system.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class DashboardResponse {
    private long totalAppointments;
    private long chatbotRequests;
    private long followUpsDue;
    private List<Map<String, Object>> departmentWise;
    private List<Map<String, Object>> languageUsage;
}
