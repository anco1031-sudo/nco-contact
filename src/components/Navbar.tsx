import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Home, Users, CalendarDays, Newspaper, MessageCircle, Shield, BarChart3 } from "lucide-react";

const navLinks = [
  { href: "/", label: "หน้าหลัก", icon: Home },
  { href: "/contacts", label: "เพื่อน", icon: Users },
  { href: "/events", label: "กิจกรรม", icon: CalendarDays },
  { href: "/news", label: "ข่าวสาร", icon: Newspaper },
  { href: "/surveys", label: "โหวต", icon: BarChart3 },
  { href: "/board", label: "สนทนา", icon: MessageCircle },
  { href: "/admin", label: "Admin", icon: Shield },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-[#1e3a5f] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <img src="/logo.jpg" alt="NCO 1333" className="h-10 w-10 rounded-lg object-cover" />
            <span className="hidden sm:inline">NCO 1333 เพื่อนกันจนวันตาย</span>
            <span className="sm:hidden">1333</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#c9a227] text-[#1e3a5f]"
                      : "hover:bg-[#2d5986] text-white/80 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#2d5986] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/20 bg-[#2d5986]">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#c9a227] text-[#1e3a5f]"
                      : "hover:bg-white/10 text-white/80 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
