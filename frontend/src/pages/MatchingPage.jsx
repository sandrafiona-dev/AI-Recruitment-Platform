import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const STORAGE_KEY = "recruita_jobs";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000" : "");
const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Infrastructure",
  "Design",
];

const STATUSES = ["Active", "Draft"];

const initialForm = {
  title: "",
  department: "Engineering",
  skills: "",
  description: "",
  status: "active",
};

const starterJobs = [
  {
    id: "job-demo-1",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    skills: [
      "React",
      "Node.js",
      "AWS",
      "System Design",
      "JavaScript",
    ],
    description:
      "We are looking for a Senior Full-Stack Engineer to build reliable and scalable web applications. The ideal candidate should have strong experience with React, Node.js, JavaScript, cloud infrastructure, and modern software architecture.",
    status: "active",
    applied: 0,
    createdAt: "2026-08-20T09:00:00.000Z",
  },
  {
    id: "job-demo-2",
    title: "Lead Product Manager",
    department: "Product",
    skills: [
      "Agile",
      "Product Strategy",
      "SaaS",
      "Analytics",
      "Roadmapping",
    ],
    description:
      "We are looking for a Lead Product Manager to define product strategy, manage roadmaps, and work closely with engineering and business teams to deliver valuable SaaS products.",
    status: "active",
    applied: 0,
    createdAt: "2026-08-19T09:00:00.000Z",
  },
  {
    id: "job-demo-3",
    title: "AI DevOps Engineer",
    department: "Infrastructure",
    skills: [
      "Kubernetes",
      "Docker",
      "CI/CD",
      "Terraform",
      "Python",
    ],
    description:
      "We are looking for an AI DevOps Engineer to improve deployment automation, cloud infrastructure, container orchestration, and reliable delivery workflows.",
    status: "draft",
    applied: 0,
    createdAt: "2026-08-18T09:00:00.000Z",
  },
];

