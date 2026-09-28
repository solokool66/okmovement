"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PARTY_LIST = [
  { id: "APC", label: "APC - Bola Tinubu / Kashim Shettima" },
  { id: "ADC", label: "ADC - Atiku Abubakar / Chibuike Rotimi Amaechi" },
  { id: "LP", label: "LP - Sunday Chibuzo Okereke / Hajja Bintu Konto" },
  { id: "PDP", label: "PDP - Sandy Ojang Onor / Umaru Babangida" },
  { id: "AA", label: "AA - Rufai Adekunle Omo-Aje / Shehu Hussaini" },
  { id: "ADP", label: "ADP - Aliyu Abbas-Bin / Chinazam Ike" },
  { id: "APP", label: "APP - Kabiru Yusuf / Peace Egobia Ofordile" },
  { id: "AAC", label: "AAC - Omoyele Sowore / Haruna Garba Magashi" },
  { id: "APM", label: "APM - Oluseyi Abiodun Makinde / Musa Lawal Daura" },
  { id: "BP", label: "BP - Sunday Adenuga / Usman Turaki Mustapha" },
  { id: "DLA", label: "DLA - Moses Olusoji Adebisi / Nafisat Usaku Abubakar" },
  { id: "NDP", label: "NDP - Ada Elizabeth Fredrick Okwori / Uchenna Anthony Chukwuemeka" },
  { id: "NRM", label: "NRM - Nkem Esther Okereke / Nasir Muhammed Sulaiman" },
  { id: "PRP", label: "PRP - Donald Duke / Kabiru Rabiu" },
  { id: "SDP", label: "SDP - Adewole Ebenezer Adebayo / Usman Muhammed Bugaje" },
  { id: "YPP", label: "YPP - Peter Ada Agada / Patience Ndidi Key" },
  { id: "ZLP", label: "ZLP - Daniel Daberechukwu Nwanyanwu / Hassan Khalid" }
];

