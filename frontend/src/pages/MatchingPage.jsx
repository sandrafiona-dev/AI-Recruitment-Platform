import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE_URL = "http://localhost:8000";

function MatchingPage() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0] || null);
    setError("");
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError("Please upload a resume.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", resumeFile);
      formData.append("job_description", jobDescription);

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/candidates/analyze`,
        formData
      );

      setResult(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg || "Validation error").join(", ")
        );
      } else {
        setError(
          detail ||
            "Unable to complete candidate analysis. Please make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const candidate = result?.candidate;
  const recommendation = result?.recommendation;
  const predictions = result?.predictions;
  const skillGap = result?.skill_gap;

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:py-16">
        {/* PAGE INTRO */}
        <section className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#b96a50]">
            Candidate intelligence
          </p>

          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#29231f] sm:text-5xl">
            Resume-to-Job Matching
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-[#766961] sm:text-lg">
            Understand how well a candidate fits a role through skills,
            experience, compatibility, and Recruita's prediction models.
          </p>
        </section>

        {/* INPUT CARD */}
        <section className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(95,65,50,0.06)] sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-semibold text-[#332923]">
              Analyze a candidate
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#82736b]">
              Upload a resume and compare it against the requirements of a
              position.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* RESUME */}
            <div className="rounded-2xl border border-dashed border-[#dcb8a8] bg-[#fff8f3] p-5">
              <label className="mb-3 block text-sm font-medium text-[#594b43]">
                1. Upload Candidate Resume
              </label>

              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="block w-full cursor-pointer text-sm text-[#766961]
                  file:mr-4 file:rounded-full file:border-0
                  file:bg-[#f3ded4] file:px-5 file:py-2.5
                  file:text-sm file:font-semibold file:text-[#a6573e]
                  hover:file:bg-[#ecd0c3]"
              />

              {resumeFile && (
                <p className="mt-4 text-sm text-[#6f625b] truncate">
                  Selected:{" "}
                  <span className="font-medium text-[#493d36]">
                    {resumeFile.name}
                  </span>
                </p>
              )}
            </div>

            {/* JOB DESCRIPTION */}
            <div>
              <label className="mb-3 block text-sm font-medium text-[#594b43]">
                2. Paste Job Description
              </label>

              <textarea
                rows={7}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full resize-none rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] p-4 text-sm text-[#493d36] shadow-sm outline-none transition
                  placeholder:text-[#a29289]
                  focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
                placeholder="Paste the job description here..."
              />
            </div>
          </div>

          {/* ANALYZE BUTTON */}
          <button
            onClick={handleAnalyze}
            disabled={loading || !resumeFile || !jobDescription.trim()}
            className="mt-7 w-full rounded-full bg-[#d97757] px-6 py-3.5 font-semibold text-white
              shadow-md shadow-[#d97757]/15
              transition-all duration-300
              hover:-translate-y-0.5 hover:bg-[#c96749] hover:shadow-lg
              disabled:cursor-not-allowed disabled:bg-[#d9ccc5] disabled:shadow-none"
          >
            {loading ? "Analyzing Candidate..." : "Analyze Candidate"}
          </button>

          {/* ERROR */}
          {error && (
            <div className="mt-5 rounded-2xl border border-[#edc8bb] bg-[#fff0eb] px-5 py-4">
              <p className="text-sm text-[#b04f36]">{error}</p>
            </div>
          )}
        </section>

        {/* RESULTS */}
        {result && (
          <section className="mt-8 space-y-6">
            {/* CANDIDATE HEADER */}
            <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-7 text-center shadow-[0_18px_50px_rgba(95,65,50,0.05)] sm:p-9">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#b96a50]">
                Candidate Analysis
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#29231f] sm:text-4xl break-words">
                {candidate?.name || "Unknown"}
              </h2>

              <p className="mt-3 text-[#766961]">
                Predicted Role:{" "}
                <span className="font-semibold text-[#c86445]">
                  {result.predicted_role || "Unknown"}
                </span>
              </p>
            </div>

            {/* RECOMMENDATION METRICS */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="rounded-3xl border border-[#e5c9bb] bg-[#f9e8df] p-6 text-center">
                <p className="text-sm font-medium text-[#705f56]">
                  Recommendation Score
                </p>

                <p className="mt-3 text-4xl font-extrabold text-[#c86445]">
                  {recommendation?.score ?? "N/A"}%
                </p>

                <p className="mt-2 font-semibold text-[#594b43]">
                  {recommendation?.label || "N/A"}
                </p>
              </div>

              <div className="rounded-3xl border border-[#e3d2c7] bg-[#fdf5ef] p-6 text-center">
                <p className="text-sm font-medium text-[#705f56]">
                  Skill Match
                </p>

                <p className="mt-3 text-4xl font-extrabold text-[#a85d43]">
                  {skillGap?.skill_match_percentage ?? "N/A"}%
                </p>

                <p className="mt-2 text-sm text-[#82736b]">
                  Skills aligned with the role
                </p>
              </div>

              <div className="rounded-3xl border border-[#e5d4c9] bg-[#fff8f3] p-6 text-center">
                <p className="text-sm font-medium text-[#705f56]">
                  Role Compatibility
                </p>

                <p className="mt-3 text-4xl font-extrabold text-[#8f5d4a]">
                  {recommendation?.role_compatibility ?? "N/A"}%
                </p>

                <p className="mt-2 text-sm text-[#82736b]">
                  Based on role fit
                </p>
              </div>
            </div>

            {/* REASONS */}
            {recommendation?.reasons?.length > 0 && (
              <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.04)] sm:p-7">
                <h3 className="mb-5 text-lg font-semibold text-[#332923]">
                  Recommendation Reasons
                </h3>

                <ul className="space-y-3">
                  {recommendation.reasons.map((reason, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 rounded-xl bg-[#fff8f3] px-4 py-3 text-sm text-[#665850]"
                    >
                      <span className="font-bold text-[#c86445]">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* SKILLS */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-[#e3d2c7] bg-[#fdf8f4] p-6">
                <h3 className="mb-4 text-lg font-semibold text-[#76503f]">
                  Matched Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {(recommendation?.matched_skills || []).length > 0 ? (
                    recommendation.matched_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-[#d9b8a8] bg-[#f3dfd5] px-3.5 py-1.5 text-sm font-medium text-[#95513b]"
                      >
                        ✓ {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-[#897971]">None</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-[#e8d5cc] bg-[#fff8f3] p-6">
                <h3 className="mb-4 text-lg font-semibold text-[#76503f]">
                  Missing Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {(recommendation?.missing_skills || []).length > 0 ? (
                    recommendation.missing_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-[#e5c8bc] bg-[#fff0eb] px-3.5 py-1.5 text-sm font-medium text-[#a85a43]"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="font-medium text-[#8b654f]">
                      No missing skills
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* AI PREDICTIONS */}
            <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.04)] sm:p-7">
              <div className="mb-5">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#b96a50]">
                  Predictive insights
                </p>

                <h3 className="mt-2 text-xl font-semibold text-[#332923]">
                  AI Predictions
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {/* INTERVIEW */}
                <div className="rounded-2xl border border-[#e6d7cf] bg-[#fff8f3] p-5">
                  <p className="text-sm font-medium text-[#6f625b]">
                    Interview Score
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#b66348]">
                    {predictions?.interview?.predicted_score ?? "N/A"}
                    <span className="text-base font-normal text-[#82736b]">
                      {" "}
                      / 100
                    </span>
                  </p>

                  <p className="mt-3 text-xs text-[#9a8980]">
                    Development/demo estimate
                  </p>
                </div>

                {/* SUCCESS */}
                <div className="rounded-2xl border border-[#e6d7cf] bg-[#fdf6f1] p-5">
                  <p className="text-sm font-medium text-[#6f625b]">
                    Success Prediction
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#9b5b43]">
                    {predictions?.success?.predicted_success === true
                      ? "Likely"
                      : predictions?.success?.predicted_success === false
                      ? "Unlikely"
                      : "N/A"}
                  </p>

                  {predictions?.success?.probability != null && (
                    <p className="mt-2 text-sm text-[#6f625b]">
                      Probability:{" "}
                      {(predictions.success.probability * 100).toFixed(2)}%
                    </p>
                  )}

                  <p className="mt-3 text-xs text-[#9a8980]">
                    Development/demo estimate
                  </p>
                </div>

                {/* SALARY */}
                <div className="rounded-2xl border border-[#e8d8c8] bg-[#fffaf4] p-5">
                  <p className="text-sm font-medium text-[#6f625b]">
                    Predicted Salary
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#a96645]">
                    {predictions?.salary?.predicted_salary != null
                      ? `$${Number(
                          predictions.salary.predicted_salary
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "N/A"}
                  </p>

                  <p className="mt-3 text-xs text-[#9a8980]">
                    {predictions?.salary?.currency || "USD"} • Development/demo
                    estimate
                  </p>
                </div>
              </div>
            </div>

            {/* MATCH DETAILS */}
            <div className="rounded-3xl border border-[#ead8ce] bg-[#fff8f3] p-6 sm:p-7">
              <h3 className="mb-5 text-lg font-semibold text-[#332923]">
                Match Details
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                  <p className="text-sm text-[#897971]">Overall Match</p>

                  <p className="mt-1 font-semibold text-[#493d36]">
                    {result.match_score ?? "N/A"}%
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#897971]">Text Similarity</p>

                  <p className="mt-1 font-semibold text-[#493d36]">
                    {recommendation?.score != null &&
                    result.match_score != null
                      ? `${((result.match_score / 100) * 100).toFixed(2)}%`
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#897971]">Experience Match</p>

                  <p className="mt-1 font-semibold text-[#493d36]">
                    {recommendation?.role_compatibility ?? "N/A"}%
                  </p>
                </div>
              </div>
            </div>

            {/* RECOMMENDED ROLES */}
            <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.04)] sm:p-7">
              <h3 className="mb-5 text-lg font-semibold text-[#332923]">
                Recommended Roles
              </h3>

              {result.recommended_roles &&
              result.recommended_roles.length > 0 ? (
                <ul className="space-y-3">
                  {result.recommended_roles.map((rec, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-[#ead8ce] bg-[#fff8f3] px-4 py-3.5"
                    >
                      <span className="font-medium text-[#594b43] break-words">
                        {rec.role}
                      </span>

                      <span className="shrink-0 rounded-full bg-[#f3dfd5] px-3 py-1 text-sm font-semibold text-[#9f533c]">
                        {rec.score}% Match
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-[#897971]">
                  No strong role matches found.
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default MatchingPage;