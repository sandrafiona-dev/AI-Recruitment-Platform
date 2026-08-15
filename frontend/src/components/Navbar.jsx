import { Link, useLocation } from "react-router-dom";
import RecruitaWordmark from "./RecruitaWordmark";

function Navbar() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8c8b8]/70 bg-[#fff9f6]/95 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-4 sm:gap-4 sm:px-10 sm:py-5 lg:px-16"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3 text-[11px] sm:gap-7 sm:text-sm font-medium text-[#6f625b] whitespace-nowrap">
          <Link
            to="/"
            className="transition-colors duration-200 hover:text-[#c86445]"
          >
            Home
          </Link>

          <Link
            to="/parse"
            className="transition-colors duration-200 hover:text-[#c86445]"
          >
            Resume Parser
          </Link>

          <Link
            to="/match"
            className="transition-colors duration-200 hover:text-[#c86445]"
          >
            Matching
          </Link>

          <Link
            to="/rank"
            className="transition-colors duration-200 hover:text-[#c86445]"
          >
            Candidate Ranking
          </Link>

          <Link
            to="/dashboard"
            className="transition-colors duration-200 hover:text-[#c86445]"
          >
            Dashboard
          </Link>
        </div>

        {!isHomePage && (
          <Link
            to="/"
            className="transition-opacity duration-200 hover:opacity-80"
            aria-label="Recruita home"
          >
            <RecruitaWordmark className="text-xl sm:text-2xl shrink-0" />
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Navbar;