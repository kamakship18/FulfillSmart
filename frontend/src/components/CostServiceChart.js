'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';

export default function CostServiceChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">📈</div>
          <p>No data available for cost vs service analysis</p>
          <p className="text-sm mt-2">Charts will be displayed here once data is processed</p>
        </div>
      </div>
    );
  }

  // Process data for the line chart
  const chartData = data.map(item => ({
    city: item.city,
    time: item.time || 15, // Default transit time if not provided
    mwCost: item.mwCost,
    rdcCost: item.rdcCost,
    savings: item.mwCost - item.rdcCost,
    savingsPercent: ((item.mwCost - item.rdcCost) / item.mwCost * 100).toFixed(1)
  }));

  // Sort by transit time for better line visualization
  chartData.sort((a, b) => a.time - b.time);

  const formatCurrency = (value) => {
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Cost vs Transit Time Analysis</h3>
        <p className="text-gray-600">
          Compare Mother Warehouse vs RDC costs across different transit times to identify optimal service levels
        </p>
      </div>

      {/* Main Line Chart */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="text-lg font-medium mb-4">Cost Comparison by Transit Time</h4>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Transit Time (hours)', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              label={{ value: 'Cost', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value, name) => [formatCurrency(value), name]}
              labelFormatter={(value) => `Transit Time: ${value} hours`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="mwCost" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Mother Warehouse Cost"
              dot={{ fill: '#ef4444', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="rdcCost" 
              stroke="#22c55e" 
              strokeWidth={2}
              name="RDC Cost"
              dot={{ fill: '#22c55e', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Scatter Plot for Cost vs Volume */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="text-lg font-medium mb-4">Cost vs Volume Analysis</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              dataKey="volume"
              name="Volume"
              label={{ value: 'Volume', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              type="number"
              dataKey="savings"
              name="Savings"
              tickFormatter={formatCurrency}
              label={{ value: 'Savings (₹)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => [
                name === 'Savings' ? formatCurrency(value) : value,
                name
              ]}
            />
            <Scatter 
              name="Cost Savings by Volume" 
              data={chartData}
              fill="#3b82f6"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800">Cost Efficient</h4>
          <p className="text-sm text-green-600">
            Cities where RDC consistently costs less than MW across all transit times
          </p>
          <p className="text-lg font-bold text-green-800 mt-2">
            {chartData.filter(item => item.savings > 0).length} cities
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800">Break-even Points</h4>
          <p className="text-sm text-yellow-600">
            Average transit time where RDC becomes cost-effective
          </p>
          <p className="text-lg font-bold text-yellow-800 mt-2">
            {(chartData.reduce((sum, item) => sum + item.time, 0) / chartData.length).toFixed(1)} hrs
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800">Service Impact</h4>
          <p className="text-sm text-blue-600">
            Average cost savings percentage
          </p>
          <p className="text-lg font-bold text-blue-800 mt-2">
            {(chartData.reduce((sum, item) => sum + parseFloat(item.savingsPercent), 0) / chartData.length).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
