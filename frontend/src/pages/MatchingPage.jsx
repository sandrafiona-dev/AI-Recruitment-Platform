import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MatchingPage() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError('Please upload a resume.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError('');

    try {
      // 1. Parse Resume
      const formData = new FormData();
      formData.append('file', resumeFile);
      const resumeRes = await axios.post('http://localhost:8000/api/v1/resumes/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const resumeData = resumeRes.data;

      // 2. Parse Job Description
      const jobRes = await axios.post('http://localhost:8000/api/v1/jobs/parse', {
        description: jobDescription
      });
      const jobData = jobRes.data;

      // 3. Match
      const matchRes = await axios.post('http://localhost:8000/api/v1/matching/match', {
        resume_data: resumeData,
        job_data: jobData
      });
      const matchData = matchRes.data;

      // 4. Recommend Roles
      const recommendRes = await axios.post('http://localhost:8000/api/v1/jobs/recommend', {
        skills: resumeData.skills
      });
      const recommendData = recommendRes.data;

      setResult({
        predicted_role: resumeData.predicted_role,
        match: matchData,
        recommendations: recommendData
      });
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Error during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-slate-800">Resume-to-Job Matching</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                1. Upload Candidate Resume
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                2. Paste Job Description
              </label>
              <textarea
                rows={5}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Paste the job description here..."
              ></textarea>
            </div>
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={loading || !resumeFile || !jobDescription}
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 disabled:bg-slate-300 font-semibold"
          >
            {loading ? 'Analyzing Candidate...' : 'Analyze Candidate'}
          </button>
          
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

          {result && (
            <div className="mt-10 border-t pt-8 space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800">Match Score</h2>
                <div className="text-5xl font-extrabold text-indigo-600 mt-2">
                  {result.match.match_score}%
                </div>
                <p className="text-slate-500 mt-1">Predicted Role: {result.predicted_role}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                  <h3 className="text-lg font-semibold mb-4 text-slate-800">Skill Gap Analysis</h3>
                  <div className="mb-2">
                    <span className="font-medium text-green-700">Matched Skills ({result.match.skill_gap.matched_skills.length}):</span>
                    <p className="text-sm text-slate-600 mt-1">
                      {result.match.skill_gap.matched_skills.join(', ') || 'None'}
                    </p>
                  </div>
                  <div className="mt-4">
                    <span className="font-medium text-red-700">Missing Skills ({result.match.skill_gap.missing_skills.length}):</span>
                    <p className="text-sm text-slate-600 mt-1">
                      {result.match.skill_gap.missing_skills.join(', ') || 'None'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                  <h3 className="text-lg font-semibold mb-4 text-slate-800">Recommended Roles</h3>
                  {result.recommendations && result.recommendations.length > 0 ? (
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <span className="font-medium text-slate-700">{rec.role}</span>
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-semibold">
                            {rec.score}% Match
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">No strong role matches found.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default MatchingPage;
