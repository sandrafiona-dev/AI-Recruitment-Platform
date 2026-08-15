import { Link } from "react-router-dom";
import RecruitaWordmark from "./RecruitaWordmark";

function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-81px)] overflow-hidden bg-[#fce8dc]">
      {/* Soft decorative shapes */}
      <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-[#f4c7b2]/50 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-[#efb79f]/40 blur-3xl" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff4ee]/40 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-81px)] max-w-5xl items-center justify-center px-6 py-20 text-center sm:px-10">
        <div className="max-w-3xl">

          {/* Small introduction */}
          <p className="mb-7 text-sm font-medium uppercase tracking-[0.22em] text-[#b96a50]">
            A better way to understand candidates
          </p>

          {/* Main brand */}
          <div className="text-6xl sm:text-7xl md:text-8xl">
            <RecruitaWordmark className="text-inherit" />
          </div>

          {/* Tagline */}
          <h2 className="mt-6 text-2xl font-medium leading-tight text-[#493d36] sm:text-3xl">
            Smarter recruitment.
            <br />
            <span className="text-[#c86445]">
              More human decisions.
            </span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[#766961] sm:text-lg">
            Understand candidates through their skills, experience, and
            potential — not just keywords.
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/match"
              className="rounded-full bg-[#d97757] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#d97757]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c96749] hover:shadow-xl"
            >
              Get Started
            </Link>

            <Link
              to="/parse"
              className="rounded-full border border-[#dfbdae] bg-[#fff9f6]/80 px-7 py-3.5 text-sm font-semibold text-[#594b43] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d9a18b] hover:bg-[#fff9f6]"
            >
              Explore Resume Parser
            </Link>
          </div>

          {/* Small trust statement */}
          <p className="mt-10 text-xs tracking-wide text-[#9a8980]">
            Resume analysis · Skill matching · Candidate insights
          </p>

        </div>
      </div>
    </section>
  );
}

export default Hero;