import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ContactsPage from "./pages/ContactsPage";
import EventsPage from "./pages/EventsPage";
import NewsPage from "./pages/NewsPage";
import BoardPage from "./pages/BoardPage";
import SurveysPage from "./pages/SurveysPage";
import AdminPage from "./pages/AdminPage";
import RequestPage from "./pages/RequestPage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#1e293b]">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/surveys" element={<SurveysPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <footer className="border-t border-[#e2e8f0] bg-[#1e3a5f] text-white py-6 text-center text-sm">
        <p className="font-medium">NCO 1333 เพื่อนกันจนวันตาย &copy; {new Date().getFullYear()}</p>
        <p className="text-white/50 text-xs mt-1">นักเรียนนายสิบรุ่นที่ 1333</p>
      </footer>
    </div>
  );
}
