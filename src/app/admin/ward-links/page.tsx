"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WardLinksPage() {
  const [loading, setLoading] = useState(false);
  
  const [states, setStates] = useState<any[]>([]);
  const [lgas, setLgas] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [link, setLink] = useState("");

  const [existingLinks, setExistingLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/locations?type=states').then(res => res.json()).then(data => setStates(data));
    fetch('/api/ward-links').then(res => res.json()).then(data => setExistingLinks(data));
  }, []);

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedState(val);
    setSelectedLga("");
    setSelectedWard("");
    setLink("");
    if (val) {
      const res = await fetch(`/api/locations?type=lgas&stateId=${val}`);
      setLgas(await res.json());
    } else {
      setLgas([]);
    }
  };

  const handleLgaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedLga(val);
    setSelectedWard("");
    setLink("");
    if (val && selectedState) {
      const res = await fetch(`/api/locations?type=wards&stateId=${selectedState}&lgaId=${val}`);
      setWards(await res.json());
    } else {
      setWards([]);
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedWard(val);
    if (val && existingLinks[val]) {
      setLink(existingLinks[val]);
    } else {
      setLink("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWard || !link) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ward-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wardId: selectedWard, link })
      });
      if (res.ok) {
        alert("Ward link saved successfully!");
        setExistingLinks({...existingLinks, [selectedWard]: link});
      } else {
        alert("Failed to save link.");
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
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Ward Group Links</h2>
        <p className="text-gray-500 mt-1">Assign specific WhatsApp groups to individual wards.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <Card className="shadow-sm border-t-4 border-t-green-600">
          <CardHeader>
            <CardTitle>Configure Ward Group</CardTitle>
            <CardDescription>Select a Ward and paste its official WhatsApp Join Link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>State</Label>
                <select 
                  className="w-full h-10 rounded-md border bg-white px-3 py-2 text-sm"
                  value={selectedState} onChange={handleStateChange} required
                >
                  <option value="">Select State</option>
                  {states.map((s, i) => <option key={i} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label>LGA</Label>
                <select 
                  className="w-full h-10 rounded-md border bg-white px-3 py-2 text-sm disabled:bg-gray-100"
                  value={selectedLga} onChange={handleLgaChange} disabled={!selectedState} required
                >
                  <option value="">Select LGA</option>
                  {lgas.map((l, i) => <option key={i} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Ward</Label>
                <select 
                  className="w-full h-10 rounded-md border bg-white px-3 py-2 text-sm disabled:bg-gray-100"
                  value={selectedWard} onChange={handleWardChange} disabled={!selectedLga} required
                >
                  <option value="">Select Ward</option>
                  {wards.map((w, i) => <option key={i} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            </div>

            {selectedWard && (
              <div className="space-y-2 pt-4 border-t">
                <Label>WhatsApp Join Link for this Ward</Label>
                <Input 
                  type="url" 
                  placeholder="https://chat.whatsapp.com/..." 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                />
                <p className="text-xs text-green-600">
                  {existingLinks[selectedWard] ? "A link is already set for this ward. Saving will overwrite it." : "No link set yet. Agents will use the National link."}
                </p>
              </div>
            )}

            <Button type="submit" disabled={!selectedWard || !link || loading} className="w-full bg-green-600 hover:bg-green-700">
              {loading ? "Saving..." : "Save Ward Link"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
