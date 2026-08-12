import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
      // Backend URL assumes running locally on default 8000
      const response = await axios.post('http://localhost:8000/api/v1/resumes/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error uploading file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-slate-800">Resume Parser & Classifier</h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload Resume (PDF, DOCX, TXT)
            </label>
            <div className="flex gap-4">
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
              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-slate-300"
              >
                {loading ? 'Processing...' : 'Upload & Parse'}
              </button>
            </div>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>

          {result && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-slate-700">Predicted Role</h3>
                  <p className="text-lg text-indigo-600 font-semibold">{result.predicted_role}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-slate-700">Contact Info</h3>
                  <p>Email: {result.email || 'Not found'}</p>
                  <p>Phone: {result.phone || 'Not found'}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-slate-700 mb-2">Extracted Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills && result.skills.length > 0 ? (
                    result.skills.map((skill, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-500 italic">No skills explicitly matched.</p>
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

export default ResumeParserPage;
