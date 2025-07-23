// Footer Component
export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-2xl font-bold text-indigo-700">FulfillSmart</span>
            <p className="text-gray-600 mt-1">Intelligent Logistics Optimization</p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-500">
              © 2025 FulfillSmart - Built for Hackathon 2025
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Optimizing supply chains with AI-powered analytics
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Made with ❤️ using Next.js, Tailwind CSS, and FastAPI
          </p>
        </div>
      </div>
    </footer>
  );
}
