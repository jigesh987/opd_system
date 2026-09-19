package com.opd_system.service;

import com.opd_system.ai.SafeDepartmentRoutingPrompt;
import com.opd_system.dto.ChatRequest;
import com.opd_system.dto.ChatResponse;
import com.opd_system.dto.LiveChatRequest;
import com.opd_system.entity.Doctor;
import com.opd_system.repository.DoctorRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ChatbotService {

    @Value("${smart-opd.ai.enabled:false}")
    private boolean aiEnabled;

    private final ObjectProvider<org.springframework.ai.chat.client.ChatClient.Builder> chatClientBuilder;
    private final DoctorRepository doctorRepository;

    public ChatbotService(ObjectProvider<org.springframework.ai.chat.client.ChatClient.Builder> chatClientBuilder,
                          DoctorRepository doctorRepository) {
        this.chatClientBuilder = chatClientBuilder;
        this.doctorRepository = doctorRepository;
    }

    // ── Emergency keywords (always checked before any AI call) ────────────────
    private static final List<String> EMERGENCY_KEYWORDS = List.of(
        "chest pain", "heart attack", "can't breathe", "cannot breathe",
        "difficulty breathing", "breathless", "unconscious", "fainted",
        "heavy bleeding", "severe bleeding", "stroke", "paralysis",
        "sudden weakness", "severe headache", "head injury", "accident",
        "सीने में दर्द", "सांस नहीं", "बेहोश", "अत्यधिक रक्तस्राव",
        "છાતીમાં દુખાવો", "શ્વાસ નથી", "બેભાન", "ભારે રક્તસ્ત્રાવ"
    );

    // ── Rule-based triage (doctor-editable — mirrors frontend triageRules.ts) ──
    private record TriageRule(List<String> keywords, String dept) {}

    private static final List<TriageRule> RULES = List.of(
        new TriageRule(List.of("skin","rash","acne","eczema","itching","allergy","hair loss","nail","त्वचा","खुजली","ત્વચા","ખંજવાળ"), "Dermatology"),
        new TriageRule(List.of("bone","joint","fracture","back pain","knee","shoulder","spine","arthritis","हड्डी","जोड़","हड्डी में दर्द","હાડકું","સાંધો","કમર"), "Orthopedics"),
        new TriageRule(List.of("pregnancy","periods","menstrual","uterus","ovary","vaginal","गर्भावस्था","मासिक","ગર્ભાવસ્થા","માસિક"), "Gynecology"),
        new TriageRule(List.of("child","baby","infant","toddler","newborn","बच्चा","शिशु","બાળક","શિશુ"), "Pediatrics"),
        new TriageRule(List.of("ear","nose","throat","hearing","tonsil","sinus","कान","नाक","गला","કાન","નાક","ગળું"), "ENT"),
        new TriageRule(List.of("eye","vision","blur","cataract","glasses","आंख","दृष्टि","आँख","આંખ","દ્રષ્ટિ"), "Ophthalmology"),
        new TriageRule(List.of("tooth","teeth","gum","dental","cavity","mouth pain","दांत","मसूड़े","દાંત","પેઢા"), "Dentistry"),
        new TriageRule(List.of("fever","cold","cough","diabetes","blood pressure","bp","sugar","fatigue","weakness","headache","stomach","vomit","diarrhea","बुखार","खांसी","ताव","ઉધરસ","ઝાડા"), "General Medicine")
    );

    public ChatResponse suggest(ChatRequest req) {
        String combined = (req.getSymptoms() + " " + req.getAge()).toLowerCase();

        // Emergency check is always deterministic — never delegated to AI
        if (isEmergency(combined)) {
            return new ChatResponse("Emergency",
                "Emergency symptoms detected. Please go to Emergency immediately.",
                true, ChatResponse.DISCLAIMER);
        }

        if (aiEnabled) {
            return suggestWithAI(req);
        }
        return suggestWithRules(combined);
    }

    /** Streams short conversational routing guidance. The response never diagnoses or prescribes. */
    public Flux<String> liveChat(LiveChatRequest request) {
        String input = request.getMessage().toLowerCase();
        if (isEmergency(input)) {
            return Flux.just("🚨 Emergency symptoms may be present. Please go to the Emergency Department immediately or call 108.\n\n" + ChatResponse.DISCLAIMER);
        }

        var builder = chatClientBuilder.getIfAvailable();
        if (!aiEnabled || builder == null) {
            ChatRequest fallback = new ChatRequest();
            fallback.setSymptoms(request.getMessage());
            fallback.setLanguage(request.getLanguage());
            ChatResponse answer = suggest(fallback);
            return Flux.just(answer.getReasoning() + "\n\n" + answer.getDisclaimer());
        }

        String history = request.getHistory() == null ? "" : request.getHistory().stream()
            .filter(message -> message.getContent() != null && !message.getContent().isBlank())
            .limit(8)
            .map(message -> message.getRole() + ": " + message.getContent())
            .reduce("", (left, right) -> left + "\n" + right);

        // Build doctor list context from DB for all departments
        String doctorContext = buildDoctorContext();

        String prompt = """
                Preferred response language: %s
                Conversation so far:%s

                Available doctors at this hospital:
                %s

                Latest patient message: %s

                Instructions:
                - Reply warmly in the preferred language only.
                - Identify the most suitable department based on symptoms.
                - You MUST mention ALL doctors listed under that department above, every single one, no exceptions.
                - Write each doctor's full English name exactly as listed (e.g. Dr. Anil Sharma).
                - Write each doctor's qualification next to their name.
                - Do not pick just one doctor — list every doctor in that department.
                - Do not diagnose, prescribe medication, or state certainty.
                - Always include the disclaimer at the end in the same language.
                """.formatted(request.getLanguage(), history, doctorContext, request.getMessage());
        try {
            return builder.build().prompt()
                .system(SafeDepartmentRoutingPrompt.SYSTEM_PROMPT)
                .user(prompt)
                .stream()
                .content()
                .onErrorResume(error -> {
                    log.warn("Live AI chat failed; using routing fallback: {}", error.getMessage());
                    ChatRequest fallback = new ChatRequest();
                    fallback.setSymptoms(request.getMessage());
                    fallback.setLanguage(request.getLanguage());
                    ChatResponse answer = suggest(fallback);
                    return Flux.just(answer.getReasoning() + "\n\n" + answer.getDisclaimer());
                });
        } catch (Exception error) {
            log.warn("Live AI chat could not start; using routing fallback: {}", error.getMessage());
            ChatRequest fallback = new ChatRequest();
            fallback.setSymptoms(request.getMessage());
            fallback.setLanguage(request.getLanguage());
            ChatResponse answer = suggest(fallback);
            return Flux.just(answer.getReasoning() + "\n\n" + answer.getDisclaimer());
        }
    }

    // ── AI-powered suggestion using SafeDepartmentRoutingPrompt ───────────────
    private ChatResponse suggestWithAI(ChatRequest req) {
        try {
            // Lazy-load ChatClient only when AI is enabled to avoid startup failure
            var chatClient = applicationContext().getBean(
                org.springframework.ai.chat.client.ChatClient.Builder.class).build();

            String userMessage = String.format(
                "Patient symptoms: %s\nDuration: %s\nAge: %s\nLanguage: %s\n\n" +
                "Respond ONLY in this JSON format (no markdown): " +
                "{\"department\":\"<name>\",\"reasoning\":\"<one sentence>\"}",
                req.getSymptoms(), req.getDuration(), req.getAge(), req.getLanguage()
            );

            String raw = chatClient.prompt()
                .system(SafeDepartmentRoutingPrompt.SYSTEM_PROMPT)
                .user(userMessage)
                .call()
                .content();

            String dept   = extractJson(raw, "department");
            String reason = extractJson(raw, "reasoning");
            return new ChatResponse(dept, reason, false, ChatResponse.DISCLAIMER);

        } catch (Exception e) {
            log.warn("AI suggestion failed, falling back to rules: {}", e.getMessage());
            return suggestWithRules((req.getSymptoms() + " " + req.getAge()).toLowerCase());
        }
    }

    // ── Rule-based fallback ───────────────────────────────────────────────────
    private ChatResponse suggestWithRules(String input) {
        for (TriageRule rule : RULES) {
            if (rule.keywords().stream().anyMatch(input::contains)) {
                return new ChatResponse(rule.dept(),
                    "Based on your symptoms, " + rule.dept() + " is the most appropriate department.",
                    false, ChatResponse.DISCLAIMER);
            }
        }
        return new ChatResponse("General Medicine",
            "For general health concerns, please visit General Medicine.",
            false, ChatResponse.DISCLAIMER);
    }

    private String buildDoctorContext() {
        return doctorRepository.findByActiveTrue().stream()
            .collect(Collectors.groupingBy(Doctor::getDepartment))
            .entrySet().stream()
            .map(entry -> {
                String dept = entry.getKey();
                String doctors = entry.getValue().stream()
                    .map(d -> "  - " + d.getName() + " (" + d.getQualification() + ")")
                    .collect(Collectors.joining("\n"));
                return dept + ":\n" + doctors;
            })
            .collect(Collectors.joining("\n"));
    }

    private boolean isEmergency(String text) {
        return EMERGENCY_KEYWORDS.stream().anyMatch(kw -> text.contains(kw.toLowerCase()));
    }

    private String extractJson(String json, String key) {
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search);
        if (start == -1) return "General Medicine";
        start += search.length();
        int end = json.indexOf("\"", start);
        return end == -1 ? "General Medicine" : json.substring(start, end);
    }

    // Spring ApplicationContext accessor — avoids circular dependency
    private org.springframework.context.ApplicationContext ctx;

    @org.springframework.beans.factory.annotation.Autowired
    public void setApplicationContext(org.springframework.context.ApplicationContext ctx) {
        this.ctx = ctx;
    }

    private org.springframework.context.ApplicationContext applicationContext() {
        return ctx;
    }
}
