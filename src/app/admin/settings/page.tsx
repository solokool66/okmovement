"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    primaryWhatsAppProvider: "FREE_WHATSAPP",
    primarySmsProvider: "SMART_SMS",
    nationalGroupLink: ""
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) alert("Settings saved successfully!");
      else alert("Failed to save settings");
    } catch (e) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Platform Settings</h2>
        <p className="text-gray-500 mt-1">Configure your OK Movement integrations and routing.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <Card className="shadow-sm border-t-4 border-t-blue-600">
          <CardHeader>
            <CardTitle>SMS & WhatsApp Routing</CardTitle>
            <CardDescription>Select the active providers for OTP delivery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Primary WhatsApp Provider</Label>
                <select 
                  className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={settings.primaryWhatsAppProvider}
                  onChange={(e) => setSettings({...settings, primaryWhatsAppProvider: e.target.value})}
                >
                  <option value="FREE_WHATSAPP">Free WhatsApp (Local Microservice)</option>
                  <option value="TERMII">Termii API</option>
                  <option value="SENDCHAMP">Sendchamp API</option>
                </select>
                <p className="text-xs text-green-600 mt-1">Currently active: {settings.primaryWhatsAppProvider}</p>
              </div>

              <div className="space-y-2">
                <Label>Primary SMS Provider</Label>
                <select 
                  className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={settings.primarySmsProvider}
                  onChange={(e) => setSettings({...settings, primarySmsProvider: e.target.value})}
                >
                  <option value="SMART_SMS">Smart SMS Solutions</option>
                  <option value="TERMII">Termii API</option>
                </select>
                <p className="text-xs text-green-600 mt-1">Currently active: {settings.primarySmsProvider}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-green-600">
          <CardHeader>
            <CardTitle>WhatsApp Group Configuration</CardTitle>
            <CardDescription>Default fallback group link for unassigned wards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>National WhatsApp Group Link</Label>
              <Input 
                type="url" 
                placeholder="https://chat.whatsapp.com/..." 
                value={settings.nationalGroupLink}
                onChange={(e) => setSettings({...settings, nationalGroupLink: e.target.value})}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-purple-600">
          <CardHeader>
            <CardTitle>API Keys (Read-Only via .env)</CardTitle>
            <CardDescription>To change these, edit the .env file on your server.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Termii API Key</Label>
              <Input type="password" value="*************************" disabled />
            </div>
            <div className="space-y-2">
              <Label>Sendchamp Public Key</Label>
              <Input type="password" value="*************************" disabled />
            </div>
            <div className="space-y-2">
              <Label>Smart SMS Token</Label>
              <Input type="password" value="*************************" disabled />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-8">
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </form>
    </div>
  );
}