function MatchingPage() {
  const [jobs, setJobs] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  // Candidate Management State
  const [managingJob, setManagingJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingResults, setRankingResults] = useState(null);
  const [rankingError, setRankingError] = useState("");

  // --------------------------------------------------
  // LOAD JOBS
  // --------------------------------------------------

  useEffect(() => {
    try {
      const storedJobs = localStorage.getItem(STORAGE_KEY);

      if (storedJobs) {
        const parsedJobs = JSON.parse(storedJobs);

        if (Array.isArray(parsedJobs)) {
          setJobs(parsedJobs);
          return;
        }
      }

      setJobs(starterJobs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(starterJobs));
    } catch (err) {
      console.error("Unable to load Recruita jobs:", err);
      setJobs(starterJobs);
    }
  }, []);

  // --------------------------------------------------
  // SAVE JOBS
  // --------------------------------------------------

  useEffect(() => {
    if (jobs.length === 0) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (err) {
      console.error("Unable to save Recruita jobs:", err);
    }
  }, [jobs]);

  // --------------------------------------------------
  // FILTER JOBS
  // --------------------------------------------------

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const departmentMatches =
        departmentFilter === "All Departments" ||
        job.department === departmentFilter;

      const statusMatches =
        statusFilter === "All Statuses" ||
        job.status === statusFilter.toLowerCase();

      return departmentMatches && statusMatches;
    });
  }, [jobs, departmentFilter, statusFilter]);

  // --------------------------------------------------
  // FORM HANDLERS
  // --------------------------------------------------

  const handleFormChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setGenerated(false);
  };

  const resetForm = () => {
    setForm(initialForm);
    setError("");
    setGenerated(false);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  // --------------------------------------------------
  // CANDIDATE MANAGEMENT HANDLERS
  // --------------------------------------------------

  const handleManageCandidates = (job) => {
    setManagingJob(job);
    setResumes([]);
    setRankingResults(null);
    setRankingError("");
  };

  const closeManageCandidatesModal = () => {
    setManagingJob(null);
    setResumes([]);
    setRankingResults(null);
    setRankingError("");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setResumes((prev) => [...prev, ...files]);
    setRankingError("");
    setRankingResults(null);
  };

  const handleRemoveFile = (index) => {
    setResumes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRank = async () => {
    if (!managingJob) return;
    if (resumes.length === 0) {
      setRankingError("Please upload at least one resume.");
      return;
    }

    setRankingLoading(true);
    setRankingError("");
    setRankingResults(null);

    try {
      // 1. Parse Job Description
      const jobRes = await axios.post(`${API_BASE_URL}/api/v1/jobs/parse`, {
        description: managingJob.description,
      });
      const parsedJobData = jobRes.data;

      // 2. Parse all resumes
      const parsedResumes = await Promise.all(
        resumes.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const resumeRes = await axios.post(
            `${API_BASE_URL}/api/v1/resumes/parse`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          return resumeRes.data;
        })
      );

      // 3. Rank candidates
      const rankRes = await axios.post(`${API_BASE_URL}/api/v1/candidates/rank`, {
        candidates: parsedResumes,
        job_data: parsedJobData,
      });

      setRankingResults(rankRes.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setRankingError(
        detail || "Unable to complete candidate ranking. Please try again later."
      );
    } finally {
      setRankingLoading(false);
    }
  };

  // --------------------------------------------------
  // DESCRIPTION BUILDER
  // --------------------------------------------------

  const handleGenerateDescription = () => {
    const title = form.title.trim();
    const skills = form.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!title) {
      setError("Enter a job title before generating the description.");
      return;
    }

    if (skills.length === 0) {
      setError("Add at least one target skill or requirement first.");
      return;
    }

    const skillText = skills.join(", ");

    const generatedDescription = `We are looking for a ${title} to join our team and contribute to meaningful, high-quality work.

The ideal candidate will bring strong practical experience and the ability to collaborate effectively across teams. This role will involve applying your expertise in ${skillText} to solve problems, deliver reliable solutions, and support the team's goals.

Key responsibilities include working with cross-functional teams, contributing to projects from planning through delivery, maintaining high-quality standards, and continuously improving processes and solutions.

Candidates should have strong communication skills, a problem-solving mindset, and hands-on experience with the technologies and requirements listed above.`;

    setForm((current) => ({
      ...current,
      description: generatedDescription,
    }));

    setGenerated(true);
    setError("");
  };

  // --------------------------------------------------
  // SAVE & PUBLISH
  // --------------------------------------------------

  const handleSaveJob = (event) => {
    event.preventDefault();

    const title = form.title.trim();

    const skills = form.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!title) {
      setError("Job title is required.");
      return;
    }

    if (skills.length === 0) {
      setError("Add at least one target skill or requirement.");
      return;
    }

    if (!form.description.trim()) {
      setError("Job description is required.");
      return;
    }

    const newJob = {
      id: `job-${Date.now()}`,
      title,
      department: form.department,
      skills,
      description: form.description.trim(),
      status: "active",
      applied: 0,
      createdAt: new Date().toISOString(),
    };

    setJobs((current) => [newJob, ...current]);
    closeCreateModal();
  };

  // --------------------------------------------------
  // DELETE JOB
  // --------------------------------------------------

  const handleDeleteJob = (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job posting?"
    );

    if (!confirmed) return;

    setJobs((current) => current.filter((job) => job.id !== jobId));

    if (selectedJob?.id === jobId) {
      setSelectedJob(null);
    }
  };

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "";

    try {
      return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(date));
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:py-16">
        {/* --------------------------------------------- */}
        {/* HEADER */}
        {/* --------------------------------------------- */}

        <section className="mb-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#b96a50]">
                Recruitment workspace
              </p>

              <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#29231f] sm:text-5xl">
                Job Board
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-[#766961] sm:text-lg">
                Manage your job postings and create structured descriptions
                for the roles you're hiring for.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#d97757] px-6 py-3.5 font-semibold text-white shadow-md shadow-[#d97757]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c96749] hover:shadow-lg"
            >
              <span className="text-lg leading-none">+</span>
              Post New Job
            </button>
          </div>
        </section>

        {/* --------------------------------------------- */}
        {/* FILTERS */}
        {/* --------------------------------------------- */}

        <section className="mb-7 rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-5 shadow-[0_12px_35px_rgba(95,65,50,0.04)] sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* DEPARTMENT */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#594b43]">
                Department
              </label>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] px-4 py-3 text-sm font-medium text-[#493d36] outline-none transition focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
              >
                <option>All Departments</option>

                {DEPARTMENTS.map((department) => (
                  <option key={department}>{department}</option>
                ))}
              </select>
            </div>

            {/* STATUS */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#594b43]">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] px-4 py-3 text-sm font-medium text-[#493d36] outline-none transition focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
              >
                <option>All Statuses</option>

                {STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* --------------------------------------------- */}
        {/* COUNT */}
        {/* --------------------------------------------- */}

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-medium text-[#766961]">
            {filteredJobs.length}{" "}
            {filteredJobs.length === 1 ? "posting" : "postings"} total
          </p>

          {(departmentFilter !== "All Departments" ||
            statusFilter !== "All Statuses") && (
              <button
                type="button"
                onClick={() => {
                  setDepartmentFilter("All Departments");
                  setStatusFilter("All Statuses");
                }}
                className="text-sm font-semibold text-[#b45f45] transition hover:text-[#8f4935]"
              >
                Clear filters
              </button>
            )}
        </div>

        {/* --------------------------------------------- */}
        {/* JOB LIST */}
        {/* --------------------------------------------- */}

        {filteredJobs.length > 0 ? (
          <section className="space-y-5">
            {filteredJobs.map((job) => (
              <article
                key={job.id}
                className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_14px_40px_rgba(95,65,50,0.045)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(95,65,50,0.08)] sm:p-7"
              >
                <div className="flex flex-col gap-5">
                  {/* TOP */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#f3ded4] px-3 py-1 text-xs font-semibold text-[#9f533c]">
                          {job.department}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${job.status === "active"
                              ? "bg-[#edf3e9] text-[#5e7550]"
                              : "bg-[#f5eee7] text-[#8b6b56]"
                            }`}
                        >
                          {job.status === "active" ? "Active" : "Draft"}
                        </span>
                      </div>

                      <h2 className="break-words text-2xl font-semibold tracking-[-0.02em] text-[#332923]">
                        {job.title}
                      </h2>

                      <p className="mt-2 text-sm text-[#96877f]">
                        Posted {formatDate(job.createdAt)}
                      </p>
                    </div>

                    {/* DELETE */}
                    <button
                      type="button"
                      onClick={() => handleDeleteJob(job.id)}
                      className="self-start rounded-full border border-[#ead8ce] px-4 py-2 text-xs font-semibold text-[#9a6d5a] transition hover:border-[#d8b4a5] hover:bg-[#fff3ee] hover:text-[#a34f37]"
                    >
                      Delete
                    </button>
                  </div>

                  {/* SKILLS */}
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span
                        key={`${job.id}-${skill}-${index}`}
                        className="rounded-full border border-[#dfc4b6] bg-[#fff6f1] px-3.5 py-1.5 text-sm font-medium text-[#805544]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* FOOTER */}
                  <div className="flex flex-col gap-4 border-t border-[#f0e2da] pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-[#766961]">
                      <span className="font-semibold text-[#493d36]">
                        {job.applied || 0}
                      </span>
                      Applied
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleManageCandidates(job)}
                        className="rounded-full border border-[#dfc9bd] bg-[#fffdfb] px-5 py-2.5 text-sm font-semibold text-[#6f625b] transition hover:bg-[#fff3ee]"
                      >
                        Manage Candidates
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        className="rounded-full bg-[#f3ded4] px-5 py-2.5 text-sm font-semibold text-[#9f533c] transition hover:bg-[#ecd0c3]"
                      >
                        View Job
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-[#ddc3b6] bg-[#fffdfb] px-6 py-16 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f3ded4] text-2xl text-[#b66348]">
                +
              </div>

              <h2 className="mt-5 text-xl font-semibold text-[#332923]">
                No job postings found
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#82736b]">
                There are no postings matching your current filters. Create a
                new job or clear the filters to see your postings.
              </p>

              <button
                type="button"
                onClick={() => {
                  setDepartmentFilter("All Departments");
                  setStatusFilter("All Statuses");
                }}
                className="mt-5 rounded-full bg-[#d97757] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c96749]"
              >
                Clear Filters
              </button>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* ================================================= */}
      {/* CREATE JOB MODAL */}
      {/* ================================================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29231f]/35 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#ead8ce] bg-[#fffdfb] shadow-[0_30px_100px_rgba(60,40,30,0.2)]">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-[#f0e2da] px-6 py-5 sm:px-8">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#b96a50]">
                  Job Board
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-[#332923]">
                  Create Job Posting
                </h2>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#897971] transition hover:bg-[#fff0eb] hover:text-[#a85a43]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* MODAL CONTENT */}
            <form
              onSubmit={handleSaveJob}
              className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-7"
            >
              <div className="space-y-6">
                {/* JOB TITLE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#594b43]">
                    Job Title
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      handleFormChange("title", e.target.value)
                    }
                    placeholder="e.g. Senior Full-Stack Engineer"
                    className="w-full rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] px-4 py-3.5 text-sm text-[#493d36] outline-none transition placeholder:text-[#a29289] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
                  />
                </div>

                {/* DEPARTMENT */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#594b43]">
                    Department
                  </label>

                  <select
                    value={form.department}
                    onChange={(e) =>
                      handleFormChange("department", e.target.value)
                    }
                    className="w-full rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] px-4 py-3.5 text-sm font-medium text-[#493d36] outline-none transition focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
                  >
                    {DEPARTMENTS.map((department) => (
                      <option key={department}>{department}</option>
                    ))}
                  </select>
                </div>

                {/* SKILLS */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#594b43]">
                    Target Skills / Requirements
                  </label>

                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) =>
                      handleFormChange("skills", e.target.value)
                    }
                    placeholder="React, Node.js, AWS, JavaScript"
                    className="w-full rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] px-4 py-3.5 text-sm text-[#493d36] outline-none transition placeholder:text-[#a29289] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
                  />

                  <p className="mt-2 text-xs text-[#96877f]">
                    Separate each skill or requirement with a comma.
                  </p>
                </div>

                {/* DESCRIPTION BUILDER */}
                <div className="rounded-2xl border border-[#ead8ce] bg-[#fff8f3] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#594b43]">
                        Description Builder
                      </p>

                      <p className="mt-1 max-w-xl text-xs leading-5 text-[#897971]">
                        Fill in the title and target skills, then generate a
                        structured starting description.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#f3ded4] px-5 py-2.5 text-sm font-semibold text-[#9f533c] transition hover:bg-[#ecd0c3]"
                    >
                      <span>✦</span>
                      Generate with AI
                    </button>
                  </div>

                  {generated && (
                    <p className="mt-3 text-xs font-medium text-[#668054]">
                      Description generated. You can edit it before publishing.
                    </p>
                  )}
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#594b43]">
                    Job Description (Final)
                  </label>

                  <textarea
                    rows={9}
                    value={form.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    placeholder="Write the final job description here..."
                    className="w-full resize-y rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] p-4 text-sm leading-6 text-[#493d36] outline-none transition placeholder:text-[#a29289] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
                  />
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-2xl border border-[#edc8bb] bg-[#fff0eb] px-5 py-4">
                    <p className="text-sm text-[#b04f36]">{error}</p>
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#f0e2da] pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-full border border-[#dfc9bd] bg-[#fffdfb] px-6 py-3 text-sm font-semibold text-[#6f625b] transition hover:bg-[#fff3ee]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-full bg-[#d97757] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#d97757]/15 transition hover:bg-[#c96749]"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* JOB DETAILS MODAL */}
      {/* ================================================= */}

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29231f]/35 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#ead8ce] bg-[#fffdfb] shadow-[0_30px_100px_rgba(60,40,30,0.2)]">
            <div className="flex items-start justify-between border-b border-[#f0e2da] px-6 py-5 sm:px-8">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#f3ded4] px-3 py-1 text-xs font-semibold text-[#9f533c]">
                    {selectedJob.department}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedJob.status === "active"
                        ? "bg-[#edf3e9] text-[#5e7550]"
                        : "bg-[#f5eee7] text-[#8b6b56]"
                      }`}
                  >
                    {selectedJob.status === "active" ? "Active" : "Draft"}
                  </span>
                </div>

                <h2 className="mt-3 break-words text-2xl font-semibold text-[#332923]">
                  {selectedJob.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-[#897971] transition hover:bg-[#fff0eb] hover:text-[#a85a43]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#b96a50]">
                  Target Skills
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill, index) => (
                    <span
                      key={`${selectedJob.id}-detail-${index}`}
                      className="rounded-full border border-[#dfc4b6] bg-[#fff6f1] px-3.5 py-1.5 text-sm font-medium text-[#805544]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-7">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#b96a50]">
                  Job Description
                </p>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#665850]">
                  {selectedJob.description}
                </p>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#fff8f3] p-4">
                  <p className="text-xs text-[#96877f]">Applications</p>
                  <p className="mt-1 text-lg font-semibold text-[#493d36]">
                    {selectedJob.applied || 0}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fff8f3] p-4">
                  <p className="text-xs text-[#96877f]">Posted</p>
                  <p className="mt-1 text-sm font-semibold text-[#493d36]">
                    {formatDate(selectedJob.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#f0e2da] px-6 py-5 sm:px-8">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="w-full rounded-full bg-[#d97757] px-6 py-3 font-semibold text-white transition hover:bg-[#c96749]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================================================= */}
      {/* MANAGE CANDIDATES MODEL */}
      {/* ================================================= */}

      {managingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29231f]/35 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#ead8ce] bg-[#fffdfb] shadow-[0_30px_100px_rgba(60,40,30,0.2)]">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-[#f0e2da] px-6 py-5 sm:px-8 shrink-0">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#b96a50]">
                  Candidate Management
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#332923]">
                  {managingJob.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeManageCandidatesModal}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#897971] transition hover:bg-[#fff0eb] hover:text-[#a85a43]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-7 flex-1 bg-[#fff8f3]">
              <div className="space-y-6">
                {/* Resumes Card */}
                <div className="flex flex-col rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(95,65,50,0.06)]">
                  <h2 className="text-xl font-semibold text-[#332923]">Candidate Resumes</h2>
                  <p className="mt-2 mb-5 text-sm leading-6 text-[#82736b]">
                    Upload multiple resumes to compare candidates against the {managingJob.title} description.
                  </p>

                  <div className="mb-5 rounded-2xl border border-dashed border-[#dcb8a8] bg-[#fff8f3] p-5">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      className="block w-full cursor-pointer text-sm text-[#766961] file:mr-4 file:rounded-full file:border-0 file:bg-[#f3ded4] file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-[#a6573e] hover:file:bg-[#ecd0c3] file:transition-colors"
                    />
                  </div>

                  {resumes.length > 0 && (
                    <div className="overflow-y-auto pr-2" style={{ maxHeight: '150px' }}>
                      <ul className="space-y-3">
                        {resumes.map((file, index) => (
                          <li key={index} className="flex items-center justify-between rounded-xl bg-[#fff8f3] border border-[#ead8ce] px-4 py-3 text-sm">
                            <span className="text-[#493d36] font-medium truncate pr-4">{file.name}</span>
                            <button
                              onClick={() => handleRemoveFile(index)}
                              className="text-[#a6573e] hover:text-[#c96749] font-medium text-xs uppercase tracking-wider shrink-0"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="mt-6">
                    <button
                      onClick={handleRank}
                      disabled={rankingLoading || resumes.length === 0}
                      className="w-full rounded-full bg-[#d97757] px-6 py-4 font-semibold text-white shadow-md shadow-[#d97757]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c96749] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-[#d9ccc5] disabled:shadow-none"
                    >
                      {rankingLoading ? 'Ranking Candidates...' : 'Rank Candidates'}
                    </button>
                    {rankingError && (
                      <div className="mt-5 rounded-2xl border border-[#edc8bb] bg-[#fff0eb] px-5 py-4 text-sm text-[#b04f36]">
                        {rankingError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Results */}
                {rankingResults && rankingResults.length === 0 && (
                  <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-8 text-center shadow-[0_12px_35px_rgba(95,65,50,0.03)]">
                    <p className="text-sm text-[#897971]">No candidates could be ranked.</p>
                  </div>
                )}

                {rankingResults && rankingResults.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#b96a50]">
                      Ranking Results
                    </p>
                    <h3 className="mb-6 text-2xl font-semibold tracking-tight text-[#29231f]">
                      Top candidates for {managingJob.title}
                    </h3>

                    <div className="space-y-6">
                      {rankingResults.map((candidate, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-6 rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.04)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                          {/* Position & Basic Info */}
                          <div className="flex w-full md:w-1/3 flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4dfd5] text-xs font-bold text-[#a6573e]">
                                  #{idx + 1}
                                </span>
                                <h4 className="text-2xl font-semibold text-[#29231f] break-words">
                                  {candidate.name}
                                </h4>
                              </div>
                            </div>
                            
                            <div className="mt-6 md:mt-0">
                              <p className="text-[3.5rem] font-extrabold leading-none tracking-tight text-[#d97757]">
                                {candidate.match_score}%
                              </p>
                              <p className="mt-2 font-medium text-[#766961]">Strong Match</p>
                            </div>
                          </div>

                          {/* Breakdown */}
                          <div className="w-full md:w-2/3 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Skills */}
                            <div className="space-y-5">
                              <div className="rounded-2xl border border-[#e3d2c7] bg-[#fdf8f4] p-5">
                                <h5 className="mb-3 text-sm font-semibold text-[#76503f]">Matched Skills</h5>
                                <div className="flex flex-wrap gap-2">
                                  {candidate.details.skill_gap.matched_skills.length > 0 ? (
                                    candidate.details.skill_gap.matched_skills.map((skill, sIdx) => (
                                      <span key={sIdx} className="rounded-full border border-[#d9b8a8] bg-[#f3dfd5] px-3 py-1 text-xs font-medium text-[#95513b]">
                                        {skill}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-[#897971]">None</span>
                                  )}
                                </div>
                              </div>

                              <div className="rounded-2xl border border-[#e8d5cc] bg-[#fff8f3] p-5">
                                <h5 className="mb-3 text-sm font-semibold text-[#76503f]">Missing Skills</h5>
                                <div className="flex flex-wrap gap-2">
                                  {candidate.details.skill_gap.missing_skills.length > 0 ? (
                                    candidate.details.skill_gap.missing_skills.map((skill, sIdx) => (
                                      <span key={sIdx} className="rounded-full border border-[#e5c8bc] bg-[#fff0eb] px-3 py-1 text-xs font-medium text-[#a85a43]">
                                        {skill}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-[#897971]">None</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Scores */}
                            <div className="rounded-2xl border border-[#ead8ce] bg-[#fff8f3] p-5">
                              <h5 className="mb-5 text-sm font-semibold text-[#76503f]">Score Breakdown</h5>
                              <ul className="space-y-4">
                                <li className="flex items-center justify-between">
                                  <span className="text-sm text-[#766961]">Text Similarity</span>
                                  <span className="font-semibold text-[#493d36]">
                                    {Math.round(candidate.details.text_similarity * 100)}%
                                  </span>
                                </li>
                                <li className="flex items-center justify-between">
                                  <span className="text-sm text-[#766961]">Skill Match</span>
                                  <span className="font-semibold text-[#493d36]">
                                    {Math.round(candidate.details.skill_match * 100)}%
                                  </span>
                                </li>
                                <li className="flex items-center justify-between">
                                  <span className="text-sm text-[#766961]">Experience Match</span>
                                  <span className="font-semibold text-[#493d36]">
                                    {Math.round(candidate.details.experience_match * 100)}%
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchingPage;