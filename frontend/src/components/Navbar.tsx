import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b-2 border-black bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-[95vw] px-2">
        <div className="flex h-10 md:h-14 items-center justify-between font-bold">
          <div className="flex items-center">
            <NavLink to="/" className="tracking-wide text-black hover:opacity-80">
              ALPHA ARENA
            </NavLink>
          </div>

          <div className="hidden items-end space-x-6 md:flex md:absolute md:left-1/2 md:-translate-x-1/2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-mono text-sm transition-colors ${isActive ? 'text-blue-700' : 'text-gray-900 hover:text-blue-600'}`
              }
              end
            >
              LIVE
            </NavLink>
            <span className="text-gray-900">|</span>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `font-mono text-sm transition-colors ${isActive ? 'text-blue-700' : 'text-gray-900 hover:text-blue-600'}`
              }
            >
              LEADERBOARD
            </NavLink>
            <span className="text-gray-900">|</span>
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `font-mono text-sm transition-colors ${isActive ? 'text-blue-700' : 'text-gray-900 hover:text-blue-600'}`
              }
            >
              BLOG
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
