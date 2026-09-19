# Smart OPD Connect

Demo OPD appointment prototype. **Do not enter or store real patient data.**

---

## Quick Start

### Frontend (React + TypeScript)

```powershell
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → frontend/dist/
```

### Backend (Spring Boot + MySQL)

1. Create a MySQL database (auto-created if user has privileges):
   ```sql
   CREATE DATABASE IF NOT EXISTS smart_opd;
   ```

2. Set environment variables (or edit `src/main/resources/application.properties`):
   ```powershell
   $env:DB_USERNAME = "your_mysql_username"
   $env:DB_PASSWORD = "your_mysql_password"
   ```

3. Run:
   ```powershell
   ./mvnw spring-boot:run
   # API available at http://localhost:8080
   ```

Demo credentials seeded automatically:
- Admin: `admin` / `admin123`
- Patient: `patient1` / `patient123`

---

## Where to modify things

| What | File |
|---|---|
| Departments & doctors | `frontend/src/data/doctors.ts` |
| Chatbot triage rules | `frontend/src/data/triageRules.ts` — **review with clinicians before real use** |
| Demo appointments & follow-ups | `frontend/src/data/sampleData.ts` |
| English translations | `frontend/src/i18n/en.ts` |
| Hindi translations | `frontend/src/i18n/hi.ts` |
| Gujarati translations | `frontend/src/i18n/gu.ts` |
| Spring Security policy | `src/main/java/com/opd_system/config/SecurityConfig.java` |
| AI safety prompt | `src/main/java/com/opd_system/ai/SafeDepartmentRoutingPrompt.java` |
| Backend triage rules | `src/main/java/com/opd_system/service/ChatbotService.java` |
| Database seed data | `src/main/java/com/opd_system/config/DataSeeder.java` |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login → JWT token |
| POST | `/api/auth/register` | Public | Register patient |
| POST | `/api/appointments` | Public | Book appointment |
| GET | `/api/appointments` | Admin | List all appointments |
| GET | `/api/appointments/lookup?mobile=` | Public | Lookup by mobile |
| GET | `/api/appointments/{id}` | Auth | Get by ID |
| POST | `/api/chatbot/suggest` | Public | Department suggestion |
| GET | `/api/followups/lookup?query=` | Public | Lookup follow-ups |
| POST | `/api/followups/{id}/remind` | Auth | Mark reminder sent |
| GET | `/api/dashboard` | Admin | Dashboard stats |
| GET | `/api/doctors` | Public | All doctors |
| GET | `/api/doctors/by-department?department=` | Public | Doctors by dept |

---

## Enabling Spring AI (OpenAI)

The AI chatbot is **disabled by default** and falls back to rule-based routing.

To enable:
```powershell
$env:OPENAI_API_KEY  = "sk-..."   # Keep server-side only — never in frontend
$env:SMART_OPD_AI_ENABLED = "true"
```

The AI prompt in `SafeDepartmentRoutingPrompt.java` enforces:
- No diagnosis, no prescriptions, no medical certainty
- Emergency keywords always trigger deterministic redirect before any AI call
- Always shows the disclaimer

The floating **Chat with us** widget appears on every page. It calls `POST /api/chatbot/live` and streams the reply into the popup as it is generated. If AI is disabled or unavailable, it returns safe rule-based department guidance instead of hanging.

---

## Configuration

All sensitive values use environment variables with safe defaults for local dev:

| Env Variable | Purpose | Default |
|---|---|---|
| `DB_USERNAME` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | *(empty)* |
| `JWT_SECRET` | JWT signing key | Built-in dev key |
| `OPENAI_API_KEY` | OpenAI key | *(disabled)* |
| `SMART_OPD_AI_ENABLED` | Enable AI chatbot | `false` |
