import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { DEPARTMENTS } from "../data/doctors";

type ChatLang = "English" | "Hindi" | "Gujarati";
type Message = { role: "user" | "assistant"; content: string; bookingInfo?: { dept: string; doctor: string }[] };

const LANG_OPTIONS: { code: ChatLang; native: string }[] = [
  { code: "English",  native: "English" },
  { code: "Hindi",    native: "हिन्दी" },
  { code: "Gujarati", native: "ગુજરાતી" },
];

const WELCOME: Record<ChatLang, string> = {
  English:  "Hello! I'm your OPD assistant. Describe your symptoms and I'll suggest the right doctor and department for you.",
  Hindi:    "नमस्ते! मैं आपका OPD सहायक हूं। अपने लक्षण बताएं, मैं सही डॉक्टर और विभाग सुझाऊंगा।",
  Gujarati: "નમસ્તે! હું તમારો OPD સહાયક છું. તમારા લક્ષણો જણાવો, હું યોગ્ય ડૉક્ટર અને વિભાગ સૂચવીશ.",
};

const PLACEHOLDER: Record<ChatLang, string> = {
  English:  "Describe your symptoms...",
  Hindi:    "अपने लक्षण बताएं...",
  Gujarati: "તમારા લક્ષણો જણાવો...",
};

const SEND_LABEL: Record<ChatLang, string> = {
  English: "Send", Hindi: "भेजें", Gujarati: "મોકલો",
};

const BOOK_LABEL: Record<ChatLang, string> = {
  English:  "📅 Book Appointment",
  Hindi:    "📅 अपॉइंटमेंट बुक करें",
  Gujarati: "📅 એપોઇન્ટમેન્ટ બુક કરો",
};

const RESTART_LABEL: Record<ChatLang, string> = {
  English: "Start Over", Hindi: "फिर से शुरू करें", Gujarati: "ફરીથી શરૂ કરો",
};

// Map department display names → dept key
const DEPT_NAME_MAP: Record<string, string> = {
  "general medicine": "dept_general",
  "dermatology": "dept_derma",
  "orthopedics": "dept_ortho",
  "gynecology": "dept_gynec",
  "pediatrics": "dept_pedia",
  "ent": "dept_ent",
  "ophthalmology": "dept_ophthal",
  "dentistry": "dept_dental",
  "emergency": "dept_emergency",
};

export default function ChatBot() {
  const { t, setPreselectedDept, setPreselectedDoctor } = useApp();
  const navigate = useNavigate();
  const [chatLang, setChatLang] = useState<ChatLang | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  function detectBookingInfo(text: string): { dept: string; doctor: string }[] | undefined {
    const lower = text.toLowerCase();
    // detect department from AI reply text
    const matchedDeptKey = Object.entries(DEPT_NAME_MAP).find(([name]) => lower.includes(name))?.[1];
    if (!matchedDeptKey) return undefined;
    // return ALL doctors for that department from local data
    const doctors = DEPARTMENTS.find((d) => d.key === matchedDeptKey)?.doctors ?? [];
    return doctors.length > 0 ? doctors.map((doc) => ({ dept: matchedDeptKey, doctor: doc.name })) : undefined;
  }

  function handleBook(dept: string, doctor: string) {
    setPreselectedDept(dept as any);
    setPreselectedDoctor(doctor);
    navigate("/book");
  }

  function selectLang(lang: ChatLang) {
    setChatLang(lang);
    setMessages([]);
    setInput("");
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const history = messages.slice(-8);
    setMessages((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/chatbot/live", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ message: text, language: chatLang, history }),
      });
      if (!response.ok || !response.body) throw new Error("unavailable");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          const data = event.split("\n").find((l) => l.startsWith("data:"));
          if (!data) continue;
          const chunk = data.slice(5).trimStart();
          if (chunk === "[DONE]") continue;
          setMessages((prev) => prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: m.content + chunk } : m
          ));
        }
      }
    } catch {
      setMessages((prev) => prev.map((m, i) =>
        i === prev.length - 1 ? { ...m, content: t("liveChatUnavailable") } : m
      ));
    } finally {
      setSending(false);
      setMessages((prev) => prev.map((m, i) => {
        if (i !== prev.length - 1 || m.role !== "assistant") return m;
        const info = detectBookingInfo(m.content);
        return info ? { ...m, bookingInfo: info } : m;
      }));
    }
  }

  function renderMessage(m: Message, i: number) {
    return (
      <div key={i}>
        <div className={`chat-bubble ${m.role}`}>
          {m.content || (sending && i === messages.length - 1 ? "..." : "")}
        </div>
        {m.role === "assistant" && m.bookingInfo && (
          <div className="chat-book-btns">
            {m.bookingInfo.map((info) => (
              <button
                key={info.doctor}
                className="btn btn-primary chat-book-btn"
                onClick={() => handleBook(info.dept, info.doctor)}
              >
                {BOOK_LABEL[chatLang!]} — {info.doctor}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!chatLang) {
    return (
      <div className="page">
        <h2 className="page-title">{t("findDoctor")}</h2>
        <div className="disclaimer-box">{t("chatbotDisclaimer")}</div>
        <div className="chatbot-lang-select">
          <p className="chatbot-lang-title">🌐 Select your preferred language to continue</p>
          <p className="chatbot-lang-sub">भाषा चुनें / ભાષા પસંદ કરો</p>
          <div className="chatbot-lang-btns">
            {LANG_OPTIONS.map((l) => (
              <button key={l.code} className="chatbot-lang-btn" onClick={() => selectLang(l.code)}>
                {l.native}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="chatbot-page-header">
        <h2 className="page-title" style={{ marginBottom: 0 }}>{t("findDoctor")}</h2>
        <button className="btn-outline-muted" onClick={() => setChatLang(null)}>
          🌐 {chatLang} ▾
        </button>
      </div>
      <div className="disclaimer-box">{t("chatbotDisclaimer")}</div>

      <div className="chatbot-fullpage">
        <div className="chatbot-messages">
          <div className="chat-bubble assistant">{WELCOME[chatLang]}</div>
          {messages.map((m, i) => renderMessage(m, i))}
          <div ref={messagesEnd} />
        </div>
        <div className="chatbot-compose">
          <button className="btn-outline-muted" onClick={() => { setMessages([]); setInput(""); }}>
            {RESTART_LABEL[chatLang]}
          </button>
          <input
            className="form-input"
            value={input}
            placeholder={PLACEHOLDER[chatLang]}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={sending}
            autoFocus
          />
          <button className="btn btn-primary" onClick={send} disabled={sending}>
            {SEND_LABEL[chatLang]}
          </button>
        </div>
      </div>
    </div>
  );
}
