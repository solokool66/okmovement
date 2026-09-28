import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { fullName, phone, stateId, lgaId, wardId, puId } = await request.json();

    if (!phone || !stateId || !puId || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // MVP LOCAL STORAGE: Since Supabase network connection is blocked,
    // we save the agent to a local file so the dashboard can update instantly!
    const dbPath = path.join(process.cwd(), 'prisma', 'agents.json');
    
    let agents = [];
    if (fs.existsSync(dbPath)) {
      agents = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }

    // Check if agent already exists
    if (agents.find((a: any) => a.phone === phone)) {
      return NextResponse.json({ error: "This phone number is already registered to an agent." }, { status: 409 });
    }

    // Save new agent
    agents.push({
      fullName,
      phone,
      stateId,
      lgaId,
      wardId,
      puId,
      registeredAt: new Date().toISOString(),
      status: "Verified"
    });

    fs.writeFileSync(dbPath, JSON.stringify(agents, null, 2));

    return NextResponse.json({ success: true, message: "Agent Registered Successfully" });
  } catch (err) {
    console.error("Registration Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