export default function AgentPortal() {
  const router = useRouter();
  const [agent, setAgent] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Anti-rigging states
  const [showSos, setShowSos] = useState(false);
  const [sosType, setSosType] = useState("Violence / Thuggery");
  const [sosDesc, setSosDesc] = useState("");
  const [sosImage, setSosImage] = useState<File | null>(null);
  const [submittingSos, setSubmittingSos] = useState(false);

  const [showPvt, setShowPvt] = useState(false);
  const [pvtOk, setPvtOk] = useState("");
  const [opponents, setOpponents] = useState([
    { name: "APC", votes: "" }, 
    { name: "PDP", votes: "" },
    { name: "LP", votes: "" }
  ]);
  const [pvtImage, setPvtImage] = useState<File | null>(null);
  const [submittingPvt, setSubmittingPvt] = useState(false);

  useEffect(() => {
    const phone = localStorage.getItem("ok_agent_phone");
    if (!phone) {
      router.push("/login");
      return;
    }

    fetch(`/api/agents/${phone}`)
      .then(res => res.json())
      .then(agentData => {
        if (agentData.error) {
          localStorage.removeItem("ok_agent_phone");
          router.push("/login");
          return;
        }
        setAgent(agentData);
        // Fetch settings specifically for this agent's ward
        return fetch(`/api/settings?wardId=${agentData.wardId}`)
          .then(res => res.json())
          .then(settingsData => {
            setSettings(settingsData);
            setLoading(false);
          });
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("ok_agent_phone");
    router.push("/");
  };

  const handleSosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSos(true);
    try {
      let imageBase64 = null;
      if (sosImage) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(sosImage);
        });
      }

      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: agent.phone, 
          puId: agent.puId, 
          stateId: agent.stateId, 
          lgaId: agent.lgaId, 
          wardId: agent.wardId, 
          incidentType: sosType, 
          description: sosDesc,
          image: imageBase64
        })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit to server");
      }

      alert("SOS Alert sent successfully to National Command!");
      setShowSos(false); 
      setSosDesc("");
      setSosImage(null);
    } catch(err: any) { 
      alert("Failed to send SOS: " + (err.message || "Unknown error")); 
    }
    setSubmittingSos(false);
  };

  const handlePvtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPvt(true);
    try {
      let imageBase64 = null;
      if (pvtImage) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(pvtImage);
        });
      }

      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: agent.phone, 
          puId: agent.puId, 
          stateId: agent.stateId, 
          lgaId: agent.lgaId, 
          wardId: agent.wardId, 
          okVotes: pvtOk, 
          opponents,
          image: imageBase64 
        })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit to server");
      }

      alert("Result uploaded securely. Thank you for protecting the mandate!");
      setShowPvt(false);
      setPvtOk("");
      setOpponents([
        { name: "APC", votes: "" }, 
        { name: "PDP", votes: "" },
        { name: "LP", votes: "" }
      ]);
      setPvtImage(null);
    } catch(err: any) { 
      alert("Failed to upload result: " + (err.message || "Unknown error")); 
    }
    setSubmittingPvt(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Portal...</div>;
  }

  if (!agent) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-bold text-xl text-green-700 flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            Agent Portal
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
            Log out
          </Button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Welcome back, {agent.fullName.split(" ")[0]}!</h1>
          <p className="opacity-90 mt-2 text-lg">Your account is fully verified and active.</p>
        </div>

        {/* ANTI RIGGING COMMAND CENTER */}
        <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200 shadow-sm">
          <h3 className="text-red-800 font-bold text-lg mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            Anti-Rigging Tools
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Button onClick={() => {setShowSos(!showSos); setShowPvt(false)}} className="w-full bg-red-600 hover:bg-red-700 h-12 text-sm font-bold shadow-md">
              🚨 REPORT INCIDENT (SOS)
            </Button>
            <Button onClick={() => {setShowPvt(!showPvt); setShowSos(false)}} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-sm font-bold shadow-md">
              📊 UPLOAD PU RESULT
            </Button>
          </div>

          {/* SOS FORM */}
          {showSos && (
            <form onSubmit={handleSosSubmit} className="mt-4 p-4 bg-white rounded-xl border border-red-100 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700">Incident Type</label>
                <select value={sosType} onChange={e=>setSosType(e.target.value)} className="w-full mt-1 border rounded p-2 text-sm bg-gray-50">
                  <option>Violence / Thuggery</option>
                  <option>INEC Officials Absent</option>
                  <option>No Result Sheets (EC8A)</option>
                  <option>Voter Intimidation</option>
                  <option>Vote Buying</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Brief Description</label>
                <textarea value={sosDesc} onChange={e=>setSosDesc(e.target.value)} required className="w-full mt-1 border rounded p-2 text-sm bg-gray-50" rows={3} placeholder="Describe what is happening right now..."></textarea>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Attach Snapshot (Optional)</label>
                <input type="file" accept="image/*,video/*" onChange={e => { if(e.target.files && e.target.files.length > 0) setSosImage(e.target.files[0]) }} className="w-full mt-1 border rounded p-2 text-sm bg-gray-50" />
              </div>
              <Button disabled={submittingSos} type="submit" className="w-full bg-red-600 text-white font-bold h-10">{submittingSos ? "Sending Alert..." : "SEND SOS ALERT NOW"}</Button>
            </form>
          )}

          {/* PVT FORM */}
          {showPvt && (
            <form onSubmit={handlePvtSubmit} className="mt-4 p-4 bg-white rounded-xl border border-indigo-100 space-y-4">
              <p className="text-xs text-indigo-800 font-medium mb-2">Wait until voting has concluded and sorted before submitting.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-green-700">NDC - Peter Gregory Obi / Kwankwaso (OK Movement)</label>
                  <input type="number" required value={pvtOk} onChange={e=>setPvtOk(e.target.value)} className="w-full mt-1 border-2 border-green-300 rounded p-3 text-2xl font-bold bg-green-50" placeholder="0" />
                </div>
                {opponents.map((opp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <select value={opp.name} onChange={e => {
                        const newOpp = [...opponents];
                        newOpp[index].name = e.target.value;
                        setOpponents(newOpp);
                      }} className={`text-xs font-bold bg-transparent border-none p-0 outline-none w-[80%] ${index === 0 ? 'text-red-700' : 'text-gray-700'}`}>
                        <option value="">Select Party</option>
                        {PARTY_LIST.map(p => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                      {index > 1 && (
                        <button type="button" onClick={() => setOpponents(opponents.filter((_, i) => i !== index))} className="text-red-500 text-xs font-bold hover:underline cursor-pointer">Remove</button>
                      )}
                    </div>
                    <input type="number" required value={opp.votes} onChange={e => {
                      const newOpp = [...opponents];
                      newOpp[index].votes = e.target.value;
                      setOpponents(newOpp);
                    }} className={`w-full border rounded p-2 text-lg font-bold ${index === 0 ? 'bg-red-50' : 'bg-gray-50'}`} placeholder="0" />
                  </div>
                ))}
                <div className="col-span-2 mt-1">
                  <Button type="button" variant="outline" onClick={() => {
                    const used = opponents.map(o => o.name);
                    const nextParty = PARTY_LIST.find(p => !used.includes(p.id));
                    setOpponents([...opponents, { name: nextParty ? nextParty.id : "", votes: "" }]);
                  }} className="w-full text-xs font-bold border-dashed border-2 text-gray-500 hover:text-gray-700 h-10">
                    + ADD MORE PARTIES
                  </Button>
                </div>
                <div className="col-span-2 mt-2">
                  <label className="text-xs font-bold text-gray-700">Attach Result Sheet Snapshot</label>
                  <input type="file" required accept="image/*" onChange={e => { if(e.target.files && e.target.files.length > 0) setPvtImage(e.target.files[0]) }} className="w-full mt-1 border rounded p-2 text-sm bg-gray-50" />
                </div>
              </div>
              <Button disabled={submittingPvt} type="submit" className="w-full bg-indigo-600 text-white font-bold h-10">{submittingPvt ? "Uploading..." : "SUBMIT RESULT"}</Button>
            </form>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Assigned Location Card */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 border shadow-sm space-y-6">
            <h2 className="text-xl font-bold border-b pb-4">Your Assigned Location</h2>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
              <div>
                <p className="text-gray-500 font-medium">State</p>
                <p className="text-lg font-bold text-gray-900">{agent.stateName}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">LGA</p>
                <p className="text-lg font-bold text-gray-900">{agent.lgaName}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Ward</p>
                <p className="text-lg font-bold text-gray-900">{agent.wardName}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Polling Unit</p>
                <p className="text-lg font-bold text-gray-900">{agent.puName}</p>
              </div>
            </div>

            <div className="pt-4">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${agent.puName.split(' (')[0]} ${agent.wardName} ${agent.lgaName} ${agent.stateName} State Nigeria`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 h-14 text-lg text-white font-medium shadow-md shadow-blue-500/20 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                View on Google Maps
              </a>
            </div>
          </div>

          {/* Action Center */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                Coordination Group
              </h3>
              <p className="text-sm text-gray-600 mb-4">Join your Ward's official WhatsApp group to coordinate with other agents.</p>
              <a 
                href={settings?.wardGroupLink || settings?.nationalGroupLink || "#"} 
                target="_blank" rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center rounded-md bg-[#25D366] hover:bg-[#20b858] h-10 px-4 text-white font-medium shadow-md shadow-[#25D366]/20 transition-colors"
              >
                Join {settings?.wardGroupLink ? 'Ward' : 'National'} Group
              </a>
            </div>

            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 shadow-sm">
              <h3 className="font-bold text-orange-900 mb-2">Instructions</h3>
              <ul className="text-sm text-orange-800 space-y-2 list-disc pl-4">
                <li>Arrive at your Polling Unit by 7:30 AM.</li>
                <li>Report incident immediately in the WhatsApp group.</li>
                <li>Wait for the final vote count.</li>
              </ul>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
