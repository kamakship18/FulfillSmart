'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function VolumeVsSavingsChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Volume vs Savings Analysis</h3>
          <p className="text-gray-600">Scatter plot showing relationship between order volume and cost savings</p>
          <div className="mt-4 text-sm text-gray-500">
            No data available for visualization
          </div>
        </div>
      </div>
    );
  }

  // Custom tooltip for scatter plot
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.city}</p>
          <p className="text-blue-600">Volume: {data.volume?.toLocaleString()}</p>
          <p className="text-green-600">Savings: {data.savings}%</p>
          <p className={`text-sm ${data.recommended ? 'text-green-600' : 'text-red-600'}`}>
            {data.recommended ? '✅ Recommended' : '❌ Not Recommended'}
          </p>
        </div>
      );
    }
    return null;
  };

  const getPointColor = (recommended) => {
    return recommended ? '#10B981' : '#EF4444'; 
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Volume vs Savings Analysis</h3>
        <p className="text-gray-600">Scatter plot showing relationship between order volume and cost savings percentage</p>
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Recommended</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Not Recommended</span>
          </div>
          <div className="text-gray-500">
            Data points: {data.length}
          </div>
        </div>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            data={data}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              dataKey="volume" 
              name="Volume"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis 
              type="number" 
              dataKey="savings" 
              name="Savings %"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              name="Cities" 
              data={data} 
              fill="#8884d8"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getPointColor(entry.recommended)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        💡 Higher volume orders with positive savings percentages are typically recommended for RDC fulfillment
      </div>
    </div>
  );
}
