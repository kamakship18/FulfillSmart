'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Filter, Download } from 'lucide-react';
import { getInsightsData } from '@/utils/api';
import CostServiceChart from '@/components/CostServiceChart';
import SavingsDistributionChart from '@/components/SavingsDistributionChart';
import VolumeVsSavingsChart from '@/components/VolumeVsSavingsChart';
import TradeoffMatrix from '@/components/TradeoffMatrix';
import NoDataState from '@/components/NoDataState';

export default function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('cost-service');
  const [filters, setFilters] = useState({
    city: [],
    orderType: [],
    minVolume: 0,
    savingsThreshold: -100
  });
  const [hasSimulationData, setHasSimulationData] = useState(false);

  // Check if simulation data exists
  useEffect(() => {
    const storedData = localStorage.getItem('simulationResults');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        if (data && data.length > 0) {
          setHasSimulationData(true);
        } else {
          // Clear invalid data
          localStorage.removeItem('simulationResults');
          setError('No valid simulation data found. Please upload a file and run a simulation first.');
          setLoading(false);
        }
      } catch (e) {
        // Clear corrupted data
        localStorage.removeItem('simulationResults');
        setError('Invalid simulation data found. Please upload a file and run a new simulation.');
        setLoading(false);
      }
    } else {
      setError('No simulation data found. Please upload a file and run a simulation first.');
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    if (!hasSimulationData) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await getInsightsData(filters);
      setData(result);
    } catch (err) {
      console.error('API Error:', err);
      if (err.response?.status === 404 || err.message.includes('No simulation data available')) {
        // Backend has no data, clear localStorage and show NoDataState
        localStorage.removeItem('simulationResults');
        setHasSimulationData(false);
        setError('No simulation data found on server. Please upload a file and run a simulation first.');
      } else if (err.response?.status === 500) {
        // Server error, likely due to empty data, clear localStorage
        localStorage.removeItem('simulationResults');
        setHasSimulationData(false);
        setError('Simulation data error. Please upload a file and run a new simulation.');
      } else {
        setError(err.message || 'Failed to load insights data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasSimulationData) {
      fetchData();
    }
  }, [filters, hasSimulationData]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const tabs = [
    { id: 'cost-service', label: 'Cost vs Service Impact', icon: '📈' },
    { id: 'savings-distribution', label: 'Savings Distribution', icon: '📊' },
    { id: 'volume-savings', label: 'Volume vs Savings', icon: '📉' },
    { id: 'tradeoff-matrix', label: 'City-level Tradeoff Matrix', icon: '📋' }
  ];

  const renderTabContent = () => {
    if (!data) return null;

    switch (activeTab) {
      case 'cost-service':
        return <CostServiceChart data={data.charts?.costVsTime || []} />;
      case 'savings-distribution':
        return <SavingsDistributionChart data={data.charts || {}} />;
      case 'volume-savings':
        return <VolumeVsSavingsChart data={data.charts?.volumeVsSavings || []} />;
      case 'tradeoff-matrix':
        return <TradeoffMatrix data={data.tableData || []} />;
      default:
        return null;
    }
  };

  // If no simulation data, show message to upload data
  if (!hasSimulationData) {
    return (
      <NoDataState 
        title="Advanced Insights Unavailable"
        description="Upload your logistics data and run a simulation to unlock powerful analytics including cost vs service analysis, savings distribution, and volume optimization insights."
        icon="📊"
        showUploadButton={true}
        showDemoButton={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                📊 Advanced Insights & Tradeoff Analysis
              </h1>
              <p className="text-gray-600 mt-2">
                Explore cost vs service dynamics, savings distribution, and volume thresholds
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              </div>

              {/* City Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📍 City
                </label>
                <select
                  multiple
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', Array.from(e.target.selectedOptions, option => option.value))}
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Raipur">Raipur</option>
                  <option value="Indore">Indore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Pune">Pune</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                </select>
              </div>

              {/* Order Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔄 Order Type
                </label>
                <select
                  multiple
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.orderType}
                  onChange={(e) => handleFilterChange('orderType', Array.from(e.target.selectedOptions, option => option.value))}
                >
                  <option value="B2B">B2B</option>
                  <option value="B2C">B2C</option>
                  <option value="RDC">RDC</option>
                  <option value="MOTHER WAREHOUSE">Mother Warehouse</option>
                </select>
              </div>

              {/* Volume Slider */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 Minimum Order Volume: {filters.minVolume}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.minVolume}
                  onChange={(e) => handleFilterChange('minVolume', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Savings Threshold Slider */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💸 Savings % Threshold: {filters.savingsThreshold}%
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.savingsThreshold}
                  onChange={(e) => handleFilterChange('savingsThreshold', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Summary Stats */}
              {data?.summary && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Cities:</span>
                      <span className="font-medium">{data.summary.totalCities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recommended:</span>
                      <span className="font-medium text-green-600">{data.summary.recommendedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Savings:</span>
                      <span className="font-medium">{data.summary.avgSavings}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  renderTabContent()
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}