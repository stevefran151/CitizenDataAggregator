import Link from "next/link";
import { ArrowRight, BarChart2, Map as MapIcon, Database } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Mechovate <span className="text-indigo-600">Citizen Science</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empowering communities to monitor, analyze, and improve our environment through collaborative data collection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Card 1: Dashboard */}
          <Link href="/dashboard" className="group">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-indigo-50 h-full flex flex-col">
              <div className="bg-indigo-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                <MapIcon className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Interactive Map</h2>
              <p className="text-gray-600 mb-6 flex-grow">
                Explore real-time environmental data contributed by citizens. Visualize air & water quality on a dynamic map.
              </p>
              <div className="flex items-center text-indigo-600 font-semibold group-hover:text-indigo-700">
                Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 2: Trends */}
          <Link href="/trends" className="group">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-emerald-50 h-full flex flex-col">
              <div className="bg-emerald-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                <BarChart2 className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Data Trends</h2>
              <p className="text-gray-600 mb-6 flex-grow">
                Analyze historical data patterns and identify environmental trends over time with detailed charts.
              </p>
              <div className="flex items-center text-emerald-600 font-semibold group-hover:text-emerald-700">
                View Analysis <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 3: API & Data */}
          <a href="http://localhost:8000/docs" target="_blank" className="group">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-50 h-full flex flex-col">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <Database className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Open API</h2>
              <p className="text-gray-600 mb-6 flex-grow">
                Access our raw data programmatically for research. Full documentation available for developers.
              </p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                Read Docs <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </a>
        </div>

        <div className="mt-20 text-center">
          <p className="text-gray-500">
            Ready to contribute? <Link href="/dashboard" className="text-indigo-600 font-semibold hover:underline">Submit an observation now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
