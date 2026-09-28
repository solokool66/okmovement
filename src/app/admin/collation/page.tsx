"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Activity, ShieldCheck } from "lucide-react";

export default function LiveCollation() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
            <CardTitle className="text-sm font-bold text-red-800">Opponent A</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-red-700">{data.summary.totalOppA.toLocaleString()}</div>
            <p className="text-sm font-bold text-red-600 mt-1">{getPercentage(data.summary.totalOppA)}%</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-gray-600 shadow-sm bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-gray-800">Opponent B</CardTitle>
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
                  <th className="px-6 py-4 text-red-700">OppA Votes</th>
                  <th className="px-6 py-4 text-gray-700">OppB Votes</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.results.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-6">No results submitted yet.</td></tr>
                ) : (
                  data.results.slice().reverse().map((r: any, idx: number) => (
                    <tr key={idx} className="bg-white border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{r.puId}</td>
                      <td className="px-6 py-4 font-bold text-green-600">{r.okVotes}</td>
                      <td className="px-6 py-4 font-bold text-red-600">{r.oppAVotes}</td>
                      <td className="px-6 py-4 font-bold text-gray-600">{r.oppBVotes}</td>
                      <td className="px-6 py-4 text-xs">{new Date(r.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
