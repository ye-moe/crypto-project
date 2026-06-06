import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  Star,
  Wallet,
  LogIn,
  LogOut,
  UserPlus,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
      : "flex items-center gap-2 rounded-lg px-4 py-2 text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800";

  const userInitial =
    user?.username?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleLogout() {
    logout();
    setIsDropdownOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Crypto Pulse
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Real-time crypto market dashboard
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" className={navLinkClass}>
              <BarChart3 size={18} />
              Dashboard
            </NavLink>

            <NavLink to="/watchlist" className={navLinkClass}>
              <Star size={18} />
              Watchlist
            </NavLink>

            <NavLink to="/portfolio" className={navLinkClass}>
              <Wallet size={18} />
              Portfolio
            </NavLink>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label="Toggle light/dark mode"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((current) => !current)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold uppercase text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
                  aria-label="Open user menu"
                >
                  {userInitial}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400">
                          <User size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                            {user?.username || "User"}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/10 dark:text-red-400"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  <LogIn size={18} />
                  Login
                </NavLink>

                <NavLink to="/register" className={navLinkClass}>
                  <UserPlus size={18} />
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
