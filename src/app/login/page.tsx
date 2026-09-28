"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AgentLogin() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setErrorMsg("");

    try {
      // Send OTP (API now validates if user exists)
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, channel, isLogin: true })
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
        // Save auth to localStorage and redirect
        localStorage.setItem("ok_agent_phone", phone);
        router.push("/portal");
      } else {
        setErrorMsg(data.error || "Invalid OTP");
      }
    } catch (err) {
      setErrorMsg("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-sm font-semibold text-green-700 hover:underline flex items-center gap-2">
          &larr; Back to Home
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-600">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Agent Login</CardTitle>
          <CardDescription className="text-gray-500">Access your OK Movement Dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          
          {step === 1 && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" type="tel" placeholder="e.g., 08012345678" 
                  value={phone} onChange={(e) => setPhone(e.target.value)} required 
                  className="text-lg py-6" disabled={loading}
                />
                {errorMsg && <p className="text-sm text-red-500 mt-2">{errorMsg}</p>}
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
                    <span className="font-medium text-sm text-green-800">WhatsApp</span>
                  </label>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg">
                {loading ? "Sending..." : "Send Login Code"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter Verification Code</Label>
                <Input 
                  id="otp" type="text" placeholder="123456" 
                  value={otp} onChange={(e) => setOtp(e.target.value)} required 
                  className="text-center text-2xl tracking-widest py-6" maxLength={6} disabled={loading}
                />
                <p className="text-xs text-gray-500 text-center">
                  Code sent to {phone}. <span className="text-green-600 font-medium cursor-pointer" onClick={() => setStep(1)}>Edit</span>
                </p>
                {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg">
                {loading ? "Verifying..." : "Secure Login"}
              </Button>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
