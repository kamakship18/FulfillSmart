// Shared Navigation Component
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-indigo-700">FulfillSmart</span>
            <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">Beta</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/upload" className="text-gray-600 hover:text-indigo-700 transition-colors">
              Upload Data
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-indigo-700 transition-colors">
              Dashboard
            </Link>
            <Link href="/blueprint" className="text-gray-600 hover:text-indigo-700 transition-colors">
              🏗️ Blueprint
            </Link>
            <Link href="/insights" className="text-gray-600 hover:text-indigo-700 transition-colors">
              📊 Insights
            </Link>
            <Link href="/map" className="text-gray-600 hover:text-indigo-700 transition-colors">
              Map View
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-indigo-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
