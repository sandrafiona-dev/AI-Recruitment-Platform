import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_BASE_URL = 'http://localhost:8000';

function RankingPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rankingResults, setRankingResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setResumes((prev) => [...prev, ...files]);
    setError('');
    setRankingResults(null);
  };

  const handleRemoveFile = (index) => {
    setResumes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRank = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    }
    if (resumes.length === 0) {
      setError('Please upload at least one resume.');
      return;
    }

    setLoading(true);
    setError('');
    setRankingResults(null);

    try {
      // 1. Parse Job Description
      const jobRes = await axios.post(`${API_BASE_URL}/api/v1/jobs/parse`, {
        description: jobDescription,
      });
      const parsedJobData = jobRes.data;

      // 2. Parse all resumes
      const parsedResumes = await Promise.all(
        resumes.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const resumeRes = await axios.post(
            `${API_BASE_URL}/api/v1/resumes/parse`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
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

      // 4. Persist session to Dashboard
      try {
        const storedSessions = JSON.parse(localStorage.getItem('recruitaSessions') || '[]');
        const newSession = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          jobTitle: parsedJobData.job_title || 'Untitled Role',
          candidateCount: parsedResumes.length,
          strongMatches: rankRes.data.filter(c => c.match_score >= 80).length,
          topCandidates: rankRes.data.slice(0, 3).map(c => ({
            name: c.name,
            score: c.match_score
          }))
        };
        localStorage.setItem('recruitaSessions', JSON.stringify([newSession, ...storedSessions]));
      } catch (e) {
        // Silent catch for localStorage issues in production
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        detail || 'Unable to complete candidate ranking. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:py-16">
        {/* Page introduction */}
        <section className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#b96a50]">
            Candidate Ranking
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#29231f] sm:text-5xl">
            Find the strongest candidates.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#766961] sm:text-lg">
            Compare multiple resumes against one job description and let Recruita surface the strongest matches.
          </p>
        </section>

        {/* Inputs */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Job Description Card */}
          <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(95,65,50,0.06)] sm:p-8">
            <h2 className="text-xl font-semibold text-[#332923]">Job Description</h2>
            <p className="mt-2 mb-5 text-sm leading-6 text-[#82736b]">
              Tell Recruita what you're looking for.
            </p>
            <textarea
              rows={9}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full resize-none rounded-2xl border border-[#dfc9bd] bg-[#fff8f3] p-4 text-sm text-[#493d36] shadow-sm outline-none transition placeholder:text-[#a29289] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/15"
              placeholder="Paste the job description here..."
            />
          </div>

          {/* Resumes Card */}
          <div className="flex flex-col rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(95,65,50,0.06)] sm:p-8">
            <h2 className="text-xl font-semibold text-[#332923]">Candidate Resumes</h2>
            <p className="mt-2 mb-5 text-sm leading-6 text-[#82736b]">
              Upload multiple resumes to compare candidates for this role.
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
              <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: '200px' }}>
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
          </div>
        </section>

        {/* Action Button */}
        <section className="mt-8">
          <button
            onClick={handleRank}
            disabled={loading || !jobDescription.trim() || resumes.length === 0}
            className="w-full rounded-full bg-[#d97757] px-6 py-4 font-semibold text-white shadow-md shadow-[#d97757]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c96749] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-[#d9ccc5] disabled:shadow-none"
          >
            {loading ? 'Ranking Candidates...' : 'Rank Candidates'}
          </button>
          {error && (
            <div className="mt-5 rounded-2xl border border-[#edc8bb] bg-[#fff0eb] px-5 py-4 text-sm text-[#b04f36]">
              {error}
            </div>
          )}
        </section>

        {/* Results */}
        <section className="mt-12">
          {!rankingResults && !loading && !error && (
            <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-12 text-center shadow-[0_12px_35px_rgba(95,65,50,0.03)]">
              <p className="text-sm text-[#897971]">Your ranked candidates will appear here.</p>
            </div>
          )}

          {rankingResults && rankingResults.length === 0 && (
            <div className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-12 text-center shadow-[0_12px_35px_rgba(95,65,50,0.03)]">
              <p className="text-sm text-[#897971]">No candidates could be ranked.</p>
            </div>
          )}

          {rankingResults && rankingResults.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#b96a50]">
                Candidate Ranking
              </p>
              <h3 className="mb-6 text-2xl font-semibold tracking-tight text-[#29231f]">
                Top candidates for this role
              </h3>

              <div className="space-y-6">
                {rankingResults.map((candidate, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-6 rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_12px_35px_rgba(95,65,50,0.04)] sm:p-8 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
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
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default RankingPage;
