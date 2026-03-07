import { DecisionRequest, DecisionResponse } from '@palm-interview/shared';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const request: DecisionRequest = {
    id: `req-static-landing`,
    visitorId: 'visitor-profile-abc',
    timestamp: 1720000000000,
    consent: { marketing: true, analytics: true, necessary: true },
    context: { country: 'US', deviceType: 'mobile', referrerDomain: 'google.com' }
  };

  // Fix Networking: Use INTERNAL_API_URL for SSR in Docker, fallback to NEXT_PUBLIC_API_URL for local runs
  const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  let decision: DecisionResponse | null = null;
  let errorMsg = '';

  try {
    const res = await fetch(`${API_URL}/decision/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      cache: 'no-store'
    });
    
    if (!res.ok) {
      errorMsg = `API Error: ${res.statusText}`;
    } else {
      decision = await res.json();
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    errorMsg = `Failed to connect to Decision API at ${API_URL}: ${message}`;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-12 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header Hero Section */}
        <div className="bg-slate-900 px-8 py-20 text-center relative overflow-hidden">
          {/* Subtle glowing orbs for "SaaS" feel */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            {decision ? (
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                {decision.headline}
              </h1>
            ) : (
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                Welcome to Our Platform
              </h1>
            )}
            
            <p className="text-xl text-slate-300 font-medium max-w-xl mx-auto">
              {decision?.variantId 
                ? `Active Variant: ${decision.variantId}` 
                : errorMsg || 'Loading personalized experience...'}
            </p>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-12 text-center bg-white flex flex-col items-center">
          <p className="text-slate-500 mb-10 text-lg max-w-2xl">
            This is a server-side rendered landing page. The headline above was fetched dynamically from the NestJS Decision Engine running within our isolated Docker network.
          </p>
          <Link href="/admin">
            <button className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5">
              Get Started Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
