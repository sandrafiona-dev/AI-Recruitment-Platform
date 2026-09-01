import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const EVALUATED_CANDIDATES_STORAGE_KEY =
  "recruita_evaluated_candidates";

const SHORTLIST_STORAGE_KEY =
  "recruita_shortlisted_candidates";

/* =========================================================
   PREDICTION HELPERS
========================================================= */

const getPredictionLabel = (score) => {
  if (score === null || score === undefined) {
    return "Prediction unavailable";
  }

  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return "Prediction unavailable";
  }

  if (numericScore >= 80) return "Strong Candidate";
  if (numericScore >= 60) return "Promising Candidate";
  if (numericScore >= 40) return "Potential Candidate";

  return "Low Prediction";
};

const getPredictionClasses = (score) => {
  if (score === null || score === undefined) {
    return "bg-[#f5eee7] text-[#8b6b56]";
  }

  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return "bg-[#f5eee7] text-[#8b6b56]";
  }

  if (numericScore >= 80) {
    return "bg-[#e9f2e5] text-[#58734c]";
  }

  if (numericScore >= 60) {
    return "bg-[#edf3e9] text-[#637b58]";
  }

  if (numericScore >= 40) {
    return "bg-[#fff4df] text-[#99713d]";
  }

  return "bg-[#fff0eb] text-[#a85a43]";
};

/* =========================================================
   STATUS HELPERS
========================================================= */

const getStatusClasses = (status) => {
  switch (status) {
    case "Shortlisted":
      return "border-[#b9ccb0] bg-[#edf3e9] text-[#58734c]";

    case "Rejected":
      return "border-[#e5c1b5] bg-[#fff0eb] text-[#a34f37]";

    default:
      return "border-[#dfc9bd] bg-[#f5eee7] text-[#8b6b56]";
  }
};

/* =========================================================
   SALARY HELPERS
=========================================================

   IMPORTANT:

   Backend salary_predictor.py returns:

   predicted_salary       -> INR
   predicted_salary_lpa   -> LPA
   salary_range           -> e.g. ₹5–6 LPA

   We use predicted_salary_lpa directly.

   DO NOT divide by 100000 here.
========================================================= */

const getSalaryData = (candidate) => {
  const salary =
    candidate?.prediction_outputs?.salary ||
    candidate?.salary_prediction ||
    null;

  if (!salary || typeof salary !== "object") {
    return {
      available: false,
      lpa: null,
      range: null,
      confidenceNote: null,
    };
  }

  const lpaValue =
    salary.predicted_salary_lpa ??
    salary.predictedSalaryLpa ??
    null;

  const lpa =
    lpaValue !== null && lpaValue !== undefined
      ? Number(lpaValue)
      : null;

  return {
    available: Number.isFinite(lpa),
    lpa: Number.isFinite(lpa) ? lpa : null,
    range: salary.salary_range || null,
    confidenceNote:
      salary.confidence_note ||
      salary.note ||
      null,
  };
};

const formatSalaryLPA = (value) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return `₹${Number(value).toFixed(1)} LPA`;
};

const formatSalaryRange = (salary) => {
  if (!salary?.available) {
    return "Salary unavailable";
  }

  if (salary.range) {
    return salary.range;
  }

  return formatSalaryLPA(salary.lpa);
};

/* =========================================================
   SCORE HELPERS
========================================================= */

const getMatchScore = (candidate) => {
  const value =
    candidate?.match_score ??
    candidate?.matchScore ??
    0;

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
};

