"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock } from "lucide-react";

export default function IncidentCommand() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/incidents')
      .then(res => res.json())
      .then(data => { setIncidents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-red-600 flex items-center gap-3">
          <AlertTriangle className="h-8 w-8" />
          Incident Command Center
        </h2>
        <p className="text-gray-500 mt-1">Live SOS reports from field agents nationwide.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-t-4 border-t-red-600 shadow-sm bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-red-800">Total Unresolved Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-red-600">{incidents.filter(i => i.status === "UNRESOLVED").length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse">Loading reports...</div>
        ) : incidents.length === 0 ? (
          <div className="text-gray-500 italic p-8 text-center bg-white rounded-lg border">No incidents reported yet.</div>
        ) : (
          incidents.map((incident, idx) => (
            <Card key={incident.id || idx} className="shadow-sm border-l-4 border-l-red-500 overflow-hidden">
              <div className="flex items-center justify-between bg-gray-50 px-6 py-3 border-b">
                <div className="flex items-center gap-3">
                  <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    {incident.incidentType}
                  </span>
                  <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(incident.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm font-bold text-gray-700">Agent: {incident.phone}</div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-900 text-lg mb-4">{incident.description}</p>
                <div className="bg-gray-100 p-3 rounded text-sm text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div><strong>State:</strong> {incident.stateId?.toUpperCase()}</div>
                  <div><strong>LGA:</strong> {incident.lgaId}</div>
                  <div><strong>Ward:</strong> {incident.wardId}</div>
                  <div><strong>PU:</strong> {incident.puId}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
