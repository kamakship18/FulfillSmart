import Link from "next/link";
import FeatureCard from "@/components/FeatureCard";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Hackathon 2025 • Beta Version
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl font-bold text-indigo-700 mb-6 leading-tight">
            Intelligent Logistics
            <br />
            <span className="text-gray-800">Optimization Platform</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-500 mt-4 max-w-3xl mx-auto leading-relaxed">
            Transform your supply chain with AI-powered analytics. Upload your logistics data, 
            simulate RDC placements, and optimize costs with intelligent recommendations 
            that deliver real results.
          </p>

          {/* CTA Button */}
          <Link 
            href="/upload"
            className="inline-block mt-8 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl shadow-lg font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            Start Optimizing Now →
          </Link>

          {/* Secondary CTA */}
          <div className="mt-4">
            <Link 
              href="/dashboard"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View Demo Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Powerful Features for Smart Logistics
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to optimize your supply chain and reduce operational costs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <FeatureCard
              title="Cost Simulation"
              description="Model delivery costs and RDC savings using real logistics data."
              icon={
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />

            <FeatureCard
              title="📊 Deep Analytics"
              description="Advanced insights and tradeoff analysis for strategic decision making."
              icon={
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              link="/insights"
            />

            <FeatureCard
              title="AI Optimization"
              description="Use intelligent recommendations to decide where to build RDCs."
              icon={
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
            />

            <FeatureCard
              title="Interactive Map"
              description="Visualize supply zones and impact of your network in real time."
              icon={
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-700 mb-2">30%</div>
              <div className="text-gray-600">Average Cost Reduction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-700 mb-2">50+</div>
              <div className="text-gray-600">Cities Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-700 mb-2">24/7</div>
              <div className="text-gray-600">Real-time Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Ready to Optimize Your Supply Chain?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Upload your logistics data and see the impact of intelligent RDC placement
          </p>
          <Link 
            href="/upload"
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl shadow-lg font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
