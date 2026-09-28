"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAgents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredAgents = agents.filter(a => 
    (a.fullName && a.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (a.phone && a.phone.includes(searchTerm)) ||
    (a.stateName && a.stateName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (phone: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;
    try {
      const res = await fetch(`/api/agents/${phone}`, { method: 'DELETE' });
      if (res.ok) {
        setAgents(agents.filter(a => a.phone !== phone));
      } else {
        alert("Failed to delete agent");
      }
    } catch (e) {
      alert("Network error");
    }
  };

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Agents & Users</h2>
          <p className="text-gray-500 mt-1">Manage all registered grassroots coordinators.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search name, phone, or state..." 
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Location (State/LGA/Ward)</th>
                  <th className="px-6 py-4">Polling Unit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Date Registered</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan={7} className="text-center py-8">Loading agents...</td></tr>
                ) : filteredAgents.length === 0 ? (
                   <tr><td colSpan={7} className="text-center py-8">No agents found.</td></tr>
                ) : (
                  filteredAgents.map((agent, i) => (
                    <tr key={i} className="bg-white border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{agent.fullName || 'N/A'}</td>
                      <td className="px-6 py-4">{agent.phone}</td>
                      <td className="px-6 py-4">
                        <span className="block font-medium">{agent.stateName}</span>
                        <span className="block text-xs text-gray-400">{agent.lgaName} • {agent.wardName}</span>
                      </td>
                      <td className="px-6 py-4">{agent.puName}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400">
                        {new Date(agent.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(agent.phone)}
                          className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-md transition-colors"
                          title="Delete Agent"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
    </div>
  );
}
