import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { DEPARTMENTS } from "../data/doctors";

type Message = { role: "user" | "assistant"; content: string; bookingInfo?: { dept: string; doctor: string }[] };
type ChatLang = "English" | "Hindi" | "Gujarati";

const LANG_OPTIONS: { code: ChatLang; label: string; native: string }[] = [
  { code: "English",  label: "English",  native: "English" },
  { code: "Hindi",    label: "Hindi",    native: "हिन्दी" },
  { code: "Gujarati", label: "Gujarati", native: "ગુજરાતી" },
];

const WELCOME: Record<ChatLang, string> = {
  English:  "Hello! Describe your symptoms and I'll suggest the right OPD department.",
  Hindi:    "नमस्ते! अपने लक्षण बताएं, मैं सही OPD विभाग सुझाऊंगा।",
  Gujarati: "નમસ્તે! તમારા લક્ષણો જણાવો, હું યોગ્ય OPD વિભાગ સૂચવીશ.",
};

const PLACEHOLDER: Record<ChatLang, string> = {
  English:  "Type your symptoms...",
  Hindi:    "अपने लक्षण लिखें...",
  Gujarati: "તમારા લક્ષણો લખો...",
};

const SEND_LABEL: Record<ChatLang, string> = {
  English:  "Send",
  Hindi:    "भेजें",
  Gujarati: "મોકલો",
};

const RESTART_LABEL: Record<ChatLang, string> = {
  English:  "🔄 Start Over",
  Hindi:    "🔄 फिर से शुरू करें",
  Gujarati: "🔄 ફરીથી શરૂ કરો",
};

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

export default function LiveChatWidget() {
  const { t, setPreselectedDept, setPreselectedDoctor } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [chatLang, setChatLang] = useState<ChatLang | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEnd = useRef<HTMLDivElement>(null);

function detectBookingInfo(text: string): { dept: string; doctor: string }[] | undefined {
    const lower = text.toLowerCase();
    const matchedDeptKey = Object.entries(DEPT_NAME_MAP).find(([name]) => lower.includes(name))?.[1];
    if (!matchedDeptKey) return undefined;
    const doctors = DEPARTMENTS.find((d) => d.key === matchedDeptKey)?.doctors ?? [];
    return doctors.length > 0 ? doctors.map((doc) => ({ dept: matchedDeptKey, doctor: doc.name })) : undefined;
  }

  function handleBook(dept: string, doctor: string) {
    setPreselectedDept(dept as any);
    setPreselectedDoctor(doctor);
    setOpen(false);
    navigate("/book");
  }

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  function handleOpen() {
    setOpen(true);
    setChatLang(null);
    setMessages([]);
    setInput("");
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const history = messages.slice(-8);
    setMessages((items) => [...items, { role: "user", content: text }, { role: "assistant", content: "" }]);
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
          const data = event.split("\n").find((line) => line.startsWith("data:"));
          if (!data) continue;
          const chunk = data.slice(5).trimStart();
          if (chunk === "[DONE]") continue;
          setMessages((items) => items.map((item, index) =>
            index === items.length - 1 ? { ...item, content: item.content + chunk } : item
          ));
        }
      }
    } catch {
      setMessages((items) => items.map((item, index) =>
        index === items.length - 1 ? { ...item, content: t("liveChatUnavailable") } : item
      ));
    } finally {
      setSending(false);
      setMessages((items) => items.map((item, index) => {
        if (index !== items.length - 1 || item.role !== "assistant") return item;
        const info = detectBookingInfo(item.content);
        return info ? { ...item, bookingInfo: info } : item;
      }));
    }
  }

  function renderMessage(message: Message, index: number) {
    return (
      <div key={index}>
        <p className={`live-message ${message.role}`}>
          {message.content || (sending && index === messages.length - 1 ? "..." : "")}
        </p>
        {message.role === "assistant" && message.bookingInfo && (
          <div className="chat-book-btns">
            {message.bookingInfo.map((info) => (
              <button
                key={info.doctor}
                className="btn btn-primary live-book-btn"
                onClick={() => handleBook(info.dept, info.doctor)}
              >
                📅 Book Appointment with {info.doctor}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="live-chat" aria-live="polite">
      {open && (
        <div className="live-chat-panel" role="dialog" aria-label={t("chatWithUs")}>
          <header className="live-chat-header">
            <div><strong>🏥 {t("appName")}</strong><span>{t("chatbotDisclaimer")}</span></div>
            <button onClick={() => setOpen(false)} aria-label={t("liveChatClose")}>×</button>
          </header>

          {!chatLang ? (
            <div className="live-chat-lang-select">
              <p>🌐 Please select your language</p>
              <p>भाषा चुनें / ભાષા પસંદ કરો</p>
              <div className="live-chat-lang-btns">
                {LANG_OPTIONS.map((l) => (
                  <button key={l.code} className="live-lang-option" onClick={() => setChatLang(l.code)}>
                    <span>{l.native}</span>
                    <small>{l.label}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="live-chat-messages">
                <p className="live-message assistant">{WELCOME[chatLang]}</p>
                {messages.map((message, index) => renderMessage(message, index))}
                <div ref={messagesEnd} />
              </div>
              <div className="live-chat-compose">
                <label className="sr-only" htmlFor="live-chat-input">{PLACEHOLDER[chatLang]}</label>
                <input
                  id="live-chat-input"
                  value={input}
                  placeholder={PLACEHOLDER[chatLang]}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  disabled={sending}
                />
                <button className="btn btn-primary" onClick={send} disabled={sending}>{SEND_LABEL[chatLang]}</button>
              </div>
              <div className="live-chat-restart">
                <button className="live-restart-btn" onClick={() => { setMessages([]); setInput(""); }} disabled={sending}>
                  {RESTART_LABEL[chatLang]}
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <button className="live-chat-launcher" onClick={handleOpen} aria-expanded={open}>
        💬 {t("chatWithUs")}
      </button>
    </section>
  );
}
