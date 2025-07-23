'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import NoDataState from '@/components/NoDataState';
import { 
  Database, 
  MapIcon,
  MapPin,
  Truck, 
  BarChart, 
  Upload, 
  Settings, 
  Eye, 
  EyeOff,
  Play,
  Download,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { getGroupedSummary } from '../../utils/api';

import dynamic from 'next/dynamic';
//import { Map as MapIcon } from "lucide-react";

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-2"></div>
        <p className="text-slate-600">Loading map...</p>
      </div>
    </div>
  )
});
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false });

export default function RegionalFulfillmentMap() {
  const [selectedChannels, setSelectedChannels] = useState(['Both']);
  const [savingsThreshold, setSavingsThreshold] = useState(15);
  const [volumeThreshold, setVolumeThreshold] = useState(1000);
  const [simulationResults, setSimulationResults] = useState(null);
  const [groupedData, setGroupedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasSimulationData, setHasSimulationData] = useState(false);
  const [mapLayers, setMapLayers] = useState({
    heatmap: false,
    serviceZones: true,
    pinLabels: true
  });
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Set a slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 100);

    // Load simulation data from the same sources as dashboard
    loadMapData();

    return () => clearTimeout(timer);
  }, []);

  // Basic city coordinates (should ideally come from your backend data)
  const getCityCoordinates = (cityName) => {
    const coordinates = {
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.6139, lng: 77.2090 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 },
      'Bengaluru': { lat: 12.9716, lng: 77.5946 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Surat': { lat: 21.1702, lng: 72.8311 },
      'Lucknow': { lat: 26.8467, lng: 80.9462 },
      'Kanpur': { lat: 26.4499, lng: 80.3319 },
      'Nagpur': { lat: 21.1458, lng: 79.0882 },
      'Indore': { lat: 22.7196, lng: 75.8577 },
      'Thane': { lat: 19.2183, lng: 72.9781 },
      'Bhopal': { lat: 23.2599, lng: 77.4126 },
      'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
      'Pimpri-Chinchwad': { lat: 18.6298, lng: 73.7997 },
      'Patna': { lat: 25.5941, lng: 85.1376 }
    };
    
    return coordinates[cityName] || { lat: 20.5937, lng: 78.9629 }; // Default to center of India
  };

  const loadMapData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First check if localStorage has valid simulation data
      const storedData = localStorage.getItem('simulationResults');
      let detailedData = [];
      
      if (storedData) {
        try {
          detailedData = JSON.parse(storedData);
          if (!detailedData || detailedData.length === 0) {
            setError('No simulation data found. Please upload a file and run a simulation first.');
            setHasSimulationData(false);
            setIsLoading(false);
            return;
          }
          setHasSimulationData(true);
          console.log('Loaded detailed simulation data:', detailedData.length, 'records');
        } catch (e) {
          setError('Invalid simulation data found. Please upload a file and run a new simulation.');
          setHasSimulationData(false);
          setIsLoading(false);
          return;
        }
      } else {
        setError('No simulation data found. Please upload a file and run a simulation first.');
        setHasSimulationData(false);
        setIsLoading(false);
        return;
      }

      // Load grouped summary from API (same as dashboard)
      try {
        console.log('Calling getGroupedSummary API...');
        const groupedResponse = await getGroupedSummary();
        console.log('API Response:', groupedResponse);
        
        if (groupedResponse && groupedResponse.data && groupedResponse.data.length > 0) {
          setGroupedData(groupedResponse.data);
          console.log('Loaded grouped data:', groupedResponse.data.length, 'groups');
          
          // Convert grouped data to map-friendly format
          console.log('Converting grouped data to map format...');
          const mapData = convertGroupedDataToMapFormat(groupedResponse.data);
          console.log('Converted map data:', mapData);
          setSimulationResults(mapData);
        } else {
          console.log('No grouped data found in API response');
          // If API has no data, clear localStorage and show error
          localStorage.removeItem('simulationResults');
          setHasSimulationData(false);
          setError('Simulation data not found on server. Please upload a file and run a new simulation.');
          setIsLoading(false);
          return;
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        if (apiError.response?.status === 500) {
          // Server error, likely due to empty data, clear localStorage
          localStorage.removeItem('simulationResults');
          setHasSimulationData(false);
          setError('Simulation data error. Please upload a file and run a new simulation.');
          setIsLoading(false);
          return;
        } else {
          // Fallback: if API fails but we have localStorage data, use that
          console.log('Using localStorage data as fallback...');
          const mapData = convertDetailedDataToMapFormat(detailedData);
          console.log('Converted localStorage data:', mapData);
          setSimulationResults(mapData);
          setError('Unable to connect to analytics API. Showing local data only.');
        }
      }
      
    } catch (err) {
      console.error('Error loading map data:', err);
      setError(err.message || 'Error loading simulation data. Please try running a new simulation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert grouped data from API to map-friendly format
  const convertGroupedDataToMapFormat = (grouped) => {
    console.log('Converting grouped data to map format:', grouped);
    const cityMap = new window.Map();
    
    try {
      grouped.forEach(group => {
        const cityKey = group.city;
        
        if (!cityMap.has(cityKey)) {
          // Get coordinates safely
          const coordinates = getCityCoordinates(group.city);
          console.log('Got coordinates for', group.city, ':', coordinates);
          
          // Initialize city data
          cityMap.set(cityKey, {
            id: cityKey.toLowerCase().replace(/\s+/g, '-'),
            name: group.city,
            // Default coordinates for major Indian cities (should be from your data)
            lat: coordinates.lat,
            lng: coordinates.lng,
            recommended: false,
            orders: 0,
            b2bOrders: 0,
            b2cOrders: 0,
            channel: 'Mixed',
            mwTime: 0,
            rdcTime: 0,
            savings: 0,
            groupDetails: []
          });
        }
        
        const cityData = cityMap.get(cityKey);
        
        // Aggregate data
        cityData.orders += group.total_orders;
        cityData.savings = (cityData.savings + group.avg_savings_percent) / 2; // Average savings
        cityData.recommended = cityData.recommended || group.summary_verdict;
        
        // Channel-specific aggregation
        if (group.order_type === 'B2B') {
          cityData.b2bOrders += group.total_orders;
        } else {
          cityData.b2cOrders += group.total_orders;
        }
        
        // Determine primary channel
        cityData.channel = cityData.b2bOrders > cityData.b2cOrders ? 'B2B' : 'B2C';
        
        // Store group details for reference
        cityData.groupDetails.push(group);
      });
      
      return Array.from(cityMap.values());
    } catch (error) {
      console.error('Error converting grouped data:', error);
      return [];
    }
  };

  // Convert detailed localStorage data to map format
  const convertDetailedDataToMapFormat = (detailed) => {
    console.log('Converting detailed data to map format:', detailed);
    const cityMap = new window.Map();
    
    try {
      detailed.forEach(order => {
        const cityKey = order.city;
        
        if (!cityMap.has(cityKey)) {
          // Get coordinates safely
          const coordinates = getCityCoordinates(order.city);
          console.log('Got coordinates for', order.city, ':', coordinates);
          
          cityMap.set(cityKey, {
            id: cityKey.toLowerCase().replace(/\s+/g, '-'),
            name: order.city,
            lat: coordinates.lat,
            lng: coordinates.lng,
            recommended: false,
            orders: 0,
            b2bOrders: 0,
            b2cOrders: 0,
            channel: 'Mixed',
            mwTime: 0,
            rdcTime: 0,
            savings: 0,
            recommendedCount: 0
          });
        }
        
        const cityData = cityMap.get(cityKey);
        cityData.orders += 1;
        cityData.savings = (cityData.savings + (order.savings_percent || 0)) / 2;
        
        if (order.recommended) {
          cityData.recommendedCount += 1;
        }
        
        if (order.order_type === 'B2B') {
          cityData.b2bOrders += 1;
        } else {
          cityData.b2cOrders += 1;
        }
        
        cityData.channel = cityData.b2bOrders > cityData.b2cOrders ? 'B2B' : 'B2C';
        });
      
      // Determine recommendation based on majority
      Array.from(cityMap.values()).forEach(city => {
        city.recommended = city.recommendedCount > (city.orders / 2);
      });
      
      return Array.from(cityMap.values());
    } catch (error) {
      console.error('Error converting detailed data:', error);
      return [];
    }
  };

  const handleFileUpload = (event) => {
    // This function is kept for UI consistency but will redirect to upload page
    console.log('Redirecting to upload page for new simulation');
  };

  const handleChannelChange = (channel) => {
    setSelectedChannels(prev => {
      if (channel === 'Both') {
        return ['Both'];
      }
      const filtered = prev.filter(c => c !== 'Both');
      if (filtered.includes(channel)) {
        const newChannels = filtered.filter(c => c !== channel);
        return newChannels.length === 0 ? ['Both'] : newChannels;
      } else {
        const newChannels = [...filtered, channel];
        return newChannels.length === 2 ? ['Both'] : newChannels;
      }
    });
  };

  // Apply filters to current data instead of running new simulation
  const applyFilters = () => {
    if (!simulationResults) return;
    
    // This will trigger re-render with current filter settings
    // The filtering is now applied in real-time via the useMemo hook
    console.log('Filters applied:', { selectedChannels, savingsThreshold, volumeThreshold });
  };

  // Apply real-time filtering to simulation results
  const filteredResults = React.useMemo(() => {
    if (!simulationResults) return [];
    
    return simulationResults.filter(city => {
      // Check savings and volume thresholds
      const meetsSavingsThreshold = (city.savings || 0) >= savingsThreshold;
      const meetsVolumeThreshold = (city.orders || 0) >= volumeThreshold;
      
      // Check channel filtering
      let meetsChannelCriteria = false;
      if (selectedChannels.includes('Both')) {
        meetsChannelCriteria = true;
      } else {
        if (selectedChannels.includes('B2B') && selectedChannels.includes('B2C')) {
          meetsChannelCriteria = true;
        } else if (selectedChannels.includes('B2B')) {
          meetsChannelCriteria = city.channel === 'B2B' || city.b2bOrders > city.b2cOrders;
        } else if (selectedChannels.includes('B2C')) {
          meetsChannelCriteria = city.channel === 'B2C' || city.b2cOrders > city.b2bOrders;
        }
      }
      
      return meetsSavingsThreshold && meetsVolumeThreshold && meetsChannelCriteria;
    });
  }, [simulationResults, selectedChannels, savingsThreshold, volumeThreshold]);

  const toggleLayer = (layer) => {
    setMapLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const summaryStats = React.useMemo(() => {
    if (!filteredResults || filteredResults.length === 0) return {
      totalRDCs: 0,
      totalCities: 0,
      avgSavings: "0",
      coverage: 0,
      b2bCities: 0,
      b2cCities: 0,
      totalB2BOrders: 0,
      totalB2COrders: 0
    };

    const totalB2BOrders = filteredResults.reduce((sum, city) => sum + (city.b2bOrders || 0), 0);
    const totalB2COrders = filteredResults.reduce((sum, city) => sum + (city.b2cOrders || 0), 0);
    const avgSavings = filteredResults.length > 0 
      ? (filteredResults.reduce((sum, city) => sum + (city.savings || 0), 0) / filteredResults.length).toFixed(1)
      : "0";

    return {
      totalRDCs: filteredResults.filter(city => city.recommended).length,
      totalCities: filteredResults.length,
      avgSavings,
      coverage: filteredResults.length > 0 
        ? Math.round((filteredResults.filter(city => city.recommended).length / filteredResults.length) * 100)
        : 0,
      b2bCities: filteredResults.filter(city => city.channel === 'B2B').length,
      b2cCities: filteredResults.filter(city => city.channel === 'B2C').length,
      totalB2BOrders,
      totalB2COrders
    };
  }, [filteredResults]);

  // Custom icons for Leaflet (will be created when map loads)
  const createCustomIcon = (city) => {
    if (typeof window !== 'undefined' && window.L) {
      try {
        const isRecommended = city.recommended;
        const channel = city.channel;
        
        // Base color for recommendation status
        const baseColor = isRecommended ? '#10b981' : '#6b7280';
        
        // Border color for channel type
        const borderColor = channel === 'B2B' ? '#3b82f6' : '#8b5cf6';
        const borderWidth = channel ? '3px' : '2px';
        
        return window.L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background-color: ${baseColor}; 
            width: 20px; 
            height: 20px; 
            border-radius: 50%; 
            border: ${borderWidth} solid ${borderColor}; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              position: absolute;
              top: -2px;
              right: -2px;
              width: 8px;
              height: 8px;
              background-color: ${borderColor};
              border-radius: 50%;
              border: 1px solid white;
              font-size: 6px;
              color: white;
              text-align: center;
              line-height: 6px;
              font-weight: bold;
            ">${channel === 'B2B' ? 'B' : 'C'}</div>
          </div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
      } catch (error) {
        console.error('Error creating custom icon:', error);
        // Return null to use default Leaflet marker
        return null;
      }
    }
    // Return null if window.L is not available (will use default marker)
    return null;
  };

  // If no simulation data, show NoDataState
  if (!hasSimulationData && !isLoading) {
    return (
      <NoDataState 
        title="Regional Map Unavailable"
        description="Upload your logistics data and run a simulation to visualize regional distribution centers, cost savings, and optimization opportunities on an interactive map."
        icon="🗺️"
        showUploadButton={true}
        showDemoButton={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f9fc] py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-1" style={{ color: '#235784' }}>
              Regional Fulfillment Map
            </h1>
            <p className="text-sm text-slate-600">
              Interactive visualization of your simulation results and RDC recommendations
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex gap-2">
            <Link 
              href="/upload"
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              � Upload Data
            </Link>
            <Link 
              href="/dashboard"
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              � Dashboard
            </Link>
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Settings className="w-5 h-5 mr-2" style={{ color: '#235784' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#235784' }}>
                Map Filters & Controls
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadMapData}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              <Link 
                href="/upload"
                className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                New Simulation
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Channel Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Filter by Channels</label>
              <div className="space-y-2">
                {['B2B', 'B2C', 'Both'].map(channel => (
                  <label key={channel} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(channel)}
                      onChange={() => handleChannelChange(channel)}
                      className="mr-2 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">{channel}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Thresholds */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Savings Threshold: {savingsThreshold}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={savingsThreshold}
                  onChange={(e) => setSavingsThreshold(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Minimum Orders: {volumeThreshold}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={volumeThreshold}
                  onChange={(e) => setVolumeThreshold(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>

            {/* Data Info */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data Source</label>
              <div className="bg-slate-50 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Cities:</span>
                  <span className="font-medium">{simulationResults?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-600">Filtered:</span>
                  <span className="font-medium text-blue-600">{filteredResults?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-600">Source:</span>
                  <span className="text-xs text-green-600">
                    {groupedData.length > 0 ? 'Live Data' : 'Cached Data'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">No Simulation Data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <Link 
                href="/upload"
                className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Run Simulation
              </Link>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 text-blue-600 mr-3 animate-spin" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Loading Simulation Data</h3>
                <p className="text-sm text-blue-700 mt-1">Fetching the latest analysis results...</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary Cards */}
        {!isLoading && !error && filteredResults && filteredResults.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Total RDCs</p>
                    <p className="text-2xl font-semibold text-slate-800">{summaryStats.totalRDCs}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Cities</p>
                    <p className="text-2xl font-semibold text-slate-800">{summaryStats.totalCities}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Avg Savings</p>
                    <p className="text-2xl font-semibold text-slate-800">{summaryStats.avgSavings}%</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Coverage</p>
                    <p className="text-2xl font-semibold text-slate-800">{summaryStats.coverage}%</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Distribution Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">B2B Cities</p>
                    <p className="text-2xl font-semibold text-slate-800">{summaryStats.b2bCities}</p>
                    <p className="text-xs text-slate-500 mt-1">{summaryStats.totalB2BOrders.toLocaleString()} orders</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">B2B</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">B2C Cities</p>
                    <p className="text-2xl font-semibold text-slate-800">{summaryStats.b2cCities}</p>
                    <p className="text-xs text-slate-500 mt-1">{summaryStats.totalB2COrders.toLocaleString()} orders</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">B2C</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Active Channels</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {selectedChannels.includes('Both') ? 'Both' : selectedChannels.join(', ')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Filter applied</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">B2B vs B2C Ratio</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {summaryStats.totalB2BOrders > 0 && summaryStats.totalB2COrders > 0 
                        ? `${Math.round((summaryStats.totalB2BOrders / (summaryStats.totalB2BOrders + summaryStats.totalB2COrders)) * 100)}:${Math.round((summaryStats.totalB2COrders / (summaryStats.totalB2BOrders + summaryStats.totalB2COrders)) * 100)}`
                        : 'N/A'
                      }
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Order volume ratio</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Map Container */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
          {/* Map Controls */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: '#235784' }}>
                India RDC Optimization Map
              </h3>
              <div className="flex items-center space-x-4">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={mapLayers.serviceZones}
                    onChange={() => toggleLayer('serviceZones')}
                    className="mr-2"
                  />
                  Service Zones
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={mapLayers.pinLabels}
                    onChange={() => toggleLayer('pinLabels')}
                    className="mr-2"
                  />
                  Pin Labels
                </label>
                <button
                  onClick={() => toggleLayer('heatmap')}
                  className="flex items-center text-sm text-slate-600 hover:text-slate-800"
                >
                  {mapLayers.heatmap ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  Heatmap
                </button>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="h-96 lg:h-[500px] relative">
            {isMapLoaded && (
              <MapContainer
                center={[20.5937, 78.9629]} // Center of India
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                attributionControl={true}
                zoomControl={true}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                touchZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  maxZoom={18}
                  tileSize={256}
                  zoomOffset={0}
                />
                
                {/* City Markers */}
                {filteredResults && filteredResults.length > 0 && filteredResults
                  .filter(city => city && (city.id || city.name) && city.lat && city.lng) // Filter out invalid entries
                  .map((city, index) => {
                    // Generate a unique key using id, name, or index as fallback
                    const uniqueKey = city.id || city.name || `city-${index}`;
                    const customIcon = createCustomIcon(city);
                    
                    return (
                      <React.Fragment key={`city-${uniqueKey}`}>
                        <Marker
                          key={`marker-${uniqueKey}`}
                          position={[city.lat, city.lng]}
                          {...(customIcon && { icon: customIcon })} // Only add icon prop if it exists
                        >
                          <Popup maxWidth={250} minWidth={200}>
                            <div className="p-2">
                              <h4 className="font-semibold text-slate-800 mb-2">{city.name || 'Unknown City'}</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Total Orders:</span>
                                  <span className="font-medium">{(city.orders || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>B2B Orders:</span>
                                  <span className="font-medium text-blue-600">{(city.b2bOrders || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>B2C Orders:</span>
                                  <span className="font-medium text-purple-600">{(city.b2cOrders || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Primary Channel:</span>
                                  <span className={`font-medium ${city.channel === 'B2B' ? 'text-blue-600' : 'text-purple-600'}`}>
                                    {city.channel || 'Mixed'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>MW Transit:</span>
                                  <span>{city.mwTime || 'N/A'}h</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>RDC Transit:</span>
                                  <span>{city.rdcTime || 'N/A'}h</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Savings:</span>
                                  <span className={`font-medium ${(city.savings || 0) > 15 ? 'text-green-600' : 'text-red-600'}`}>
                                    {(city.savings || 0).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="mt-2 pt-2 border-t">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    city.recommended 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {city.recommended ? '✅ RDC Recommended' : '❌ MW Recommended'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                        
                        {/* Service Zones */}
                        {mapLayers.serviceZones && city.recommended && (
                          <Circle
                            key={`circle-${uniqueKey}`}
                            center={[city.lat, city.lng]}
                            radius={150000} // 150km radius
                            fillColor="#10b981"
                            fillOpacity={0.1}
                            color="#10b981"
                            weight={1}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
              </MapContainer>
            )}

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 border border-slate-200 z-[1000]">
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Legend</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Recommended RDC</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                  <span>Not Recommended</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white mr-2"></div>
                  <span>B2B Primary</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full border-2 border-purple-500 bg-white mr-2"></div>
                  <span>B2C Primary</span>
                </div>
                {mapLayers.serviceZones && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full border-2 border-green-500 bg-green-100 mr-2"></div>
                    <span>Service Zone</span>
                  </div>
                )}
              </div>
            </div>

            {!isMapLoaded && (
              <div className="flex items-center justify-center h-full bg-slate-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-2"></div>
                  <p className="text-slate-600">Loading map...</p>
                </div>
              </div>
            )}

            {/* No Data Overlay */}
            {isMapLoaded && !isLoading && (!filteredResults || filteredResults.length === 0) && !error && (
              <div className="absolute inset-0 bg-slate-100 bg-opacity-90 flex items-center justify-center z-[1000]">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                  <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No Cities Match Filters</h3>
                  <p className="text-slate-600 mb-4">
                    Adjust your filter settings to see more cities on the map.
                  </p>
                  <div className="flex items-center justify-center text-sm text-slate-500">
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Try lowering thresholds or changing channel selection</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Options */}
        {!isLoading && !error && filteredResults && filteredResults.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">Export Map Data</h3>
                <p className="text-sm text-slate-600">
                  Download filtered map data and recommendations ({filteredResults.length} cities)
                </p>
              </div>
              <div className="flex gap-2">
                <Link 
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  View Dashboard
                </Link>
                <button
                  onClick={() => {
                    const exportData = {
                      mapData: filteredResults,
                      filters: {
                        channels: selectedChannels,
                        savingsThreshold,
                        volumeThreshold
                      },
                      summary: summaryStats,
                      exportedAt: new Date().toISOString()
                    };
                    const dataStr = JSON.stringify(exportData, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `rdc-map-data-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                  }}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
