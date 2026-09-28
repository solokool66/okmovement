"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, CheckCircle, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>({
    totalRegistered: 0,
    activeWards: 0,
    coveredPus: 0,
    heatmap: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/heatmap')
      .then(res => res.json())
      .then(data => {
        if(data && Array.isArray(data.heatmap)) {
          setMetrics(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500 mt-1">Real-time grassroots coordination metrics.</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-blue-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Registered Agents</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{metrics.totalRegistered.toLocaleString()}</div>
            <p className="text-xs text-green-600 font-medium mt-1">Ready for launch</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Polling Units Covered</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.coveredPus > 0 ? ((metrics.coveredPus / 176846) * 100).toFixed(2) : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">{metrics.coveredPus.toLocaleString()} / 176,846 PUs</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-yellow-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Verification</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{metrics.pendingVerification || 0}</div>
            <p className="text-xs text-yellow-600 font-medium mt-1">Awaiting OTP Confirm</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Wards</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{metrics.activeWards.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Out of 8,809 total wards</p>
          </CardContent>
        </Card>
      </div>

      {/* HEATMAP SECTION */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Coverage Heatmap (By State)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-6 py-4">State</th>
                  <th className="px-6 py-4">Total LGAs</th>
                  <th className="px-6 py-4">Agents Registered</th>
                  <th className="px-6 py-4">Coverage Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan={5} className="text-center py-6">Loading heatmap data...</td></tr>
                ) : metrics.heatmap.length === 0 ? (
                   <tr><td colSpan={5} className="text-center py-6">No data available yet. Waiting for registrations.</td></tr>
                ) : (
                  metrics.heatmap.map((state: any) => (
                    <tr key={state.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{state.name}</td>
                      <td className="px-6 py-4">{state.totalLgas}</td>
                      <td className="px-6 py-4">{state.totalAgents.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium ${state.colorClass}`}>
                          <span className={`w-2 h-2 rounded-full bg-current`}></span>
                          {state.status} ({state.coverage}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/state/${state.id}`} className="font-medium text-blue-600 hover:underline">Drill Down</Link>
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
