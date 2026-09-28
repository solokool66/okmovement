import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black tracking-tighter text-green-700">OK Movement</div>
        <div className="space-x-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-green-700 transition">
            Agent Login
          </Link>
          <Link href="/register">
            <Button className="bg-green-600 hover:bg-green-700">Join Now</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
          Grassroots Coordination for a Better Future
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 max-w-4xl leading-tight">
          Mobilize your community. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">
            Secure the vote.
          </span>
        </h1>
        
        <p className="mt-6 text-xl text-gray-600 max-w-2xl leading-relaxed">
          Join thousands of dedicated agents across the nation. Register your polling unit, coordinate with your ward, and be the eyes and ears of the OK Movement on the ground.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20">
              Join the Movement
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-2">
              Agent Portal
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl text-left">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Local Coordination</h3>
            <p className="text-gray-600">Get assigned directly to your specific Polling Unit and connect instantly with your Ward coordinator.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Instant Verification</h3>
            <p className="text-gray-600">Secure, automated WhatsApp verification ensures that every agent is a real, contactable person on the ground.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Real-time Intel</h3>
            <p className="text-gray-600">Join your exclusive Ward WhatsApp group to report live updates, incidents, and results directly to HQ.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
