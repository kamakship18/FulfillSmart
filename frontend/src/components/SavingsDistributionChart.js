'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function SavingsDistributionChart({ data }) {
  const { savingsHistogram = [], recommendationSplit = [] } = data;

  if (!savingsHistogram.length && !recommendationSplit.length) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p>No data available for savings distribution analysis</p>
          <p className="text-sm mt-2">Charts will be displayed here once data is processed</p>
        </div>
      </div>
    );
  }

  // Colors for the pie chart
  const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6'];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Savings Distribution Analysis</h3>
        <p className="text-gray-600">
          Understand how savings are distributed across different ranges and recommendation outcomes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Savings Histogram */}
        {savingsHistogram.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Savings % Distribution</h4>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={savingsHistogram}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bucket" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, 'Count']}
                  labelFormatter={(label) => `Savings Range: ${label}`}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Total buckets: {savingsHistogram.length} | 
                Total orders: {savingsHistogram.reduce((sum, item) => sum + item.count, 0)}
              </p>
            </div>
          </div>
        )}

        {/* Recommendation Pie Chart */}
        {recommendationSplit.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Recommendation Distribution</h4>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={recommendationSplit}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {recommendationSplit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, 'Orders']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {recommendationSplit.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Distribution Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {savingsHistogram.length > 0 
                ? savingsHistogram.reduce((sum, item) => sum + item.count, 0)
                : 0
              }
            </div>
            <div className="text-sm text-gray-600">Total Orders Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {recommendationSplit.find(item => item.name === 'Recommended')?.percentage || 0}%
            </div>
            <div className="text-sm text-gray-600">Recommended for RDC</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {savingsHistogram.length}
            </div>
            <div className="text-sm text-gray-600">Savings Categories</div>
          </div>
        </div>
      </div>
    </div>
  );
}
