'use client';

import { useState } from 'react';
import { Search, Download, ArrowUpDown, Filter } from 'lucide-react';

export default function TradeoffMatrix({ data }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('savings');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterRecommended, setFilterRecommended] = useState('all');

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <p>No data available for tradeoff matrix</p>
          <p className="text-sm mt-2">Table will be displayed here once data is processed</p>
        </div>
      </div>
    );
  }

  // Filter and sort data
  const filteredData = data
    .filter(item => {
      const matchesSearch = item.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.orderType?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterRecommended === 'all' || 
                           (filterRecommended === 'recommended' && item.recommended) ||
                           (filterRecommended === 'not-recommended' && !item.recommended);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['City', 'Order Type', 'Volume', 'MW Cost', 'RDC Cost', 'Savings %', 'Transit Time', 'Recommendation', 'Break-even Achieved'];
    const csvData = filteredData.map(row => [
      row.city,
      row.orderType,
      row.volume,
      row.mwCost,
      row.rdcCost,
      row.savings,
      row.transitTime,
      row.recommended ? 'Yes' : 'No',
      row.breakEvenAchieved ? 'Yes' : 'No'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tradeoff-matrix.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortableHeader = ({ field, children }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="w-3 h-3" />
        {sortField === field && (
          <span className="text-blue-500">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">City-level Tradeoff Matrix</h3>
        <p className="text-gray-600">
          Comprehensive analysis of all cities with detailed cost, savings, and recommendation data
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search cities or order types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterRecommended}
              onChange={(e) => setFilterRecommended(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Recommendations</option>
              <option value="recommended">Recommended Only</option>
              <option value="not-recommended">Not Recommended Only</option>
            </select>
          </div>
        </div>

        {/* Export */}
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredData.length} of {data.length} cities
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader field="city">City</SortableHeader>
                <SortableHeader field="orderType">Order Type</SortableHeader>
                <SortableHeader field="volume">Volume</SortableHeader>
                <SortableHeader field="mwCost">MW Cost</SortableHeader>
                <SortableHeader field="rdcCost">RDC Cost</SortableHeader>
                <SortableHeader field="savings">Savings %</SortableHeader>
                <SortableHeader field="transitTime">Transit Time</SortableHeader>
                <SortableHeader field="recommended">Recommendation</SortableHeader>
                <SortableHeader field="breakEvenAchieved">Break-even</SortableHeader>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.orderType === 'B2B' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {row.orderType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.volume?.toLocaleString()} units
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{row.mwCost?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{row.rdcCost?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      row.savings > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {row.savings > 0 ? '+' : ''}{row.savings}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.transitTime} hrs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.recommended 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {row.recommended ? '✅ Recommended' : '❌ Not Recommended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.breakEvenAchieved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {row.breakEvenAchieved ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800">Total Cities</h4>
          <p className="text-2xl font-bold text-blue-900">{filteredData.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800">Recommended</h4>
          <p className="text-2xl font-bold text-green-900">
            {filteredData.filter(d => d.recommended).length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800">Avg Savings</h4>
          <p className="text-2xl font-bold text-yellow-900">
            {filteredData.length > 0 
              ? (filteredData.reduce((sum, d) => sum + d.savings, 0) / filteredData.length).toFixed(1)
              : 0
            }%
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-800">Break-even Achieved</h4>
          <p className="text-2xl font-bold text-purple-900">
            {filteredData.filter(d => d.breakEvenAchieved).length}
          </p>
        </div>
      </div>
    </div>
  );
}