const getPredictionScore = (candidate) => {
  const value = candidate?.prediction_score;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

function RankingPage() {
  const [candidates, setCandidates] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [jobFilter, setJobFilter] = useState("All Jobs");

  /* =======================================================
     LOAD EVALUATED CANDIDATES
  ======================================================= */

  const loadCandidates = () => {
    try {
      const evaluated = JSON.parse(
        localStorage.getItem(
          EVALUATED_CANDIDATES_STORAGE_KEY
        ) || "[]"
      );

      const statuses = JSON.parse(
        localStorage.getItem(
          SHORTLIST_STORAGE_KEY
        ) || "[]"
      );

      const statusMap = new Map(
        Array.isArray(statuses)
          ? statuses.map((item) => [
            item.key,
            item.status,
          ])
          : []
      );

      const merged = Array.isArray(evaluated)
        ? evaluated.map((candidate) => ({
          ...candidate,
          status:
            statusMap.get(candidate.key) ||
            candidate.status ||
            "New",
        }))
        : [];

      setCandidates(merged);
    } catch (err) {
      console.error(
        "Unable to load evaluated candidates:",
        err
      );

      setCandidates([]);
    }
  };

  /* =======================================================
     INITIAL LOAD + STORAGE LISTENER
  ======================================================= */

  useEffect(() => {
    loadCandidates();

    const handleStorageChange = () => {
      loadCandidates();
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

  /* =======================================================
     JOB FILTER OPTIONS
  ======================================================= */

  const jobs = useMemo(() => {
    return [
      ...new Set(
        candidates
          .map((candidate) => candidate.jobTitle)
          .filter(Boolean)
      ),
    ];
  }, [candidates]);

  /* =======================================================
     FILTERED CANDIDATES
  ======================================================= */

  const filteredCandidates = useMemo(() => {
    return [...candidates]
      .filter((candidate) => {
        const statusMatches =
          statusFilter === "All" ||
          candidate.status === statusFilter;

        const jobMatches =
          jobFilter === "All Jobs" ||
          candidate.jobTitle === jobFilter;

        return statusMatches && jobMatches;
      })
      .sort(
        (a, b) =>
          getMatchScore(b) -
          getMatchScore(a)
      );
  }, [
    candidates,
    statusFilter,
    jobFilter,
  ]);

  /* =======================================================
     SHORTLISTED CANDIDATES
  ======================================================= */

  const shortlistedCandidates = useMemo(() => {
    return [...candidates]
      .filter(
        (candidate) =>
          candidate.status === "Shortlisted"
      )
      .sort(
        (a, b) =>
          getMatchScore(b) -
          getMatchScore(a)
      );
  }, [candidates]);

  /* =======================================================
     SUMMARY COUNTS
  ======================================================= */

  const shortlistedCount =
    shortlistedCandidates.length;

  const rejectedCount = candidates.filter(
    (candidate) =>
      candidate.status === "Rejected"
  ).length;

  const newCount = candidates.filter(
    (candidate) =>
      !candidate.status ||
      candidate.status === "New"
  ).length;

  const salaryAvailableCount = candidates.filter(
    (candidate) =>
      getSalaryData(candidate).available
  ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:py-16">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#b96a50]">
            Candidate Evaluation
          </p>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#29231f] sm:text-5xl">
                Candidate Ranking
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-[#766961] sm:text-lg">
                Review evaluated candidates across your
                job postings and track recruitment decisions
                in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={loadCandidates}
              className="rounded-full border border-[#dfc9bd] bg-[#fffdfb] px-5 py-3 text-sm font-semibold text-[#6f625b] transition hover:bg-[#fff3ee]"
            >
              Refresh Results
            </button>
          </div>
        </section>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {/* Evaluated */}
          <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.04)]">
            <p className="text-sm text-[#897971]">
              Evaluated Candidates
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#d97757]">
              {candidates.length}
            </p>
          </div>

          {/* Shortlisted */}
          <div className="rounded-3xl border border-[#d9e4d3] bg-[#f8fbf5] p-6">
            <p className="text-sm text-[#718266]">
              Shortlisted
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#58734c]">
              {shortlistedCount}
            </p>
          </div>

          {/* New */}
          <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6">
            <p className="text-sm text-[#897971]">
              New
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#8b6b56]">
              {newCount}
            </p>
          </div>

          {/* Rejected */}
          <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6">
            <p className="text-sm text-[#897971]">
              Rejected
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#a34f37]">
              {rejectedCount}
            </p>
          </div>

          {/* Salary */}
          <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6">
            <p className="text-sm text-[#897971]">
              Salary Predictions
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#8f5a45]">
              {salaryAvailableCount}
            </p>
          </div>
        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mb-8 rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-5 shadow-[0_12px_35px_rgba(95,65,50,0.04)] sm:p-6">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* Job */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#594b43]">
                Job
              </label>

              <select
                value={jobFilter}
                onChange={(e) =>
                  setJobFilter(e.target.value)
                }
                className="w-full rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] px-4 py-3 text-sm font-medium text-[#493d36] outline-none focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
              >
                <option value="All Jobs">
                  All Jobs
                </option>

                {jobs.map((job) => (
                  <option
                    key={job}
                    value={job}
                  >
                    {job}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#594b43]">
                Candidate Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] px-4 py-3 text-sm font-medium text-[#493d36] outline-none focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
              >
                <option value="All">
                  All Candidates
                </option>

                <option value="New">
                  New
                </option>

                <option value="Shortlisted">
                  Shortlisted
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>
            </div>

          </div>
        </section>

        {/* =================================================
            SHORTLISTED CANDIDATES
        ================================================= */}

        {shortlistedCount > 0 && (
          <section className="mb-10">

            <div className="mb-5">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#b96a50]">
                Shortlist
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-[#29231f]">
                Shortlisted Candidates
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

              {shortlistedCandidates.map(
                (candidate) => {
                  const salary =
                    getSalaryData(candidate);

                  const predictionScore =
                    getPredictionScore(candidate);

                  const matchScore =
                    getMatchScore(candidate);

                  return (
                    <div
                      key={candidate.key}
                      className="rounded-3xl border border-[#d9e4d3] bg-[#f8fbf5] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.04)]"
                    >

                      {/* Candidate Header */}
                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <span className="inline-flex rounded-full bg-[#e5efdf] px-3 py-1 text-xs font-semibold text-[#58734c]">
                            ✓ Shortlisted
                          </span>

                          <h3 className="mt-3 break-words text-xl font-semibold text-[#332923]">
                            {candidate.candidateName ||
                              candidate.name ||
                              "Unknown Candidate"}
                          </h3>

                          <p className="mt-1 text-sm text-[#766961]">
                            {candidate.jobTitle ||
                              "Untitled Role"}
                          </p>

                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xs text-[#897971]">
                            Match
                          </p>

                          <p className="mt-1 text-2xl font-extrabold text-[#d97757]">
                            {matchScore.toFixed(1)}%
                          </p>
                        </div>

                      </div>

                      {/* Prediction + Salary */}
                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                        {/* Prediction */}
                        <div className="rounded-2xl border border-[#d9e4d3] bg-[#fffdfb] p-4">

                          <p className="text-xs text-[#897971]">
                            Prediction Score
                          </p>

                          <p className="mt-1 text-xl font-extrabold text-[#8f5a45]">
                            {predictionScore !== null
                              ? `${predictionScore.toFixed(1)}%`
                              : "—"}
                          </p>

                        </div>

                        {/* Salary */}
                        <div className="rounded-2xl border border-[#ead8ce] bg-[#fffdfb] p-4">

                          <p className="text-xs text-[#897971]">
                            Predicted Salary
                          </p>

                          <p className="mt-1 text-lg font-extrabold text-[#8f5a45]">
                            {formatSalaryLPA(
                              salary.lpa
                            )}
                          </p>

                          {salary.range && (
                            <p className="mt-1 text-xs text-[#897971]">
                              Range: {salary.range}
                            </p>
                          )}

                        </div>

                      </div>

                      {/* Prediction Label */}
                      <div className="mt-4 flex flex-wrap gap-2">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getPredictionClasses(
                            predictionScore
                          )}`}
                        >
                          {getPredictionLabel(
                            predictionScore
                          )}
                        </span>

                        {salary.available && (
                          <span className="rounded-full bg-[#f3dfd5] px-3 py-1 text-xs font-semibold text-[#95513b]">
                            ₹ LPA
                          </span>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          </section>
        )}

        {/* =================================================
            ALL EVALUATED CANDIDATES
        ================================================= */}

        <section>

          <div className="mb-5">

            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#b96a50]">
              Evaluation Report
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#29231f]">
              All Evaluated Candidates
            </h2>

          </div>

          {/* Empty State */}
          {filteredCandidates.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-[#ddc3b6] bg-[#fffdfb] px-6 py-16 text-center">

              <div className="mx-auto max-w-md">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f3ded4] text-2xl text-[#b66348]">
                  +
                </div>

                <h3 className="mt-5 text-xl font-semibold text-[#332923]">
                  No evaluated candidates yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#82736b]">
                  Go to the Job Board, open Manage
                  Candidates, upload resumes, and run
                  Candidate Evaluation.
                </p>

              </div>

            </div>

          ) : (

            <div className="space-y-5">

              {filteredCandidates.map(
                (candidate, index) => {

                  const matchScore =
                    getMatchScore(candidate);

                  const predictionScore =
                    getPredictionScore(candidate);

                  const skillGap =
                    candidate.details?.skill_gap ||
                    {};

                  const matchedSkills =
                    Array.isArray(
                      skillGap.matched_skills
                    )
                      ? skillGap.matched_skills
                      : [];

                  const missingSkills =
                    Array.isArray(
                      skillGap.missing_skills
                    )
                      ? skillGap.missing_skills
                      : [];

                  const salary =
                    getSalaryData(candidate);

                  const rank =
                    candidate.rank ??
                    index + 1;

                  return (
                    <article
                      key={
                        candidate.key ||
                        `${candidate.candidateName}-${index}`
                      }
                      className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.04)] sm:p-7"
                    >

                      <div className="flex flex-col gap-6">

                        {/* =================================
                            HEADER
                        ================================= */}

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                          <div className="flex min-w-0 items-start gap-3">

                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4dfd5] text-xs font-bold text-[#a6573e]">
                              #{rank}
                            </span>

                            <div className="min-w-0">

                              <h3 className="break-words text-2xl font-semibold text-[#29231f]">
                                {candidate.candidateName ||
                                  candidate.name ||
                                  "Unknown Candidate"}
                              </h3>

                              <p className="mt-1 text-sm text-[#8a7b73]">
                                {candidate.jobTitle ||
                                  "Untitled Role"}
                              </p>

                              <span
                                className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                  candidate.status
                                )}`}
                              >
                                {candidate.status ||
                                  "New"}
                              </span>

                            </div>
                          </div>

                          {/* Scores */}
                          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">

                            <div className="rounded-2xl bg-[#fff8f3] p-4">

                              <p className="text-xs text-[#96877f]">
                                Match Score
                              </p>

                              <p className="mt-1 text-3xl font-extrabold text-[#d97757]">
                                {matchScore.toFixed(1)}%
                              </p>

                            </div>

                            <div className="rounded-2xl bg-[#fff8f3] p-4">

                              <p className="text-xs text-[#96877f]">
                                Prediction
                              </p>

                              <p className="mt-1 text-3xl font-extrabold text-[#8f5a45]">
                                {predictionScore !== null
                                  ? `${predictionScore.toFixed(1)}%`
                                  : "—"}
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* =================================
                            AI PREDICTION + SALARY
                        ================================= */}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                          {/* AI Prediction */}
                          <div className="rounded-3xl border border-[#ead8ce] bg-[#fff8f3] p-5">

                            <div className="flex items-start justify-between gap-4">

                              <div>

                                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9a8980]">
                                  AI Candidate Prediction
                                </p>

                                <p className="mt-2 text-xl font-bold text-[#594b43]">
                                  {getPredictionLabel(
                                    predictionScore
                                  )}
                                </p>

                              </div>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getPredictionClasses(
                                  predictionScore
                                )}`}
                              >
                                {predictionScore !== null
                                  ? `${predictionScore.toFixed(1)}%`
                                  : "—"}
                              </span>

                            </div>

                          </div>

                          {/* Salary */}
                          <div className="rounded-3xl border border-[#e4d3c9] bg-[#fdf8f4] p-5">

                            <div className="flex items-start justify-between gap-4">

                              <div>

                                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9a8980]">
                                  Predicted Salary
                                </p>

                                <p className="mt-2 text-2xl font-extrabold text-[#8f5a45]">
                                  {salary.available
                                    ? formatSalaryLPA(
                                      salary.lpa
                                    )
                                    : "Salary unavailable"}
                                </p>

                                {salary.range && (
                                  <p className="mt-1 text-sm text-[#897971]">
                                    Estimated range:{" "}
                                    {salary.range}
                                  </p>
                                )}

                              </div>

                              <span className="rounded-full bg-[#f3dfd5] px-3 py-1 text-xs font-semibold text-[#95513b]">
                                LPA
                              </span>

                            </div>

                            {salary.confidenceNote && (
                              <p className="mt-3 text-xs leading-5 text-[#897971]">
                                {salary.confidenceNote}
                              </p>
                            )}

                          </div>

                        </div>

                        {/* =================================
                            SKILL + SCORE DETAILS
                        ================================= */}

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                          {/* Matched Skills */}
                          <div className="rounded-2xl border border-[#e3d2c7] bg-[#fdf8f4] p-5">

                            <h4 className="mb-3 text-sm font-semibold text-[#76503f]">
                              Matched Skills
                            </h4>

                            <div className="flex flex-wrap gap-2">

                              {matchedSkills.length > 0 ? (

                                matchedSkills.map(
                                  (skill, skillIndex) => (
                                    <span
                                      key={skillIndex}
                                      className="rounded-full border border-[#d9b8a8] bg-[#f3dfd5] px-3 py-1 text-xs font-medium text-[#95513b]"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )

                              ) : (

                                <span className="text-xs text-[#897971]">
                                  None
                                </span>

                              )}

                            </div>

                          </div>

                          {/* Missing Skills */}
                          <div className="rounded-2xl border border-[#e8d5cc] bg-[#fff8f3] p-5">

                            <h4 className="mb-3 text-sm font-semibold text-[#76503f]">
                              Missing Skills
                            </h4>

                            <div className="flex flex-wrap gap-2">

                              {missingSkills.length > 0 ? (

                                missingSkills.map(
                                  (skill, skillIndex) => (
                                    <span
                                      key={skillIndex}
                                      className="rounded-full border border-[#e5c8bc] bg-[#fff0eb] px-3 py-1 text-xs font-medium text-[#a85a43]"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )

                              ) : (

                                <span className="text-xs text-[#897971]">
                                  None
                                </span>

                              )}

                            </div>

                          </div>

                          {/* Score Breakdown */}
                          <div className="rounded-2xl border border-[#ead8ce] bg-[#fff8f3] p-5">

                            <h4 className="mb-5 text-sm font-semibold text-[#76503f]">
                              Score Breakdown
                            </h4>

                            <div className="space-y-4">

                              {/* Text Similarity */}
                              <div className="flex justify-between">

                                <span className="text-sm text-[#766961]">
                                  Text Similarity
                                </span>

                                <strong>
                                  {Math.round(
                                    Number(
                                      candidate
                                        .details
                                        ?.text_similarity ??
                                      0
                                    ) * 100
                                  )}
                                  %
                                </strong>

                              </div>

                              {/* Skill Match */}
                              <div className="flex justify-between">

                                <span className="text-sm text-[#766961]">
                                  Skill Match
                                </span>

                                <strong>
                                  {Math.round(
                                    Number(
                                      candidate
                                        .details
                                        ?.skill_match ??
                                      0
                                    ) * 100
                                  )}
                                  %
                                </strong>

                              </div>

                              {/* Experience */}
                              <div className="flex justify-between">

                                <span className="text-sm text-[#766961]">
                                  Experience Match
                                </span>

                                <strong>
                                  {Math.round(
                                    Number(
                                      candidate
                                        .details
                                        ?.experience_match ??
                                      0
                                    ) * 100
                                  )}
                                  %
                                </strong>

                              </div>

                            </div>

                          </div>

                        </div>

                        {/* =================================
                            RECOMMENDATION
                        ================================= */}

                        <div className="border-t border-[#f0e2da] pt-5">

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                              <p className="text-xs uppercase tracking-[0.14em] text-[#a28f86]">
                                Recruita Recommendation
                              </p>

                              <p className="mt-1 text-sm font-semibold text-[#594b43]">
                                {candidate.recommendation ||
                                  "Evaluation completed"}
                              </p>

                            </div>

                            <span
                              className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold ${getPredictionClasses(
                                predictionScore
                              )}`}
                            >
                              {getPredictionLabel(
                                predictionScore
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

      </main>

      <Footer />
    </div>
  );
}

export default RankingPage;