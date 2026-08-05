import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16"
        aria-label="Main navigation"
      >
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
            AI
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            AI Recruitment Platform
          </span>
        </Link>

        <div className="text-sm font-medium text-slate-600">
          <Link to="/" className="transition hover:text-indigo-600">
            Home
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
