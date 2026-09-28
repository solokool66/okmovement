import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { message, targetType, targetState } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const dbPath = path.join(process.cwd(), 'prisma', 'agents.json');
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "No agents found" }, { status: 404 });
    }

    const agents = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    let targetAgents = agents;

    if (targetType === 'STATE' && targetState) {
      targetAgents = agents.filter((a: any) => a.stateId === targetState.toLowerCase());
    }

    if (targetAgents.length === 0) {
      return NextResponse.json({ error: "No agents match this target" }, { status: 404 });
    }

    let queuedCount = 0;
    let failedCount = 0;

    // We do NOT await all fetches sequentially because Express handles the queue instantly
    // We send all requests to the local microservice in parallel
    const promises = targetAgents.map(async (agent: any) => {
      try {
        const res = await fetch("http://127.0.0.1:3005/api/send-whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: agent.phone, message }),
          signal: AbortSignal.timeout(5000)
        });
        
        if (res.ok) queuedCount++;
        else failedCount++;
      } catch (err) {
        failedCount++;
      }
    });

    await Promise.all(promises);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully queued ${queuedCount} messages. Failed: ${failedCount}.` 
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
