import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SESSIONS_STORAGE_KEY =
  "recruitaSessions";

const JOBS_STORAGE_KEY =
  "recruita_jobs";

const EVALUATED_CANDIDATES_STORAGE_KEY =
  "recruita_evaluated_candidates";

const SHORTLIST_STORAGE_KEY =
  "recruita_shortlisted_candidates";

const getSalaryData = (candidate) => {
  const salary =
    candidate?.prediction_outputs?.salary ||
    candidate?.salary_prediction ||
    candidate?.salary ||
    null;

  if (!salary || typeof salary !== "object") {
    return {
      available: false,
      value: null,
      min: null,
      max: null,
    };
  }

  const value = Number(
    salary.predicted_salary ??
    salary.salary ??
    salary.predictedSalary ??
    salary.estimated_salary ??
    salary.annual_salary ??
    salary.amount
  );

  const min = Number(
    salary.min_salary ??
    salary.minimum_salary ??
    salary.salary_min ??
    salary.minSalary ??
    salary.lower_bound
  );

  const max = Number(
    salary.max_salary ??
    salary.maximum_salary ??
    salary.salary_max ??
    salary.maxSalary ??
    salary.upper_bound
  );

  return {
    available:
      Number.isFinite(value) ||
      Number.isFinite(min) ||
      Number.isFinite(max),

    value: Number.isFinite(value)
      ? value
      : null,

    min: Number.isFinite(min)
      ? min
      : null,

    max: Number.isFinite(max)
      ? max
      : null,
  };
};

const formatSalary = (value) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return `₹${Number(value).toLocaleString(
    "en-IN"
  )}`;
};

const getCandidateName = (candidate) =>
  candidate?.candidateName ||
  candidate?.name ||
  "Unknown Candidate";

const getMatchScore = (candidate) =>
  Number(
    candidate?.match_score ||
    candidate?.matchScore ||
    0
  );

const getPredictionScore = (candidate) => {
  const score = Number(
    candidate?.prediction_score
  );

  return Number.isFinite(score)
    ? score
    : null;
};

