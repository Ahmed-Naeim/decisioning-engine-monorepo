'use client';

import { useState } from 'react';
import { generateCopyAsync, AIResponse } from '../actions';
import { getApiUrl } from '../get-api-url';
import { getAllowedClaims } from '../claims';
import { DecisionRequest, DecisionResponse } from '@palm-interview/shared';

export default function AdminPage() {
  // Decision Engine State
  const [country, setCountry] = useState('US');
  const [deviceType, setDeviceType] = useState('mobile');
  const [marketing, setMarketing] = useState(true);
  const [decisionResult, setDecisionResult] = useState<DecisionResponse | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);

  // LLM State
  const [profileContext, setProfileContext] = useState('UK User, Mobile, likes fast shipping');
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const claims = getAllowedClaims();

  const handleTestDecision = async () => {
    setDecisionLoading(true);
    const request: DecisionRequest = {
      id: `mock-${Date.now()}`,
      visitorId: 'admin-mock-visitor',
      timestamp: Date.now(),
      consent: { marketing, analytics: true, necessary: true },
      context: { country, deviceType, referrerDomain: 'google.com' }
    };

    try {
      const dynamicUrl = await getApiUrl();
      const res = await fetch(`${dynamicUrl}/decision/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      const data = await res.json();
      setDecisionResult(data);
    } catch (e) {
      console.error(e);
      alert('Failed to connect to API');
    }
    setDecisionLoading(false);
  };

  const handleGenerateCopy = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const result = await generateCopyAsync(profileContext);
      setAiResult(result);
    } catch (e) {
      console.error(e);
      alert('Failed to generate copy');
    }
    setAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 sm:px-12 font-sans flex justify-center">
      <div className="max-w-6xl w-full space-y-10">
        
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 mt-3 text-lg">Manage personalized variants and LLM copy generation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Mock Profiles Panel */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 bg-white">
              <h2 className="text-xl font-bold text-slate-900">1. Mock Visitor Profiles</h2>
            </div>
            <div className="p-8 space-y-8 flex-1">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Country</label>
                  <select 
                    value={country} 
                    onChange={e => setCountry(e.target.value)}
                    className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50 border px-4 py-3 text-slate-800"
                  >
                    <option value="US">US</option>
                    <option value="UK">UK</option>
                    <option value="CA">Canada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Device Type</label>
                  <select 
                    value={deviceType} 
                    onChange={e => setDeviceType(e.target.value)}
                    className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50 border px-4 py-3 text-slate-800"
                  >
                    <option value="mobile">Mobile</option>
                    <option value="desktop">Desktop</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={marketing} 
                    onChange={e => setMarketing(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <span className="text-sm font-semibold text-slate-800">Marketing Consent (Privacy Check)</span>
                </label>
                <p className="text-sm text-slate-500 mt-2 ml-8">If false, the interceptor will strip PII data.</p>
              </div>

              <button 
                onClick={handleTestDecision}
                disabled={decisionLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:hover:-translate-y-0 hover:-translate-y-0.5"
              >
                {decisionLoading ? 'Evaluating...' : 'Preview Variant'}
              </button>

              {decisionResult && (
                <div className="mt-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <h3 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wider">Resulting Variant</h3>
                  <div className="space-y-3 text-sm">
                    <p><span className="font-semibold text-indigo-800/70 inline-block w-24">Variant ID:</span> <span className="text-slate-900 font-medium">{decisionResult.variantId}</span></p>
                    <p><span className="font-semibold text-indigo-800/70 inline-block w-24">Headline:</span> <span className="text-slate-900 font-medium">{decisionResult.headline}</span></p>
                    <p><span className="font-semibold text-indigo-800/70 inline-block w-24">Reason:</span> <span className="text-slate-900 font-medium">{decisionResult.reason}</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LLM Copy Assistant Panel */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">2. LLM Assistant</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
                Powered by Gemini
              </span>
            </div>
            <div className="p-8 space-y-8 flex-1">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Target Profile Context</label>
                <input 
                  type="text" 
                  value={profileContext}
                  onChange={e => setProfileContext(e.target.value)}
                  placeholder="e.g., Enterprise B2B, Desktop User"
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50 border px-4 py-3 text-slate-800"
                />
              </div>

              <button 
                onClick={handleGenerateCopy}
                disabled={aiLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:hover:-translate-y-0 hover:-translate-y-0.5 flex justify-center items-center"
              >
                {aiLoading ? (
                  <span className="flex items-center space-x-3">
                    <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Generating...</span>
                  </span>
                ) : 'Generate Safe Headline'}
              </button>

              {aiResult && (
                <div className="mt-8 space-y-4">
                  <div className={`p-6 rounded-2xl border ${aiResult.status === 'SUCCESS' ? 'bg-indigo-50 border-indigo-100' : aiResult.status === 'RETRY_SUCCESS' ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                    <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${aiResult.status === 'SUCCESS' ? 'text-indigo-900' : aiResult.status === 'RETRY_SUCCESS' ? 'text-amber-900' : 'text-red-900'}`}>
                      Final Draft
                    </h3>
                    <p className="text-xl font-bold text-slate-900 leading-tight">&quot;{aiResult.headline}&quot;</p>
                    <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="px-3 py-1.5 bg-white rounded-lg border text-slate-700 shadow-sm">Claim: {aiResult.claimId}</span>
                      <span className="px-3 py-1.5 bg-white rounded-lg border text-slate-700 shadow-sm">Attempts: {aiResult.attemptCount}</span>
                      <span className="px-3 py-1.5 bg-white rounded-lg border text-slate-700 shadow-sm">Status: {aiResult.status}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Validated Allowed Claims</h3>
                <ul className="space-y-3">
                  {claims.map(claim => (
                    <li key={claim.id} className="text-sm bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center group shadow-sm">
                      <span className="text-indigo-700 font-bold text-xs bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">{claim.id}</span>
                      <span className="text-slate-700 font-medium flex-1 ml-4">{claim.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
