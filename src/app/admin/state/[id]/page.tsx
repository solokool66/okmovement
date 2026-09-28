"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, CheckCircle } from "lucide-react";

export default function StateDrillDown({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/heatmap/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return <div className="p-8 text-center mt-20 text-gray-500 text-xl font-medium animate-pulse">Loading State Data...</div>;
  }

  if (!metrics || metrics.error) {
    return <div className="p-8 text-center text-red-500 mt-20 text-xl">Failed to load state data or State not found.</div>;
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <Link href="/admin" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-2 mb-4">
          &larr; Back to National Dashboard
        </Link>
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">{metrics.stateName} State</h2>
        <p className="text-gray-500 mt-1">LGA-level grassroots coordination metrics.</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-t-4 border-t-blue-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Registered Agents</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{metrics.totalRegistered.toLocaleString()}</div>
            <p className="text-xs text-green-600 font-medium mt-1">Ready for launch in {metrics.stateName}</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Polling Units Covered</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.coveredPus > 0 ? ((metrics.coveredPus / metrics.totalStatePUs) * 100).toFixed(2) : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">{metrics.coveredPus.toLocaleString()} / {metrics.totalStatePUs.toLocaleString()} PUs</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active LGAs</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{metrics.activeLgas.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Out of {metrics.heatmap.length} total LGAs</p>
          </CardContent>
        </Card>
      </div>

      {/* HEATMAP SECTION */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">LGA Coverage Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-6 py-4">LGA Name</th>
                  <th className="px-6 py-4">Total Wards</th>
                  <th className="px-6 py-4">Agents Registered</th>
                  <th className="px-6 py-4">Coverage Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.heatmap.length === 0 ? (
                   <tr><td colSpan={4} className="text-center py-6">No data available.</td></tr>
                ) : (
                  metrics.heatmap.map((lga: any) => (
                    <tr key={lga.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{lga.name}</td>
                      <td className="px-6 py-4">{lga.totalWards}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{lga.totalAgents.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium ${lga.colorClass}`}>
                          <span className={`w-2 h-2 rounded-full bg-current`}></span>
                          {lga.status} ({lga.coverage}%)
                        </span>
                      </td>
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
