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
  const [channel, setChannel] = useState("whatsapp");
  const [resendTimer, setResendTimer] = useState(120);
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

  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [step, resendTimer]);

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
        body: JSON.stringify({ phone, channel: "whatsapp" }) // Always default to WhatsApp first
      });
      
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setResendTimer(120);
        setChannel("whatsapp");
      } else {
        setErrorMsg(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setErrorMsg("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendSms = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, channel: "sms" })
      });
      const data = await res.json();
      if (res.ok) {
        setResendTimer(120);
        setChannel("sms");
        alert("OTP sent via SMS!");
      } else {
        setErrorMsg(data.error || "Failed to resend OTP via SMS");
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
              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg mt-4">
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
                <p className="text-xs text-gray-500 text-center mt-2">
                  Code sent via <span className="font-bold text-gray-700">{channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}</span> to {phone}. <span className="text-green-600 font-medium cursor-pointer ml-1" onClick={() => setStep(1)}>Edit number</span>
                </p>
                {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}
                
                <div className="pt-2 text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-gray-400">
                      Didn't get the code? Resend via SMS in {resendTimer}s
                    </p>
                  ) : (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleResendSms} 
                      disabled={loading}
                      className="w-full text-sm mt-2 border-gray-300 hover:bg-gray-50 text-gray-700"
                    >
                      Resend via SMS
                    </Button>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg mt-2">
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