function DashboardPage() {
  const [sessions, setSessions] =
    useState([]);

  const [jobs, setJobs] =
    useState([]);

  const [evaluatedCandidates, setEvaluatedCandidates] =
    useState([]);

  const [statuses, setStatuses] =
    useState([]);

  const [loaded, setLoaded] =
    useState(false);

  const loadDashboardData = () => {
    try {
      const storedSessions =
        JSON.parse(
          localStorage.getItem(
            SESSIONS_STORAGE_KEY
          ) || "[]"
        );

      const storedJobs =
        JSON.parse(
          localStorage.getItem(
            JOBS_STORAGE_KEY
          ) || "[]"
        );

      const storedCandidates =
        JSON.parse(
          localStorage.getItem(
            EVALUATED_CANDIDATES_STORAGE_KEY
          ) || "[]"
        );

      const storedStatuses =
        JSON.parse(
          localStorage.getItem(
            SHORTLIST_STORAGE_KEY
          ) || "[]"
        );

      setSessions(
        Array.isArray(storedSessions)
          ? storedSessions
          : []
      );

      setJobs(
        Array.isArray(storedJobs)
          ? storedJobs
          : []
      );

      setEvaluatedCandidates(
        Array.isArray(storedCandidates)
          ? storedCandidates
          : []
      );

      setStatuses(
        Array.isArray(storedStatuses)
          ? storedStatuses
          : []
      );

      setLoaded(true);
    } catch (error) {
      console.error(
        "Unable to load dashboard data:",
        error
      );

      setSessions([]);
      setJobs([]);
      setEvaluatedCandidates([]);
      setStatuses([]);
      setLoaded(true);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleStorageChange = () => {
      loadDashboardData();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /*
   * Build the latest status map from the
   * job-specific candidate status records.
   */
  const statusMap = useMemo(() => {
    return new Map(
      statuses.map((item) => [
        item.key,
        item.status,
      ])
    );
  }, [statuses]);

  const candidates = useMemo(() => {
    return evaluatedCandidates.map(
      (candidate) => ({
        ...candidate,

        status:
          statusMap.get(candidate.key) ||
          candidate.status ||
          "New",
      })
    );
  }, [
    evaluatedCandidates,
    statusMap,
  ]);

  const analytics = useMemo(() => {
    const totalCandidates =
      candidates.length;

    const shortlisted =
      candidates.filter(
        (candidate) =>
          candidate.status ===
          "Shortlisted"
      ).length;

    const rejected =
      candidates.filter(
        (candidate) =>
          candidate.status ===
          "Rejected"
      ).length;

    const newCandidates =
      candidates.filter(
        (candidate) =>
          !candidate.status ||
          candidate.status === "New"
      ).length;

    const evaluated =
      candidates.length;

    const matchScores =
      candidates
        .map(getMatchScore)
        .filter((score) =>
          Number.isFinite(score)
        );

    const predictionScores =
      candidates
        .map(getPredictionScore)
        .filter(
          (score) => score !== null
        );

    const salaryPredictions =
      candidates.filter(
        (candidate) =>
          getSalaryData(candidate)
            .available
      ).length;

    const averageMatch =
      matchScores.length > 0
        ? matchScores.reduce(
          (sum, score) =>
            sum + score,
          0
        ) / matchScores.length
        : 0;

    const averagePrediction =
      predictionScores.length > 0
        ? predictionScores.reduce(
          (sum, score) =>
            sum + score,
          0
        ) /
        predictionScores.length
        : 0;

    const shortlistRate =
      totalCandidates > 0
        ? (shortlisted /
          totalCandidates) *
        100
        : 0;

    const salaryCoverage =
      totalCandidates > 0
        ? (salaryPredictions /
          totalCandidates) *
        100
        : 0;

    return {
      totalJobs:
        jobs.length > 0
          ? jobs.length
          : sessions.length,

      totalCandidates,

      evaluated,

      shortlisted,

      rejected,

      newCandidates,

      averageMatch,

      averagePrediction,

      shortlistRate,

      salaryPredictions,

      salaryCoverage,
    };
  }, [
    candidates,
    jobs,
    sessions,
  ]);

  const topCandidates = useMemo(() => {
    return [...candidates]
      .sort(
        (a, b) =>
          getMatchScore(b) -
          getMatchScore(a)
      )
      .slice(0, 5);
  }, [candidates]);

  const recentJobs = useMemo(() => {
    if (jobs.length > 0) {
      return jobs.slice(0, 6);
    }

    return sessions.slice(0, 6);
  }, [jobs, sessions]);

  const formatDate = (isoString) => {
    if (!isoString) {
      return "—";
    }

    const date =
      new Date(isoString);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const getJobTitle = (job) =>
    job?.title ||
    job?.jobTitle ||
    "Untitled Role";

  const getJobCandidates = (job) => {
    const jobId =
      job?.id;

    const jobTitle =
      getJobTitle(job);

    return candidates.filter(
      (candidate) =>
        (jobId &&
          candidate.jobId ===
          jobId) ||
        candidate.jobTitle ===
        jobTitle
    ).length;
  };

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:py-16">

        {/* HEADER */}
        <section className="mb-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#b96a50]">
                Recruiter Analytics
              </p>

              <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#29231f] sm:text-5xl">
                Recruiter Dashboard
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-[#766961] sm:text-lg">
                Monitor jobs, candidate evaluations,
                matching performance, recruitment
                decisions, and AI predictions in one
                workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDashboardData}
              className="rounded-full border border-[#dfc9bd] bg-[#fffdfb] px-5 py-3 text-sm font-semibold text-[#6f625b] transition hover:bg-[#fff3ee]"
            >
              Refresh Analytics
            </button>
          </div>
        </section>

        {/* PRIMARY METRICS */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.04)]">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#907e74]">
              Total Jobs
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#29231f]">
              {analytics.totalJobs}
            </p>

            <p className="mt-2 text-xs text-[#897971]">
              Recruiter job postings
            </p>
          </div>

          <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.04)]">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#907e74]">
              Candidates
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#d97757]">
              {analytics.totalCandidates}
            </p>

            <p className="mt-2 text-xs text-[#897971]">
              AI evaluated candidates
            </p>
          </div>

          <div className="rounded-3xl border border-[#d9e4d3] bg-[#f8fbf5] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#718266]">
              Shortlisted
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#58734c]">
              {analytics.shortlisted}
            </p>

            <p className="mt-2 text-xs text-[#718266]">
              {analytics.shortlistRate.toFixed(
                1
              )}
              % shortlist rate
            </p>
          </div>

          <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#907e74]">
              Rejected
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#a34f37]">
              {analytics.rejected}
            </p>

            <p className="mt-2 text-xs text-[#897971]">
              Recruitment decisions
            </p>
          </div>
        </section>

        {/* ANALYTICS */}
        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6">
            <p className="text-sm text-[#897971]">
              Average Match Score
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#d97757]">
              {analytics.averageMatch.toFixed(
                1
              )}
              %
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f1dfd6]">
              <div
                className="h-full rounded-full bg-[#d97757]"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      analytics.averageMatch
                    )
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6">
            <p className="text-sm text-[#897971]">
              Average Prediction
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#8f5a45]">
              {analytics.averagePrediction.toFixed(
                1
              )}
              %
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f1dfd6]">
              <div
                className="h-full rounded-full bg-[#8f5a45]"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      analytics.averagePrediction
                    )
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6">
            <p className="text-sm text-[#897971]">
              New Candidates
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#8b6b56]">
              {analytics.newCandidates}
            </p>

            <p className="mt-3 text-xs text-[#897971]">
              Awaiting recruiter decision
            </p>
          </div>

          <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6">
            <p className="text-sm text-[#897971]">
              Salary Prediction Coverage
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#8f5a45]">
              {analytics.salaryCoverage.toFixed(
                1
              )}
              %
            </p>

            <p className="mt-3 text-xs text-[#897971]">
              {analytics.salaryPredictions} candidate
              {analytics.salaryPredictions ===
                1
                ? ""
                : "s"} with salary estimates
            </p>
          </div>
        </section>

        {!loaded ? null : (
          <>
            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

              {/* RECENT JOBS */}
              <section className="lg:col-span-2 rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.03)] sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#b96a50]">
                      Recruitment Activity
                    </p>

                    <h2 className="mt-1 text-xl font-semibold text-[#332923]">
                      Recent Jobs
                    </h2>
                  </div>

                  <Link
                    to="/match"
                    className="text-sm font-semibold text-[#b66348] hover:text-[#a6533b]"
                  >
                    Manage Jobs
                  </Link>
                </div>

                {recentJobs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#ddc3b6] bg-[#fff8f3] p-10 text-center">
                    <p className="text-sm text-[#897971]">
                      No jobs available yet.
                    </p>

                    <Link
                      to="/match"
                      className="mt-4 inline-block rounded-full bg-[#d97757] px-6 py-3 text-sm font-semibold text-white"
                    >
                      Open Jobs & Candidates
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentJobs.map(
                      (job, index) => (
                        <div
                          key={
                            job?.id ||
                            `${getJobTitle(
                              job
                            )}-${index}`
                          }
                          className="rounded-2xl border border-[#e8d5cc] bg-[#fff8f3] p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="break-words text-base font-semibold text-[#493d36]">
                                {getJobTitle(
                                  job
                                )}
                              </h3>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {job?.department && (
                                  <span className="rounded-full bg-[#f3dfd5] px-3 py-1 text-xs font-medium text-[#95513b]">
                                    {job.department}
                                  </span>
                                )}

                                {job?.status && (
                                  <span className="rounded-full bg-[#fffdfb] px-3 py-1 text-xs font-medium text-[#766961]">
                                    {job.status}
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-sm text-[#82736b]">
                                {getJobCandidates(
                                  job
                                ) ||
                                  job?.applied ||
                                  job?.candidateCount ||
                                  0}{" "}
                                candidates evaluated
                              </p>
                            </div>

                            <div className="shrink-0 text-left sm:text-right">
                              <span className="block text-xs font-medium text-[#9a8980]">
                                {job?.createdAt
                                  ? "Created"
                                  : "Analyzed"}
                              </span>

                              <span className="text-sm text-[#665850]">
                                {formatDate(
                                  job?.createdAt ||
                                  job?.date
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>

              {/* TOP CANDIDATES */}
              <section className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.03)] sm:p-8">
                <div className="mb-6">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#b96a50]">
                    AI Ranking
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#332923]">
                    Top Candidates
                  </h2>
                </div>

                {topCandidates.length ===
                  0 ? (
                  <div className="rounded-2xl bg-[#fff8f3] p-6 text-center">
                    <p className="text-sm text-[#897971]">
                      No evaluated candidates yet.
                    </p>

                    <Link
                      to="/match"
                      className="mt-4 inline-block text-sm font-semibold text-[#b66348]"
                    >
                      Start Candidate Evaluation
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-5">
                    {topCandidates.map(
                      (candidate, index) => {
                        const score =
                          getMatchScore(
                            candidate
                          );

                        return (
                          <li
                            key={
                              candidate.key ||
                              `${getCandidateName(
                                candidate
                              )}-${index}`
                            }
                            className="border-b border-[#f4dfd5] pb-4 last:border-0 last:pb-0"
                          >
                            <div className="flex items-start gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3dfd5] text-xs font-bold text-[#a6573e]">
                                #
                                {candidate.rank ??
                                  index + 1}
                              </span>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="break-words font-semibold text-[#493d36]">
                                      {getCandidateName(
                                        candidate
                                      )}
                                    </p>

                                    <p className="mt-1 break-words text-xs text-[#82736b]">
                                      {candidate.jobTitle ||
                                        "Untitled Role"}
                                    </p>
                                  </div>

                                  <span className="shrink-0 rounded-full bg-[#f3dfd5] px-2.5 py-1 text-xs font-bold text-[#a6573e]">
                                    {score.toFixed(
                                      1
                                    )}
                                    %
                                  </span>
                                </div>

                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f1dfd6]">
                                  <div
                                    className="h-full rounded-full bg-[#d97757]"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(
                                          0,
                                          score
                                        )
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      }
                    )}
                  </ul>
                )}
              </section>
            </div>

            {/* RECRUITMENT FUNNEL */}
            <section className="mt-8 rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.03)] sm:p-8">
              <div className="mb-7">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#b96a50]">
                  Recruitment Funnel
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#332923]">
                  Candidate Pipeline
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] p-5">
                  <p className="text-sm font-semibold text-[#594b43]">
                    New
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#8b6b56]">
                    {analytics.newCandidates}
                  </p>

                  <p className="mt-2 text-xs text-[#897971]">
                    Awaiting review
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d9e4d3] bg-[#f8fbf5] p-5">
                  <p className="text-sm font-semibold text-[#58734c]">
                    Shortlisted
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#58734c]">
                    {analytics.shortlisted}
                  </p>

                  <p className="mt-2 text-xs text-[#718266]">
                    Selected for next stage
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e5c1b5] bg-[#fff0eb] p-5">
                  <p className="text-sm font-semibold text-[#a34f37]">
                    Rejected
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#a34f37]">
                    {analytics.rejected}
                  </p>

                  <p className="mt-2 text-xs text-[#8f6659]">
                    Not selected
                  </p>
                </div>
              </div>
            </section>

            {/* AI INSIGHTS */}
            <section className="mt-8 rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.03)] sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#b96a50]">
                  Recruita Insights
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#332923]">
                  AI Recruitment Overview
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                <div className="rounded-2xl bg-[#fff8f3] p-5">
                  <p className="text-sm font-semibold text-[#594b43]">
                    Matching Quality
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-[#d97757]">
                    {analytics.averageMatch.toFixed(
                      1
                    )}
                    %
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#897971]">
                    Average resume-to-job matching
                    score across evaluated candidates.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fff8f3] p-5">
                  <p className="text-sm font-semibold text-[#594b43]">
                    Candidate Potential
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-[#8f5a45]">
                    {analytics.averagePrediction.toFixed(
                      1
                    )}
                    %
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#897971]">
                    Average AI prediction score combining
                    available candidate prediction signals.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fff8f3] p-5">
                  <p className="text-sm font-semibold text-[#594b43]">
                    Salary Intelligence
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-[#8f5a45]">
                    {analytics.salaryPredictions}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#897971]">
                    Candidates currently have an available
                    salary prediction from Recruita.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* EMPTY STATE */}
        {loaded &&
          candidates.length === 0 &&
          sessions.length === 0 &&
          jobs.length === 0 && (
            <section className="mt-8 rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-10 text-center shadow-[0_12px_35px_rgba(95,65,50,0.03)]">
              <h3 className="text-xl font-semibold text-[#332923]">
                Start building your recruitment analytics
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#897971]">
                Create a job, upload candidate resumes, and
                run Candidate Evaluation to populate your
                Recruita analytics dashboard.
              </p>

              <Link
                to="/match"
                className="mt-6 inline-block rounded-full bg-[#d97757] px-8 py-3.5 font-semibold text-white shadow-md shadow-[#d97757]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c96749]"
              >
                Open Jobs & Candidates
              </Link>
            </section>
          )}
      </main>

      <Footer />
    </div>
  );
}

export default DashboardPage;