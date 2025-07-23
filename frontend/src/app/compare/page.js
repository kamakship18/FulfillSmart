'use client';

import { useState, useEffect } from 'react';
import NoDataState from '@/components/NoDataState';

// Cost vs Time comparison
export default function Compare() {
  const [hasSimulationData, setHasSimulationData] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('simulationResults');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        if (data && data.length > 0) {
          setHasSimulationData(true);
        }
      } catch (e) {
        // Invalid data, don't set hasSimulationData to true
        console.error('Invalid simulation data in localStorage');
      }
    }
  }, []);

  if (!hasSimulationData) {
    return (
      <NoDataState 
        title="Comparison Tool Unavailable"
        description="Upload your logistics data to compare different scenarios, analyze cost vs time tradeoffs, and evaluate optimization strategies."
        icon="⚖️"
        showUploadButton={true}
        showDemoButton={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Cost vs Time Comparison</h1>
        <p className="text-gray-600 mb-8">Compare different logistics scenarios for cost and time optimization</p>
        
        {/* Comparison tool will be implemented here */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Comparison Tool Coming Soon</h2>
          <p className="text-gray-600">Advanced comparison features are being developed.</p>
        </div>
      </div>
    </div>
  );
}
