import { Link, NavLink } from "react-router-dom";
import ModeToggle from "./ModeToggle";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white/70 backdrop-blur supports-backdrop-filter:bg-white/50 dark:bg-black/60 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          AI Trading Agent
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-800 ${
                isActive ? "bg-gray-100 dark:bg-gray-800" : ""
              }`
            }
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/performance"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-800 ${
                isActive ? "bg-gray-100 dark:bg-gray-800" : ""
              }`
            }
          >
            Performance
          </NavLink>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}


