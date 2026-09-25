package com.opd_system.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class DashboardResponse {
    private long totalDoctors;
    private long totalAppointments;
    private long todayAppointments;
    private long totalPatients;
    private long followUpsDue;
    private long chatbotRequests;
    private List<Map<String, Object>> departmentWise;
    private List<Map<String, Object>> languageUsage;

    public long getTotalDoctors() { return totalDoctors; }
    public void setTotalDoctors(long totalDoctors) { this.totalDoctors = totalDoctors; }

    public long getTotalAppointments() { return totalAppointments; }
    public void setTotalAppointments(long totalAppointments) { this.totalAppointments = totalAppointments; }

    public long getTodayAppointments() { return todayAppointments; }
    public void setTodayAppointments(long todayAppointments) { this.todayAppointments = todayAppointments; }

    public long getTotalPatients() { return totalPatients; }
    public void setTotalPatients(long totalPatients) { this.totalPatients = totalPatients; }

    public long getFollowUpsDue() { return followUpsDue; }
    public void setFollowUpsDue(long followUpsDue) { this.followUpsDue = followUpsDue; }

    public long getChatbotRequests() { return chatbotRequests; }
    public void setChatbotRequests(long chatbotRequests) { this.chatbotRequests = chatbotRequests; }

    public List<Map<String, Object>> getDepartmentWise() { return departmentWise; }
    public void setDepartmentWise(List<Map<String, Object>> departmentWise) { this.departmentWise = departmentWise; }

    public List<Map<String, Object>> getLanguageUsage() { return languageUsage; }
    public void setLanguageUsage(List<Map<String, Object>> languageUsage) { this.languageUsage = languageUsage; }
}
