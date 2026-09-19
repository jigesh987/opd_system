import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Header from "./components/Header";
import RequireRole from "./components/RequireRole";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import BookAppointment from "./pages/BookAppointment";
import ChatBot from "./pages/ChatBot";
import FollowUp from "./pages/FollowUp";
import Dashboard from "./pages/Dashboard";
import PatientDashboard from "./pages/PatientDashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import LiveChatWidget from "./components/LiveChatWidget";
import "./App.css";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/book" element={<RequireRole role="PATIENT"><BookAppointment /></RequireRole>} />
            <Route path="/chatbot" element={<ChatBot />} />
            <Route path="/followup" element={<FollowUp />} />
            <Route path="/my-appointments" element={<RequireRole role="PATIENT"><PatientDashboard /></RequireRole>} />
            <Route path="/dashboard" element={<RequireRole role="ADMIN"><Dashboard /></RequireRole>} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<RequireRole role="PATIENT"><Profile /></RequireRole>} />
          </Routes>
        </main>
        <LiveChatWidget />
      </BrowserRouter>
    </AppProvider>
  );
}
