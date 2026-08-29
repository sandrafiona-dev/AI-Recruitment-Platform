import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000" : "");

function ResumeParserPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/resumes/parse`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error uploading file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-12 sm:px-10 lg:py-16">
        {/* Page introduction */}
        <section className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#b96a50]">
            Resume intelligence
          </p>

          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#29231f] sm:text-5xl">
            Resume Parser
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-[#766961] sm:text-lg">
            Upload a resume and let Recruita identify the candidate's role,
            contact details, and key skills.
          </p>
        </section>

        {/* Upload section */}
        <section className="rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(95,65,50,0.06)] sm:p-8">
          <div className="rounded-2xl border border-dashed border-[#dcb8a8] bg-[#fff8f3] p-5 sm:p-6">
            <label
              htmlFor="resume-upload"
              className="mb-3 block text-sm font-medium text-[#594b43]"
            >
              Choose your resume
            </label>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="block w-full cursor-pointer text-sm text-[#766961]
                  file:mr-4 file:rounded-full file:border-0
                  file:bg-[#f3ded4] file:px-5 file:py-2.5
                  file:text-sm file:font-semibold file:text-[#a6573e]
                  file:transition-colors
                  hover:file:bg-[#ecd0c3]"
              />

              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className="shrink-0 rounded-full bg-[#d97757] px-6 py-3 text-sm font-semibold text-white
                  shadow-md shadow-[#d97757]/15
                  transition-all duration-300
                  hover:-translate-y-0.5 hover:bg-[#c96749] hover:shadow-lg
                  disabled:cursor-not-allowed disabled:bg-[#d9ccc5] disabled:shadow-none"
              >
                {loading ? 'Processing...' : 'Upload & Parse'}
              </button>
            </div>

            {file && !error && (
              <p className="mt-4 text-sm text-[#6f625b] truncate">
                Selected: <span className="font-medium text-[#493d36]">{file.name}</span>
              </p>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-[#edc8bb] bg-[#fff0eb] px-4 py-3">
                <p className="text-sm text-[#b04f36]">{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Results */}
        {result && (
          <section className="mt-8 rounded-3xl border border-[#ead8ce] bg-[#fffdfb] p-6 shadow-[0_18px_50px_rgba(95,65,50,0.06)] sm:p-8">
            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#b96a50]">
                  Analysis complete
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#29231f]">
                  Resume Results
                </h2>
              </div>

              <span className="w-fit rounded-full bg-[#f4dfd5] px-4 py-2 text-xs font-semibold text-[#a6573e]">
                Parsed successfully
              </span>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#ead8ce] bg-[#fff8f3] p-5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#907e74]">
                  Predicted Role
                </p>

                <p className="mt-3 text-xl font-semibold text-[#c86445] break-words">
                  {result.predicted_role}
                </p>
              </div>

              <div className="rounded-2xl border border-[#ead8ce] bg-[#fff8f3] p-5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#907e74]">
                  Contact Info
                </p>

                <div className="mt-3 space-y-1 text-sm text-[#594b43]">
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    {result.email || 'Not found'}
                  </p>

                  <p>
                    <span className="font-medium">Phone:</span>{' '}
                    {result.phone || 'Not found'}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6 rounded-2xl border border-[#ead8ce] bg-[#fff8f3] p-5">
              <div className="mb-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#907e74]">
                  Extracted Skills
                </p>

                <p className="mt-1 text-sm text-[#766961]">
                  Skills identified from the uploaded resume.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {result.skills && result.skills.length > 0 ? (
                  result.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-[#e5c4b5] bg-[#f7e5dc] px-3.5 py-1.5 text-sm font-medium text-[#9f533c]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm italic text-[#897971]">
                    No skills explicitly matched.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ResumeParserPage;