import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function DashboardPage() {
  const [sessions, setSessions] = useState([]);
  const [overview, setOverview] = useState({
    candidates: 0,
    jobs: 0,
    strongMatches: 0,
  });
  const [topCandidates, setTopCandidates] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recruitaSessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSessions(parsed);

        let cCount = 0;
        let smCount = 0;
        let allCands = [];

        parsed.forEach(session => {
          cCount += session.candidateCount || 0;
          smCount += session.strongMatches || 0;
          if (session.topCandidates) {
            session.topCandidates.forEach(cand => {
              allCands.push({
                ...cand,
                jobTitle: session.jobTitle,
                date: session.date
              });
            });
          }
        });

        setOverview({
          candidates: cCount,
          jobs: parsed.length,
          strongMatches: smCount,
        });

        // Sort all candidates from all sessions by score descending and take top 5
        const sortedCands = allCands.sort((a, b) => b.score - a.score).slice(0, 5);
        setTopCandidates(sortedCands);
      }
    } catch (e) {
      // Silent catch for localStorage issues in production
    }
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:py-16">
        <section className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#b96a50]">
            Workspace
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#29231f] sm:text-5xl">
            Recruiter Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#766961] sm:text-lg">
            Review your recent candidate analyses, active jobs, and top performers.
          </p>
        </section>

        {sessions.length === 0 ? (
          <section className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-12 text-center shadow-[0_12px_35px_rgba(95,65,50,0.03)]">
            <h3 className="text-xl font-semibold text-[#332923] mb-4">No candidates analyzed yet</h3>
            <p className="text-sm text-[#897971] mb-8">
              Start by parsing a resume or running a candidate ranking batch.
            </p>
            <Link
              to="/rank"
              className="rounded-full bg-[#d97757] px-8 py-3.5 font-semibold text-white shadow-md shadow-[#d97757]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c96749] hover:shadow-lg"
            >
              Start Candidate Ranking
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview Metrics */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-[#ead8ce] bg-[#fffdfb] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#907e74]">
                    Active Jobs
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[#29231f]">
                    {overview.jobs}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#ead8ce] bg-[#fffdfb] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#907e74]">
                    Candidates Analyzed
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[#29231f]">
                    {overview.candidates}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#ead8ce] bg-[#fffdfb] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#907e74]">
                    Strong Matches
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[#d97757]">
                    {overview.strongMatches}
                  </p>
                </div>
              </section>

              {/* Recent Jobs */}
              <section className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 sm:p-8 shadow-[0_12px_35px_rgba(95,65,50,0.03)]">
                <h3 className="mb-6 text-lg font-semibold text-[#332923]">
                  Recent Jobs
                </h3>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-[#e8d5cc] bg-[#fff8f3] p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                      <div>
                        <h4 className="text-base font-semibold text-[#493d36] break-words">{session.jobTitle}</h4>
                        <p className="mt-1 text-sm text-[#82736b]">
                          {session.candidateCount} candidates analyzed
                        </p>
                      </div>
                      <div className="mt-3 sm:mt-0 text-left sm:text-right">
                        <span className="block text-xs font-medium text-[#9a8980]">Analyzed</span>
                        <span className="text-sm text-[#665850]">{formatDate(session.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              {/* Top Candidates Across All Jobs */}
              <section className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 sm:p-8 shadow-[0_12px_35px_rgba(95,65,50,0.03)]">
                <h3 className="mb-6 text-lg font-semibold text-[#332923]">
                  Top Candidates
                </h3>
                {topCandidates.length > 0 ? (
                  <ul className="space-y-5">
                    {topCandidates.map((cand, idx) => (
                      <li key={idx} className="border-b border-[#f4dfd5] pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-[#493d36] break-words">{cand.name}</p>
                            <p className="text-xs text-[#82736b] mt-1 break-words line-clamp-1">{cand.jobTitle}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-[#f3dfd5] px-2.5 py-1 text-xs font-bold text-[#a6573e]">
                            {cand.score}%
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#897971]">No top candidates found.</p>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default DashboardPage;
