import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import RequestPage from "./pages/RequestPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#1e293b]">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <footer className="border-t border-[#cbd5e1] bg-primary text-white py-4 text-center text-sm">
        <p>NCO Contact Directory &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
