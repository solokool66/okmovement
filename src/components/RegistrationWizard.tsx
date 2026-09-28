"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RegistrationWizard = () => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("sms");
  const [otp, setOtp] = useState("");
  
  // Data States
  const [states, setStates] = useState<any[]>([]);
  const [lgas, setLgas] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [pus, setPus] = useState<any[]>([]);
  
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedPu, setSelectedPu] = useState("");

  // 1. Fetch States on Mount
  useEffect(() => {
    fetch('/api/locations?type=states')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setStates(data);
      });
  }, []);

  // 2. Fetch LGAs when State changes
  useEffect(() => {
    if (!selectedState) return;
    setLgas([]); setWards([]); setSelectedLga(""); setSelectedWard(""); // Reset children
    fetch(`/api/locations?type=lgas&parentId=${selectedState}`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setLgas(data);
      });
  }, [selectedState]);

  // 3. Fetch Wards when LGA changes
  useEffect(() => {
    if (!selectedLga) return;
    setWards([]); setPus([]); setSelectedWard(""); setSelectedPu(""); // Reset children
    fetch(`/api/locations?type=wards&parentId=${selectedLga}`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setWards(data);
      });
  }, [selectedLga]);

  // 4. Fetch PUs when Ward changes
  useEffect(() => {
    if (!selectedWard) return;
    setPus([]); setSelectedPu(""); // Reset children
    fetch(`/api/locations?type=pus&parentId=${selectedWard}`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setPus(data);
      });
  }, [selectedWard]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, channel })
      });
      
      const data = await res.json();
      if (res.ok) {
        setStep(2);
      } else {
        setErrorMsg(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setErrorMsg("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      
      const data = await res.json();
      if (res.ok) {
        setStep(3);
      } else {
        setErrorMsg(data.error || "Invalid OTP");
      }
    } catch (err) {
      setErrorMsg("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          stateId: selectedState,
          lgaId: selectedLga,
          wardId: selectedWard,
          puId: selectedPu
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("ok_agent_phone", phone);
        setStep(4);
      } else {
        alert(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-600">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">OK Movement</CardTitle>
          <CardDescription className="text-gray-500">
            Grassroots Coordination & Registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {step === 1 && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4 fade-in">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" type="text" placeholder="e.g., John Doe" 
                  value={fullName} onChange={(e) => setFullName(e.target.value)} required 
                  className="text-lg py-6" disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" type="tel" placeholder="e.g., 08012345678" 
                  value={phone} onChange={(e) => setPhone(e.target.value)} required 
                  className="text-lg py-6" disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  We will send a one-time password (OTP) to verify this number.
                </p>
                {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
              </div>
              <div className="space-y-2 pt-2 pb-4">
                <Label>Receive OTP via:</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1">
                    <input type="radio" name="channel" value="sms" checked={channel === 'sms'} onChange={() => setChannel('sms')} className="text-green-600" />
                    <span className="font-medium text-sm">SMS Message</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1 border-green-200 bg-green-50/30">
                    <input type="radio" name="channel" value="whatsapp" checked={channel === 'whatsapp'} onChange={() => setChannel('whatsapp')} className="text-green-600" />
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    <span className="font-medium text-sm">WhatsApp</span>
                  </label>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg">
                {loading ? "Sending OTP..." : "Send Verification Code"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-4 fade-in">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter Verification Code</Label>
                <Input 
                  id="otp" type="text" placeholder="Enter 6-digit code" 
                  value={otp} onChange={(e) => setOtp(e.target.value)} required 
                  className="text-center text-2xl tracking-widest py-6" maxLength={6} disabled={loading}
                />
                <p className="text-xs text-gray-500 text-center">
                  Code sent to {phone}. <span className="text-green-600 font-medium cursor-pointer" onClick={() => setStep(1)}>Edit number</span>
                </p>
                {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg">
                {loading ? "Verifying..." : "Confirm Code"}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleLocationSubmit} className="space-y-5 fade-in">
              <div className="space-y-2">
                <Label>Select State</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-full text-lg py-6">
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedState && lgas.length > 0 && (
                <div className="space-y-2 fade-in">
                  <Label>Select LGA</Label>
                  <Select value={selectedLga} onValueChange={setSelectedLga}>
                    <SelectTrigger className="w-full text-lg py-6">
                      <SelectValue placeholder="Select an LGA" />
                    </SelectTrigger>
                    <SelectContent>
                      {lgas.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedLga && wards.length > 0 && (
                <div className="space-y-2 fade-in">
                  <Label>Select Ward</Label>
                  <Select value={selectedWard} onValueChange={setSelectedWard}>
                    <SelectTrigger className="w-full text-lg py-6">
                      <SelectValue placeholder="Select a Ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedWard && pus.length > 0 && (
                <div className="space-y-2 fade-in">
                  <Label>Select Polling Unit</Label>
                  <Select value={selectedPu} onValueChange={setSelectedPu}>
                    <SelectTrigger className="w-full text-lg py-6">
                      <SelectValue placeholder="Select a Polling Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {pus.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button type="submit" disabled={!selectedPu} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg mt-6">
                Continue
              </Button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center space-y-6 fade-in py-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Registration Complete!</h3>
                <p className="text-gray-500 mt-2">Thank you for registering. You have been assigned to your Polling Unit.</p>
              </div>
              <Button onClick={() => window.location.href = '/portal'} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg">
                Go to Agent Portal
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default RegistrationWizard;
