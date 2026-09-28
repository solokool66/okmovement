"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function BroadcastPage() {
  const [loading, setLoading] = useState(false);
  const [targetType, setTargetType] = useState("ALL");
  const [targetState, setTargetState] = useState("");
  const [message, setMessage] = useState("");
  const [states, setStates] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/locations?type=states')
      .then(res => res.json())
      .then(data => setStates(data));
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    if (targetType === "STATE" && !targetState) return alert("Please select a state.");

    const confirmMsg = `Are you sure you want to broadcast this message to ${targetType === 'ALL' ? 'ALL AGENTS' : `ALL AGENTS IN ${targetState.toUpperCase()}`}?\n\nThis will queue the messages via WhatsApp.`;
    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/broadcast/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetState, message })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setMessage("");
      } else {
        alert(data.error || "Failed to send broadcast.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Broadcast System</h2>
        <p className="text-gray-500 mt-1">Send mass WhatsApp messages to your grassroots coordinators instantly.</p>
      </div>

      <form onSubmit={handleSend} className="max-w-3xl">
        <Card className="shadow-sm border-t-4 border-t-purple-600">
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>Messages are processed securely via your connected Free WhatsApp microservice to avoid spam bans.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-4">
              <Label>Target Audience</Label>
              <div className="flex gap-4">
                <label className={`flex items-center gap-2 cursor-pointer p-4 border rounded-lg flex-1 transition-colors ${targetType === 'ALL' ? 'border-purple-600 bg-purple-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="targetType" value="ALL" checked={targetType === 'ALL'} onChange={() => setTargetType('ALL')} className="hidden" />
                  <span className="font-bold text-gray-900">All Agents (Nationwide)</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer p-4 border rounded-lg flex-1 transition-colors ${targetType === 'STATE' ? 'border-purple-600 bg-purple-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="targetType" value="STATE" checked={targetType === 'STATE'} onChange={() => setTargetType('STATE')} className="hidden" />
                  <span className="font-bold text-gray-900">Specific State</span>
                </label>
              </div>

              {targetType === "STATE" && (
                <div className="pt-2">
                  <select 
                    className="w-full flex h-12 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={targetState}
                    onChange={(e) => setTargetState(e.target.value)}
                    required
                  >
                    <option value="">Select State...</option>
                    {states.map((s, i) => (
                      <option key={i} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label>Message Content</Label>
              <textarea 
                className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 min-h-[150px]"
                placeholder="Type your official broadcast message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 text-right">{message.length} characters</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 h-14 text-lg">
              {loading ? "Queueing Messages..." : "Send Broadcast Now"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
