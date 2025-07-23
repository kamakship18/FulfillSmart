'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getGroupedSummary, getOrderDetails } from '@/utils/api';
import NoDataState from '@/components/NoDataState';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Dashboard() {
  const [simulationData, setSimulationData] = useState([]);
  const [groupedData, setGroupedData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [orderDetails, setOrderDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'detailed'

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Check localStorage first
      const storedData = localStorage.getItem('simulationResults');
      
      if (!storedData) {
        setError('No simulation data found. Please upload a file and run a simulation first.');
        setIsLoading(false);
        return;
      }
      
      setSimulationData(JSON.parse(storedData));

      // Load grouped summary from API only if localStorage data exists
      try {
        const groupedResponse = await getGroupedSummary();
        if (groupedResponse && groupedResponse.data && groupedResponse.data.length > 0) {
          setGroupedData(groupedResponse.data);
        } else {
          // If API has no data but localStorage exists, clear localStorage and show error
          localStorage.removeItem('simulationResults');
          setError('Simulation data not found on server. Please upload a file and run a new simulation.');
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        if (apiError.response?.status === 500) {
          // Server error, likely due to empty data, clear localStorage
          localStorage.removeItem('simulationResults');
          setError('Simulation data error. Please upload a file and run a new simulation.');
        } else {
          // If API fails but we have localStorage data, show warning
          setError('Unable to connect to analytics API. Showing local data only.');
        }
      }
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error loading dashboard data. Please try running a simulation first.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRowExpansion = async (city, orderType) => {
    const key = `${city}_${orderType}`;
    
    if (expandedRows[key]) {
      // Collapse row
      setExpandedRows(prev => ({ ...prev, [key]: false }));
    } else {
      // Expand row and load details if not already loaded
      setExpandedRows(prev => ({ ...prev, [key]: true }));
      
      if (!orderDetails[key]) {
        try {
          const detailsResponse = await getOrderDetails(city, orderType);
          setOrderDetails(prev => ({ ...prev, [key]: detailsResponse.data }));
        } catch (err) {
          console.error('Error loading order details:', err);
        }
      }
    }
  };

  // Calculate summary statistics using useMemo
  const summaryStats = useMemo(() => {
    if (!groupedData.length) return {
      totalCities: 0,
      recommendedGroups: 0,
      totalOrders: 0,
      avgSavings: 0
    };

    const totalOrders = groupedData.reduce((sum, group) => sum + group.total_orders, 0);
    const recommendedGroups = groupedData.filter(group => group.summary_verdict).length;
    const avgSavings = groupedData.reduce((sum, group) => sum + group.avg_savings_percent, 0) / groupedData.length;

    return {
      totalCities: new Set(groupedData.map(g => g.city)).size,
      recommendedGroups,
      totalOrders,
      avgSavings: Math.round(avgSavings * 10) / 10
    };
  }, [groupedData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!groupedData.length) return { barData: [], pieData: [] };

    // Bar chart data - recommendation percentage by city
    const cityStats = {};
    groupedData.forEach(group => {
      if (!cityStats[group.city]) {
        cityStats[group.city] = { city: group.city, totalOrders: 0, recommendedOrders: 0 };
      }
      cityStats[group.city].totalOrders += group.total_orders;
      cityStats[group.city].recommendedOrders += group.recommended_count;
    });

    const barData = Object.values(cityStats).map(stat => ({
      city: stat.city,
      recommendationRate: Math.round((stat.recommendedOrders / stat.totalOrders) * 100),
      totalOrders: stat.totalOrders
    }));

    // Pie chart data - order types distribution
    const orderTypeStats = {};
    groupedData.forEach(group => {
      if (!orderTypeStats[group.order_type]) {
        orderTypeStats[group.order_type] = 0;
      }
      orderTypeStats[group.order_type] += group.total_orders;
    });

    const pieData = Object.entries(orderTypeStats).map(([type, count]) => ({
      name: type,
      value: count,
      color: type === 'B2B' ? '#235784' : '#00a76f'
    }));

    return { barData, pieData };
  }, [groupedData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number);
  };

  const formatPercentage = (percent) => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent}%`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-3"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <NoDataState 
        title="Dashboard Unavailable"
        description={error.includes('No simulation data found') 
          ? "Upload your logistics data and run a simulation to view comprehensive analytics, cost comparisons, and optimization recommendations."
          : error
        }
        icon="📊"
        showUploadButton={true}
        showDemoButton={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 mb-1">
              Logistics Analytics Dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Comprehensive analysis of supply chain optimization opportunities
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grouped' ? 'detailed' : 'grouped')}
              className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              {viewMode === 'grouped' ? 'Detailed View' : 'Grouped View'}
            </button>
            <Link 
              href="/map"
              className="bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              Map View
            </Link>
            <Link 
              href="/upload"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-md"
            >
              New Analysis
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Cities Analyzed</p>
                <p className="text-2xl font-semibold text-slate-800">{summaryStats.totalCities}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Recommended</p>
                <p className="text-2xl font-semibold text-emerald-700">{summaryStats.recommendedGroups}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Total Orders</p>
                <p className="text-2xl font-semibold text-slate-800">{formatNumber(summaryStats.totalOrders)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">Avg Savings</p>
                <p className="text-2xl font-semibold text-slate-800">{summaryStats.avgSavings}%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Recommendation Rate by City
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="city" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'recommendationRate' ? `${value}%` : value,
                      name === 'recommendationRate' ? 'Recommendation Rate' : 'Total Orders'
                    ]}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '12px',
                      backgroundColor: 'white',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="recommendationRate" 
                    fill="url(#barGradient)" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Order Type Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#f59e0b'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '12px',
                      backgroundColor: 'white',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
            <h3 className="text-lg font-semibold text-slate-800">
              {viewMode === 'grouped' ? 'Analysis by City & Order Type' : 'Detailed Order Analysis'}
            </h3>
          </div>
          
          {viewMode === 'grouped' ? (
            /* Grouped Table with Expandable Rows */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Type
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Orders
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Volume
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg MW Cost
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg RDC Cost
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Savings %
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % Recommended
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedData.map((group, index) => {
                    const rowKey = `${group.city}_${group.order_type}`;
                    const isExpanded = expandedRows[rowKey];
                    const details = orderDetails[rowKey] || [];
                    
                    return (
                      <React.Fragment key={index}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{group.city}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              group.order_type === 'B2B' 
                                ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-300' 
                                : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-300'
                            }`}>
                              {group.order_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                            {group.total_orders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatNumber(group.avg_volume)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(group.avg_mw_cost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(group.avg_rdc_cost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              group.avg_savings_percent > 0 
                                ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-300' 
                                : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-300'
                            }`}>
                              {formatPercentage(group.avg_savings_percent)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-12 bg-slate-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${group.recommendation_percent}%`,
                                    background: group.recommendation_percent > 60 
                                      ? 'linear-gradient(to right, #10b981, #059669)' 
                                      : 'linear-gradient(to right, #ef4444, #dc2626)'
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-slate-700">{group.recommendation_percent}%</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {group.recommended_count}/{group.total_orders}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {group.summary_verdict ? (
                              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-300">
                                ✨ Recommended
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-slate-100 to-gray-100 text-slate-600 border border-slate-300">
                                ⚠️ Review Needed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => toggleRowExpansion(group.city, group.order_type)}
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-medium hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                            >
                              {isExpanded ? '▲ Collapse' : '▼ Expand'}
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Details Row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="10" className="px-6 py-4 bg-gray-50">
                              <div className="rounded-lg border border-gray-200 bg-white">
                                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    Individual Orders: {group.city} - {group.order_type}
                                  </h4>
                                </div>
                                
                                {details.length > 0 ? (
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Volume</th>
                                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">MW Cost</th>
                                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">RDC Cost</th>
                                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Savings %</th>
                                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {details.map((order, orderIndex) => (
                                          <tr key={orderIndex} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.order_id}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatNumber(order.volume)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(order.mw_cost)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(order.rdc_cost)}</td>
                                            <td className="px-4 py-3 text-right">
                                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                                                order.savings_percent > 0 
                                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                  : 'bg-red-50 text-red-700 border border-red-200'
                                              }`}>
                                                {formatPercentage(order.savings_percent)}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                              {order.recommended ? (
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                  Recommended
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600 border border-gray-300">
                                                  Not Recommended
                                                </span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="p-4 text-center text-gray-500 text-sm">
                                    Loading order details...
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Detailed View - Original Table */
            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Type</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">MW Cost</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">RDC Cost</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Savings %</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {simulationData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.city}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                            item.order_type === 'B2B' 
                              ? 'bg-gray-100 text-gray-800 border border-gray-300' 
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {item.order_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(item.volume)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.mw_cost)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.rdc_cost)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                            item.savings_percent > 0 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {formatPercentage(item.savings_percent)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {item.recommended ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Recommended
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600 border border-gray-300">
                              Not Recommended
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Call-to-Action Section */}
        <div className="bg-gradient-to-r from-white to-blue-50 border border-slate-200 rounded-xl p-6 shadow-lg text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            🎯 Analysis Complete
          </h3>
          <p className="text-sm text-slate-600 mb-4 max-w-2xl mx-auto">
            Review the optimization recommendations and export comprehensive reports for implementation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/map"
              className="bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg"
            >
              🗺️ Interactive Map
            </Link>
            <Link 
              href="/compare"
              className="bg-white border border-amber-300 hover:bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg"
            >
              📊 Scenario Analysis
            </Link>
            <button 
              onClick={() => {
                const exportData = {
                  groupedSummary: groupedData,
                  detailedOrders: simulationData,
                  generatedAt: new Date().toISOString()
                };
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `logistics-analytics-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg"
            >
              💾 Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
