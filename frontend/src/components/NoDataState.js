'use client';

import Link from 'next/link';
import { Upload, Database, TrendingUp, AlertCircle } from 'lucide-react';

export default function NoDataState({ 
  title = "No Data Available",
  description = "Please upload your logistics data first to view analytics and insights",
  showUploadButton = true,
  showDemoButton = false,
  icon = "📊"
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Icon */}
          <div className="relative mb-6">
            <div className="text-8xl mb-4 opacity-20">{icon}</div>
            <div className="absolute top-2 right-2">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {description}
          </p>

          {/* Steps */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
              Get started in 3 steps
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Upload your Excel file</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Run simulation analysis</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">View insights & analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {showUploadButton && (
              <Link
                href="/upload"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Upload className="w-4 h-4" />
                Upload Data
              </Link>
            )}
            {showDemoButton && (
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                View Demo
              </Link>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Need help? Check out our{' '}
              <Link href="/sop" className="text-blue-600 hover:underline">
                Standard Operating Procedures
              </Link>
            </p>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-20"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-100 rounded-full opacity-20"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-100 rounded-full opacity-20"></div>
        </div>
      </div>
    </div>
  );
}
