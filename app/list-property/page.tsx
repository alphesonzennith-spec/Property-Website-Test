import Link from 'next/link';
import { Home, Briefcase, ChevronRight } from 'lucide-react';

export default function ListPropertyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">List Your Property</h1>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Choose how you want to list your property. Both options include our AI-powered listing assistant and free platform syndication.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
          {/* Owner Flow */}
          <Link href="/list-property/owner" className="block group bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl hover:border-blue-300 transition-all">
            <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Home className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Direct Owner</h2>
            <div className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              0% Commission
            </div>
            <p className="text-gray-600 mb-6">
              List your property yourself for free. Requires Singpass property ownership verification.
            </p>
            <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
              Start Owner Listing <ChevronRight className="h-5 w-5 ml-1" />
            </div>
          </Link>

          {/* Agent Flow */}
          <Link href="/list-property/agent" className="block group bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl hover:border-indigo-300 transition-all">
            <div className="h-14 w-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Briefcase className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified Agent</h2>
            <div className="inline-block bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              S$99/month Flat Fee
            </div>
            <p className="text-gray-600 mb-6">
              List on behalf of your client. Requires CEA license check and uploaded owner consent form.
            </p>
            <div className="flex items-center text-indigo-600 font-medium group-hover:translate-x-1 transition-transform">
              Start Agent Listing <ChevronRight className="h-5 w-5 ml-1" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
