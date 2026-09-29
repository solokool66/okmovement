"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Activity, ShieldCheck } from "lucide-react";

export default function LiveCollation() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/results')
      .then(res => res.json())
      .then(res => { setData(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading Live Results...</div>;
  if (!data || data.error) return <div className="p-8 text-red-500">Failed to load results</div>;

  const totalVotesCast = data.summary.totalOk + data.summary.totalOppA + data.summary.totalOppB;
  const getPercentage = (votes: number) => totalVotesCast > 0 ? ((votes / totalVotesCast) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-indigo-900 flex items-center gap-3">
          <Activity className="h-8 w-8" />
          Live PVT Collation Center
        </h2>
        <p className="text-gray-500 mt-1">Parallel Vote Tabulation independently verified by OK Movement agents.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-t-4 border-t-green-600 shadow-sm bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-green-800">OK Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-green-700">{data.summary.totalOk.toLocaleString()}</div>
            <p className="text-sm font-bold text-green-600 mt-1">{getPercentage(data.summary.totalOk)}%</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-600 shadow-sm bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-red-800">{data.summary.oppAName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-red-700">{data.summary.totalOppA.toLocaleString()}</div>
            <p className="text-sm font-bold text-red-600 mt-1">{getPercentage(data.summary.totalOppA)}%</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-gray-600 shadow-sm bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-gray-800">{data.summary.oppBName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gray-700">{data.summary.totalOppB.toLocaleString()}</div>
            <p className="text-sm font-bold text-gray-600 mt-1">{getPercentage(data.summary.totalOppB)}%</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-indigo-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-indigo-800">PUs Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-indigo-900">{data.summary.totalPUsSubmitted.toLocaleString()}</div>
            <p className="text-sm font-bold text-indigo-600 mt-1">Total PUs Verified</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-600"/> Latest Result Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-6 py-4">Polling Unit</th>
                  <th className="px-6 py-4 text-green-700">OK Votes</th>
                  <th className="px-6 py-4 text-red-700">{data.summary.oppAName}</th>
                  <th className="px-6 py-4 text-gray-700">{data.summary.oppBName}</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.results.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-6">No results submitted yet.</td></tr>
                ) : (
                  data.results.slice().map((r: any, idx: number) => (
                    <tr key={idx} className="bg-white border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{r.puName}</td>
                      <td className="px-6 py-4 font-bold text-green-600">{r.okVotes}</td>
                      <td className="px-6 py-4 font-bold text-red-600">
                        {r.opponents && r.opponents[0] ? r.opponents[0].votes : r.oppAVotes}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-600">
                        {r.opponents && r.opponents[1] ? r.opponents[1].votes : r.oppBVotes}
                      </td>
                      <td className="px-6 py-4 text-xs">{new Date(r.timestamp).toLocaleTimeString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedResult(r)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                        >
                          View Full Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Result Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Result Details</h3>
              <button onClick={() => setSelectedResult(null)} className="text-gray-500 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Polling Unit</p>
                <p className="text-lg font-bold text-gray-900">{selectedResult.puName}</p>
                <p className="text-sm text-gray-500 mt-1">Submitted at {new Date(selectedResult.timestamp).toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-500 uppercase mb-3">Vote Breakdown</p>
                <div className="grid gap-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="font-bold text-green-800">OK Movement</span>
                    <span className="font-black text-green-700 text-xl">{selectedResult.okVotes}</span>
                  </div>
                  {selectedResult.opponents && Array.isArray(selectedResult.opponents) ? (
                    selectedResult.opponents.map((opp: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 border rounded-lg">
                        <span className="font-bold text-gray-800">{opp.name || `Opponent ${i+1}`}</span>
                        <span className="font-black text-gray-700 text-xl">{opp.votes}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex justify-between items-center p-3 bg-gray-50 border rounded-lg">
                        <span className="font-bold text-gray-800">Opponent A</span>
                        <span className="font-black text-gray-700 text-xl">{selectedResult.oppAVotes}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 border rounded-lg">
                        <span className="font-bold text-gray-800">Opponent B</span>
                        <span className="font-black text-gray-700 text-xl">{selectedResult.oppBVotes}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-500 uppercase mb-3">Result Sheet Image</p>
                {selectedResult.image ? (
                  <img src={selectedResult.image} alt="Result Sheet" className="w-full rounded-lg border shadow-sm" />
                ) : (
                  <div className="p-8 text-center bg-gray-50 border rounded-lg text-gray-500">
                    No image was attached to this submission.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
