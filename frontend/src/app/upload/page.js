'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadAndSimulate } from '@/utils/api';

export default function Upload() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [breakEvenVolume, setBreakEvenVolume] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [demandMultiplier, setDemandMultiplier] = useState('1.0');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.name.endsWith('.xlsx')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a valid Excel (.xlsx) file');
        setSelectedFile(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedFile) {
      setError('Please select an Excel file');
      return;
    }

    if (!breakEvenVolume || !targetTime) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('breakEvenVolume', breakEvenVolume);
      formData.append('targetTime', targetTime);
      formData.append('demandMultiplier', demandMultiplier);

      const result = await uploadAndSimulate(formData);
      
      // Save results to localStorage for the dashboard
      localStorage.setItem('simulationResults', JSON.stringify(result.data));
      
      setSuccess('Simulation completed successfully!');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload and simulate data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-700 mb-4">
            Upload Logistics Data
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your Excel file with logistics data and configure simulation parameters 
            to optimize your supply chain network.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl shadow-lg bg-white p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload Section */}
            <div>
              <label className="block text-lg font-semibold text-indigo-700 mb-4">
                Excel File Upload
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="text-lg font-medium text-gray-700 mb-2">
                    {selectedFile ? selectedFile.name : 'Drop your Excel file here'}
                  </div>
                  <div className="text-gray-500">
                    {selectedFile ? 'File selected' : 'or click to browse (.xlsx files only)'}
                  </div>
                </label>
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Break-even Volume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break-even Volume *
                </label>
                <input
                  type="number"
                  value={breakEvenVolume}
                  onChange={(e) => setBreakEvenVolume(e.target.value)}
                  placeholder="Enter volume (e.g., 1000)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum volume required for RDC viability
                </p>
              </div>

              {/* Target Delivery Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Delivery Time (hours) *
                </label>
                <input
                  type="number"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  placeholder="Enter hours (e.g., 24)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum acceptable delivery time
                </p>
              </div>
            </div>

            {/* Demand Multiplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Future Demand Multiplier
              </label>
              <select
                value={demandMultiplier}
                onChange={(e) => setDemandMultiplier(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="1.0">1.0x (Current demand)</option>
                <option value="1.5">1.5x (50% increase)</option>
                <option value="2.0">2.0x (Double demand)</option>
                <option value="3.0">3.0x (Triple demand)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Factor to scale future demand projections
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-700">{success}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl shadow-lg font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running Simulation...
                  </>
                ) : (
                  'Run Simulation'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800">Excel Format</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Upload .xlsx files with columns: City, Demand, Coordinates, Distance
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800">Fast Processing</h3>
            </div>
            <p className="text-gray-600 text-sm">
              AI-powered analysis completes in under 30 seconds
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800">Detailed Results</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Get cost analysis, optimal locations, and interactive maps
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
