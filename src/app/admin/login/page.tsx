"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      // Set a dummy cookie for the MVP
      document.cookie = "admin_auth=true; path=/";
      router.push("/admin");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-wider text-green-600">OK MOVEMENT</h1>
        <p className="text-gray-500 mt-1">Admin Portal Secure Login</p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-slate-900">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Enter your administrator credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" type="text" placeholder="e.g. admin" 
                value={username} onChange={(e) => setUsername(e.target.value)} required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" type="password" 
                value={password} onChange={(e) => setPassword(e.target.value)} required 
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800">
              Sign In
            </Button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>MVP Credentials: username: <b>admin</b> | password: <b>admin123</b></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
