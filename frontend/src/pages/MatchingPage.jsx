import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const STORAGE_KEY = "recruita_jobs";

const EVALUATED_CANDIDATES_STORAGE_KEY =
  "recruita_evaluated_candidates";

const SHORTLIST_STORAGE_KEY =
  "recruita_shortlisted_candidates";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:8000" : "");

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
  const [departmentFilter, setDepartmentFilter] = useState(
    "All Departments"
  );
  const [statusFilter, setStatusFilter] = useState(
    "All Statuses"
  );

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
  const [shortlistedCandidates, setShortlistedCandidates] =
    useState([]);

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
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(starterJobs)
      );
    } catch (err) {
      console.error("Unable to load Recruita jobs:", err);
      setJobs(starterJobs);
    }
  }, []);

  // --------------------------------------------------
  // LOAD CANDIDATE STATUSES
  // --------------------------------------------------

  useEffect(() => {
    try {
      const storedShortlist = localStorage.getItem(
        SHORTLIST_STORAGE_KEY
      );

      if (storedShortlist) {
        const parsed = JSON.parse(storedShortlist);

        if (Array.isArray(parsed)) {
          setShortlistedCandidates(parsed);
        }
      }
    } catch (err) {
      console.error(
        "Unable to load candidate statuses:",
        err
      );
    }
  }, []);

  // --------------------------------------------------
  // SAVE JOBS
  // --------------------------------------------------

  useEffect(() => {
    if (jobs.length === 0) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(jobs)
      );
    } catch (err) {
      console.error(
        "Unable to save Recruita jobs:",
        err
      );
    }
  }, [jobs]);

  // --------------------------------------------------
  // SAVE CANDIDATE STATUSES
  // --------------------------------------------------

  useEffect(() => {
    try {
      localStorage.setItem(
        SHORTLIST_STORAGE_KEY,
        JSON.stringify(shortlistedCandidates)
      );
    } catch (err) {
      console.error(
        "Unable to save candidate statuses:",
        err
      );
    }
  }, [shortlistedCandidates]);

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
  // CANDIDATE MANAGEMENT
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
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setResumes((prev) => [...prev, ...files]);
    setRankingError("");
    setRankingResults(null);

    // Allow selecting the same file again later.
    e.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setResumes((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // --------------------------------------------------
  // CANDIDATE STATUS HELPERS
  // --------------------------------------------------

  const getCandidateKey = (jobId, candidate) => {
    const candidateId =
      candidate?.candidate_id ||
      candidate?.id ||
      candidate?.name ||
      "unknown-candidate";

    return `${jobId}::${candidateId}`;
  };

  const getCandidateStatus = (candidate) => {
    if (!managingJob) return "New";

    const key = getCandidateKey(
      managingJob.id,
      candidate
    );

    const savedCandidate = shortlistedCandidates.find(
      (item) => item.key === key
    );

    return savedCandidate?.status || "New";
  };

  const updateCandidateStatus = (candidate, status) => {
    if (!managingJob) return;

    const key = getCandidateKey(
      managingJob.id,
      candidate
    );

    setShortlistedCandidates((current) => {
      const existing = current.findIndex(
        (item) => item.key === key
      );

      const candidateRecord = {
        key,
        jobId: managingJob.id,
        jobTitle: managingJob.title,
        candidateId:
          candidate?.candidate_id ||
          candidate?.id ||
          null,
        candidateName:
          candidate?.name || "Unknown Candidate",
        status,
        matchScore: candidate?.match_score ?? 0,
        predictionScore:
          candidate?.prediction_score ?? null,
        updatedAt: new Date().toISOString(),
      };

      if (existing >= 0) {
        const updated = [...current];
        updated[existing] = candidateRecord;
        return updated;
      }

      return [...current, candidateRecord];
    });
  };

  const handleShortlist = (candidate) => {
    updateCandidateStatus(candidate, "Shortlisted");
  };

  const handleReject = (candidate) => {
    updateCandidateStatus(candidate, "Rejected");
  };

  const handleResetCandidateStatus = (candidate) => {
    if (!managingJob) return;

    const key = getCandidateKey(
      managingJob.id,
      candidate
    );

    setShortlistedCandidates((current) =>
      current.filter((item) => item.key !== key)
    );
  };

  // --------------------------------------------------
  // PREDICTION SCORE
  // --------------------------------------------------

  const getPredictionLabel = (score) => {
    if (score === null || score === undefined) {
      return "Prediction unavailable";
    }

    const numericScore = Number(score);

    if (numericScore >= 80) {
      return "Strong Candidate";
    }

    if (numericScore >= 60) {
      return "Promising Candidate";
    }

    if (numericScore >= 40) {
      return "Potential Candidate";
    }

    return "Low Prediction";
  };

  const getPredictionBadgeClass = (score) => {
    if (score === null || score === undefined) {
      return "bg-[#f5eee7] text-[#8b6b56]";
    }

    const numericScore = Number(score);

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

  // --------------------------------------------------
  // SAVE EVALUATED CANDIDATES
  // --------------------------------------------------

  const saveEvaluatedCandidates = (results) => {
    if (!managingJob || !Array.isArray(results)) {
      return;
    }

    try {
      const stored = JSON.parse(
        localStorage.getItem(
          EVALUATED_CANDIDATES_STORAGE_KEY
        ) || "[]"
      );

      const existingCandidates = Array.isArray(stored)
        ? stored
        : [];

      const newCandidates = results.map(
        (candidate, index) => {
          const candidateId =
            candidate?.candidate_id ||
            candidate?.id ||
            null;

          const candidateName =
            candidate?.name ||
            "Unknown Candidate";

          const key = getCandidateKey(
            managingJob.id,
            candidate
          );

          return {
            ...candidate,

            key,

            jobId: managingJob.id,
            jobTitle: managingJob.title,

            candidateId,
            candidateName,

            rank:
              candidate?.rank ??
              index + 1,

            status:
              getCandidateStatus(candidate) ||
              "New",

            evaluatedAt:
              new Date().toISOString(),
          };
        }
      );

      const candidateMap = new Map(
        existingCandidates.map((candidate) => [
          candidate.key,
          candidate,
        ])
      );

      newCandidates.forEach((candidate) => {
        const existing =
          candidateMap.get(candidate.key);

        candidateMap.set(candidate.key, {
          ...existing,
          ...candidate,
        });
      });

      localStorage.setItem(
        EVALUATED_CANDIDATES_STORAGE_KEY,
        JSON.stringify(
          Array.from(candidateMap.values())
        )
      );
    } catch (err) {
      console.error(
        "Unable to save evaluated candidates:",
        err
      );
    }
  };

  // --------------------------------------------------
  // RANK CANDIDATES
  // --------------------------------------------------

  const handleRank = async () => {
    if (!managingJob) return;

    if (resumes.length === 0) {
      setRankingError(
        "Please upload at least one resume."
      );
      return;
    }

    setRankingLoading(true);
    setRankingError("");
    setRankingResults(null);

    try {
      // 1. Parse Job Description
      const jobRes = await axios.post(
        `${API_BASE_URL}/api/v1/jobs/parse`,
        {
          description: managingJob.description,
        }
      );

      const parsedJobData = jobRes.data;

      // 2. Parse all resumes
      const parsedResumes = await Promise.all(
        resumes.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const resumeRes = await axios.post(
            `${API_BASE_URL}/api/v1/resumes/parse`,
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

          return resumeRes.data;
        })
      );

      // 3. Rank candidates
      const rankRes = await axios.post(
        `${API_BASE_URL}/api/v1/candidates/rank`,
        {
          candidates: parsedResumes,
          job_data: parsedJobData,
        }
      );

      const rankedCandidates =
        Array.isArray(rankRes.data)
          ? rankRes.data
          : [];

      // --------------------------------------------------
      // 4. Get prediction output for each candidate
      // --------------------------------------------------

      const recommendationResults =
        await Promise.all(
          parsedResumes.map(async (resume) => {
            try {
              const recommendationRes =
                await axios.post(
                  `${API_BASE_URL}/api/v1/candidates/recommend`,
                  {
                    resume_data: resume,
                    job_data: parsedJobData,
                    predicted_role:
                      resume?.predicted_role ||
                      resume?.role ||
                      "",
                  }
                );

              return {
                resume,
                recommendation:
                  recommendationRes.data,
              };
            } catch (recommendationError) {
              console.warn(
                "Prediction unavailable for candidate:",
                recommendationError
              );

              return {
                resume,
                recommendation: null,
              };
            }
          })
        );

      // --------------------------------------------------
      // 5. Merge prediction scores into ranked candidates
      // --------------------------------------------------

      const enrichedResults =
        rankedCandidates.map((candidate) => {
          const matchingRecommendation =
            recommendationResults.find(
              (item) => {
                const resume = item.resume;

                const candidateId =
                  candidate?.candidate_id ||
                  candidate?.id;

                const resumeId =
                  resume?.candidate_id ||
                  resume?.id;

                if (
                  candidateId !== undefined &&
                  resumeId !== undefined
                ) {
                  return (
                    candidateId === resumeId
                  );
                }

                const candidateName =
                  candidate?.name
                    ?.trim()
                    ?.toLowerCase();

                const resumeName =
                  resume?.name
                    ?.trim()
                    ?.toLowerCase();

                return (
                  candidateName &&
                  resumeName &&
                  candidateName === resumeName
                );
              }
            );

          const recommendation =
            matchingRecommendation?.recommendation;

          return {
            ...candidate,

            prediction_score:
              recommendation?.prediction_score ??
              candidate?.prediction_score ??
              null,

            prediction_label:
              recommendation?.prediction_label ??
              getPredictionLabel(
                recommendation?.prediction_score
              ),

            prediction_outputs:
              recommendation?.prediction_outputs ??
              null,
          };
        });

      // --------------------------------------------------
      // 6. Save evaluated candidates
      // --------------------------------------------------

      saveEvaluatedCandidates(
        enrichedResults
      );

      setRankingResults(enrichedResults);

      // --------------------------------------------------
      // 7. Update applied count for the job
      // --------------------------------------------------

      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job.id === managingJob.id
            ? {
              ...job,
              applied: Math.max(
                Number(job.applied || 0),
                parsedResumes.length
              ),
            }
            : job
        )
      );
    } catch (err) {
      const detail =
        err.response?.data?.detail;

      setRankingError(
        detail ||
        "Unable to complete candidate ranking. Please try again later."
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
      setError(
        "Enter a job title before generating the description."
      );
      return;
    }

    if (skills.length === 0) {
      setError(
        "Add at least one target skill or requirement first."
      );
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
      setError(
        "Add at least one target skill or requirement."
      );
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

    setJobs((current) => [
      newJob,
      ...current,
    ]);

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

    setJobs((current) =>
      current.filter(
        (job) => job.id !== jobId
      )
    );

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
      return new Intl.DateTimeFormat(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      ).format(new Date(date));
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:py-16">
        {/* HEADER */}

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
                Manage your job postings and create structured
                descriptions for the roles you're hiring for.
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
              <span className="text-lg leading-none">
                +
              </span>
              Post New Job
            </button>
          </div>
        </section>

        {/* FILTERS */}

        <section className="mb-7 rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-5 shadow-[0_12px_35px_rgba(95,65,50,0.04)] sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#594b43]">
                Department
              </label>

              <select
                value={departmentFilter}
                onChange={(e) =>
                  setDepartmentFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] px-4 py-3 text-sm font-medium text-[#493d36] outline-none transition focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
              >
                <option>
                  All Departments
                </option>

                {DEPARTMENTS.map(
                  (department) => (
                    <option key={department}>
                      {department}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#594b43]">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] px-4 py-3 text-sm font-medium text-[#493d36] outline-none transition focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
              >
                <option>
                  All Statuses
                </option>

                {STATUSES.map((status) => (
                  <option key={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* COUNT */}

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-medium text-[#766961]">
            {filteredJobs.length}{" "}
            {filteredJobs.length === 1
              ? "posting"
              : "postings"}{" "}
            total
          </p>

          {(departmentFilter !==
            "All Departments" ||
            statusFilter !==
            "All Statuses") && (
              <button
                type="button"
                onClick={() => {
                  setDepartmentFilter(
                    "All Departments"
                  );
                  setStatusFilter(
                    "All Statuses"
                  );
                }}
                className="text-sm font-semibold text-[#b45f45] transition hover:text-[#8f4935]"
              >
                Clear filters
              </button>
            )}
        </div>

        {/* JOB LIST */}

        {filteredJobs.length > 0 ? (
          <section className="space-y-5">
            {filteredJobs.map((job) => (
              <article
                key={job.id}
                className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_14px_40px_rgba(95,65,50,0.045)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(95,65,50,0.08)] sm:p-7"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#f3ded4] px-3 py-1 text-xs font-semibold text-[#9f533c]">
                          {job.department}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${job.status ===
                              "active"
                              ? "bg-[#edf3e9] text-[#5e7550]"
                              : "bg-[#f5eee7] text-[#8b6b56]"
                            }`}
                        >
                          {job.status ===
                            "active"
                            ? "Active"
                            : "Draft"}
                        </span>
                      </div>

                      <h2 className="break-words text-2xl font-semibold tracking-[-0.02em] text-[#332923]">
                        {job.title}
                      </h2>

                      <p className="mt-2 text-sm text-[#96877f]">
                        Posted{" "}
                        {formatDate(
                          job.createdAt
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteJob(
                          job.id
                        )
                      }
                      className="self-start rounded-full border border-[#ead8ce] px-4 py-2 text-xs font-semibold text-[#9a6d5a] transition hover:border-[#d8b4a5] hover:bg-[#fff3ee] hover:text-[#a34f37]"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(
                      (skill, index) => (
                        <span
                          key={`${job.id}-${skill}-${index}`}
                          className="rounded-full border border-[#dfc4b6] bg-[#fff6f1] px-3.5 py-1.5 text-sm font-medium text-[#805544]"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex flex-col gap-4 border-t border-[#f0e2da] pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-[#766961]">
                      <span className="font-semibold text-[#493d36]">
                        {job.applied ||
                          0}
                      </span>
                      Applied
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleManageCandidates(
                            job
                          )
                        }
                        className="rounded-full border border-[#dfc9bd] bg-[#fffdfb] px-5 py-2.5 text-sm font-semibold text-[#6f625b] transition hover:bg-[#fff3ee]"
                      >
                        Manage Candidates
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedJob(job)
                        }
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
                There are no postings matching your current
                filters. Create a new job or clear the filters
                to see your postings.
              </p>

              <button
                type="button"
                onClick={() => {
                  setDepartmentFilter(
                    "All Departments"
                  );
                  setStatusFilter(
                    "All Statuses"
                  );
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

            <form
              onSubmit={handleSaveJob}
              className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-7"
            >
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#594b43]">
                    Job Title
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      handleFormChange(
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Senior Full-Stack Engineer"
                    className="w-full rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] px-4 py-3.5 text-sm text-[#493d36] outline-none transition placeholder:text-[#a29289] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#594b43]">
                    Department
                  </label>

                  <select
                    value={
                      form.department
                    }
                    onChange={(e) =>
                      handleFormChange(
                        "department",
                        e.target.value
                      )
                    }
                    className="w-full rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] px-4 py-3.5 text-sm font-medium text-[#493d36] outline-none transition focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
                  >
                    {DEPARTMENTS.map(
                      (department) => (
                        <option
                          key={department}
                        >
                          {department}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#594b43]">
                    Target Skills /
                    Requirements
                  </label>

                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) =>
                      handleFormChange(
                        "skills",
                        e.target.value
                      )
                    }
                    placeholder="React, Node.js, AWS, JavaScript"
                    className="w-full rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] px-4 py-3.5 text-sm text-[#493d36] outline-none transition placeholder:text-[#a29289] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
                  />

                  <p className="mt-2 text-xs text-[#96877f]">
                    Separate each skill or
                    requirement with a comma.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#ead8ce] bg-[#fff8f3] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#594b43]">
                        Description Builder
                      </p>

                      <p className="mt-1 max-w-xl text-xs leading-5 text-[#897971]">
                        Fill in the title and target
                        skills, then generate a
                        structured starting description.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleGenerateDescription
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#f3ded4] px-5 py-2.5 text-sm font-semibold text-[#9f533c] transition hover:bg-[#ecd0c3]"
                    >
                      <span>✦</span>
                      Generate with AI
                    </button>
                  </div>

                  {generated && (
                    <p className="mt-3 text-xs font-medium text-[#668054]">
                      Description generated. You can
                      edit it before publishing.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#594b43]">
                    Job Description (Final)
                  </label>

                  <textarea
                    rows={9}
                    value={form.description}
                    onChange={(e) =>
                      handleFormChange(
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Write the final job description here..."
                    className="w-full resize-y rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] p-4 text-sm leading-6 text-[#493d36] outline-none transition placeholder:text-[#a29289] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-[#edc8bb] bg-[#fff0eb] px-5 py-4">
                    <p className="text-sm text-[#b04f36]">
                      {error}
                    </p>
                  </div>
                )}
              </div>

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
                    {
                      selectedJob.department
                    }
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedJob.status ===
                        "active"
                        ? "bg-[#edf3e9] text-[#5e7550]"
                        : "bg-[#f5eee7] text-[#8b6b56]"
                      }`}
                  >
                    {selectedJob.status ===
                      "active"
                      ? "Active"
                      : "Draft"}
                  </span>
                </div>

                <h2 className="mt-3 break-words text-2xl font-semibold text-[#332923]">
                  {selectedJob.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedJob(null)
                }
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
                  {selectedJob.skills.map(
                    (skill, index) => (
                      <span
                        key={`${selectedJob.id}-detail-${index}`}
                        className="rounded-full border border-[#dfc4b6] bg-[#fff6f1] px-3.5 py-1.5 text-sm font-medium text-[#805544]"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="mt-7">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#b96a50]">
                  Job Description
                </p>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#665850]">
                  {
                    selectedJob.description
                  }
                </p>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#fff8f3] p-4">
                  <p className="text-xs text-[#96877f]">
                    Applications
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#493d36]">
                    {selectedJob.applied ||
                      0}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fff8f3] p-4">
                  <p className="text-xs text-[#96877f]">
                    Posted
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#493d36]">
                    {formatDate(
                      selectedJob.createdAt
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#f0e2da] px-6 py-5 sm:px-8">
              <button
                type="button"
                onClick={() =>
                  setSelectedJob(null)
                }
                className="w-full rounded-full bg-[#d97757] px-6 py-3 font-semibold text-white transition hover:bg-[#c96749]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MANAGE CANDIDATES MODAL */}
      {/* ================================================= */}

      {managingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29231f]/35 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#ead8ce] bg-[#fffdfb] shadow-[0_30px_100px_rgba(60,40,30,0.2)]">
            {/* MODAL HEADER */}

            <div className="flex shrink-0 items-start justify-between border-b border-[#f0e2da] px-6 py-5 sm:px-8">
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
                onClick={
                  closeManageCandidatesModal
                }
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#897971] transition hover:bg-[#fff0eb] hover:text-[#a85a43]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div className="flex-1 overflow-y-auto bg-[#fff8f3] px-6 py-6 sm:px-8 sm:py-7">
              <div className="space-y-6">
                {/* RESUME UPLOAD */}

                <div className="flex flex-col rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(95,65,50,0.06)]">
                  <h2 className="text-xl font-semibold text-[#332923]">
                    Candidate Resumes
                  </h2>

                  <p className="mt-2 mb-5 text-sm leading-6 text-[#82736b]">
                    Upload multiple resumes to compare
                    candidates against the{" "}
                    {managingJob.title} description.
                  </p>

                  <div className="mb-5 rounded-2xl border border-dashed border-[#dcb8a8] bg-[#fff8f3] p-5">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.txt"
                      onChange={
                        handleFileChange
                      }
                      className="block w-full cursor-pointer text-sm text-[#766961] file:mr-4 file:rounded-full file:border-0 file:bg-[#f3ded4] file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-[#a6573e] hover:file:bg-[#ecd0c3] file:transition-colors"
                    />
                  </div>

                  {resumes.length > 0 && (
                    <div
                      className="overflow-y-auto pr-2"
                      style={{
                        maxHeight: "150px",
                      }}
                    >
                      <ul className="space-y-3">
                        {resumes.map(
                          (file, index) => (
                            <li
                              key={`${file.name}-${index}`}
                              className="flex items-center justify-between rounded-xl border border-[#ead8ce] bg-[#fff8f3] px-4 py-3 text-sm"
                            >
                              <span className="truncate pr-4 font-medium text-[#493d36]">
                                {file.name}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveFile(
                                    index
                                  )
                                }
                                className="shrink-0 text-xs font-medium uppercase tracking-wider text-[#a6573e] hover:text-[#c96749]"
                              >
                                Remove
                              </button>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleRank}
                      disabled={
                        rankingLoading ||
                        resumes.length === 0
                      }
                      className="w-full rounded-full bg-[#d97757] px-6 py-4 font-semibold text-white shadow-md shadow-[#d97757]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c96749] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-[#d9ccc5] disabled:shadow-none"
                    >
                      {rankingLoading
                        ? "Evaluating Candidates..."
                        : "Rank & Evaluate Candidates"}
                    </button>

                    {rankingError && (
                      <div className="mt-5 rounded-2xl border border-[#edc8bb] bg-[#fff0eb] px-5 py-4 text-sm text-[#b04f36]">
                        {rankingError}
                      </div>
                    )}
                  </div>
                </div>

                {/* EMPTY RESULTS */}

                {rankingResults &&
                  rankingResults.length === 0 && (
                    <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-8 text-center shadow-[0_12px_35px_rgba(95,65,50,0.03)]">
                      <p className="text-sm text-[#897971]">
                        No candidates could be
                        ranked.
                      </p>
                    </div>
                  )}

                {/* RESULTS */}

                {rankingResults &&
                  rankingResults.length > 0 && (
                    <div>
                      <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#b96a50]">
                        Ranking Results
                      </p>

                      <h3 className="mb-6 text-2xl font-semibold tracking-tight text-[#29231f]">
                        Top candidates for{" "}
                        {managingJob.title}
                      </h3>

                      <div className="space-y-6">
                        {rankingResults.map(
                          (
                            candidate,
                            idx
                          ) => {
                            const status =
                              getCandidateStatus(
                                candidate
                              );

                            const predictionScore =
                              candidate?.prediction_score;

                            const predictionLabel =
                              candidate?.prediction_label ||
                              getPredictionLabel(
                                predictionScore
                              );

                            const skillGap =
                              candidate?.details
                                ?.skill_gap ||
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

                            return (
                              <div
                                key={
                                  candidate?.candidate_id ||
                                  candidate?.id ||
                                  `${candidate?.name}-${idx}`
                                }
                                className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                              >
                                {/* TOP CANDIDATE HEADER */}

                                <div className="flex flex-col gap-5 border-b border-[#f0e2da] pb-5">
                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-3">
                                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4dfd5] text-xs font-bold text-[#a6573e]">
                                        #
                                        {candidate?.rank ??
                                          idx + 1}
                                      </span>

                                      <div className="min-w-0">
                                        <h4 className="break-words text-2xl font-semibold text-[#29231f]">
                                          {candidate.name ||
                                            "Unknown Candidate"}
                                        </h4>

                                        <span
                                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status ===
                                              "Shortlisted"
                                              ? "bg-[#e9f2e5] text-[#58734c]"
                                              : status ===
                                                "Rejected"
                                                ? "bg-[#fff0eb] text-[#a34f37]"
                                                : "bg-[#f5eee7] text-[#8b6b56]"
                                            }`}
                                        >
                                          {status}
                                        </span>
                                      </div>
                                    </div>

                                    {/* MATCH + PREDICTION */}

                                    <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
                                      <div className="rounded-2xl bg-[#fff8f3] p-4">
                                        <p className="text-xs font-medium text-[#96877f]">
                                          Match Score
                                        </p>

                                        <p className="mt-1 text-3xl font-extrabold leading-none text-[#d97757]">
                                          {Number(
                                            candidate.match_score ||
                                            0
                                          ).toFixed(1)}
                                          %
                                        </p>

                                        <p className="mt-2 text-xs font-medium text-[#766961]">
                                          Resume ↔ Job
                                        </p>
                                      </div>

                                      <div className="rounded-2xl bg-[#fff8f3] p-4">
                                        <p className="text-xs font-medium text-[#96877f]">
                                          Prediction Score
                                        </p>

                                        <p className="mt-1 text-3xl font-extrabold leading-none text-[#8f5a45]">
                                          {predictionScore !==
                                            null &&
                                            predictionScore !==
                                            undefined
                                            ? `${Number(
                                              predictionScore
                                            ).toFixed(
                                              1
                                            )}%`
                                            : "—"}
                                        </p>

                                        <span
                                          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getPredictionBadgeClass(
                                            predictionScore
                                          )}`}
                                        >
                                          {
                                            predictionLabel
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* STATUS ACTIONS */}

                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <p className="text-xs uppercase tracking-[0.14em] text-[#a28f86]">
                                        Candidate decision
                                      </p>

                                      <p className="mt-1 text-sm text-[#766961]">
                                        Choose the next stage for
                                        this candidate.
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleShortlist(
                                            candidate
                                          )
                                        }
                                        className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${status ===
                                            "Shortlisted"
                                            ? "bg-[#5f7952] text-white shadow-sm"
                                            : "border border-[#b9ccb0] bg-[#f1f6ee] text-[#58734c] hover:bg-[#e5efdf]"
                                          }`}
                                      >
                                        ✓{" "}
                                        {status ===
                                          "Shortlisted"
                                          ? "Shortlisted"
                                          : "Shortlist"}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleReject(
                                            candidate
                                          )
                                        }
                                        className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${status ===
                                            "Rejected"
                                            ? "bg-[#a6533a] text-white shadow-sm"
                                            : "border border-[#e5c1b5] bg-[#fff2ed] text-[#a6533a] hover:bg-[#ffe6df]"
                                          }`}
                                      >
                                        ×{" "}
                                        {status ===
                                          "Rejected"
                                          ? "Rejected"
                                          : "Reject"}
                                      </button>

                                      {status !==
                                        "New" && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleResetCandidateStatus(
                                                candidate
                                              )
                                            }
                                            className="rounded-full border border-[#dfc9bd] bg-[#fffdfb] px-4 py-2.5 text-sm font-semibold text-[#766961] transition hover:bg-[#fff3ee]"
                                          >
                                            Reset
                                          </button>
                                        )}
                                    </div>
                                  </div>
                                </div>

                                {/* CANDIDATE DETAILS */}

                                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                                  {/* MATCHED SKILLS */}

                                  <div className="rounded-2xl border border-[#e3d2c7] bg-[#fdf8f4] p-5">
                                    <h5 className="mb-3 text-sm font-semibold text-[#76503f]">
                                      Matched Skills
                                    </h5>

                                    <div className="flex flex-wrap gap-2">
                                      {matchedSkills.length >
                                        0 ? (
                                        matchedSkills.map(
                                          (
                                            skill,
                                            skillIndex
                                          ) => (
                                            <span
                                              key={
                                                skillIndex
                                              }
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

                                  {/* MISSING SKILLS */}

                                  <div className="rounded-2xl border border-[#e8d5cc] bg-[#fff8f3] p-5">
                                    <h5 className="mb-3 text-sm font-semibold text-[#76503f]">
                                      Missing Skills
                                    </h5>

                                    <div className="flex flex-wrap gap-2">
                                      {missingSkills.length >
                                        0 ? (
                                        missingSkills.map(
                                          (
                                            skill,
                                            skillIndex
                                          ) => (
                                            <span
                                              key={
                                                skillIndex
                                              }
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

                                  {/* SCORE BREAKDOWN */}

                                  <div className="rounded-2xl border border-[#ead8ce] bg-[#fff8f3] p-5">
                                    <h5 className="mb-5 text-sm font-semibold text-[#76503f]">
                                      Score Breakdown
                                    </h5>

                                    <ul className="space-y-4">
                                      <li className="flex items-center justify-between">
                                        <span className="text-sm text-[#766961]">
                                          Text Similarity
                                        </span>

                                        <span className="font-semibold text-[#493d36]">
                                          {Math.round(
                                            Number(
                                              candidate
                                                ?.details
                                                ?.text_similarity ||
                                              0
                                            ) * 100
                                          )}
                                          %
                                        </span>
                                      </li>

                                      <li className="flex items-center justify-between">
                                        <span className="text-sm text-[#766961]">
                                          Skill Match
                                        </span>

                                        <span className="font-semibold text-[#493d36]">
                                          {Math.round(
                                            Number(
                                              candidate
                                                ?.details
                                                ?.skill_match ||
                                              0
                                            ) * 100
                                          )}
                                          %
                                        </span>
                                      </li>

                                      <li className="flex items-center justify-between">
                                        <span className="text-sm text-[#766961]">
                                          Experience Match
                                        </span>

                                        <span className="font-semibold text-[#493d36]">
                                          {Math.round(
                                            Number(
                                              candidate
                                                ?.details
                                                ?.experience_match ||
                                              0
                                            ) * 100
                                          )}
                                          %
                                        </span>
                                      </li>

                                      <li className="flex items-center justify-between border-t border-[#ead8ce] pt-4">
                                        <span className="text-sm font-medium text-[#594b43]">
                                          Prediction
                                        </span>

                                        <span className="font-semibold text-[#8f5a45]">
                                          {predictionScore !==
                                            null &&
                                            predictionScore !==
                                            undefined
                                            ? `${Number(
                                              predictionScore
                                            ).toFixed(
                                              1
                                            )}%`
                                            : "Unavailable"}
                                        </span>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
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