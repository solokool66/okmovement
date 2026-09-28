import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, props: { params: Promise<{ phone: string }> }) {
  try {
    const params = await props.params;
    const dbPath = path.join(process.cwd(), 'prisma', 'agents.json');
    let agents: any[] = [];
    if (fs.existsSync(dbPath)) {
      agents = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }

    const agent = agents.find(a => a.phone === params.phone);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Enrich with names
    const inecPath = path.join(process.cwd(), 'prisma', 'inec_data.json');
    if (fs.existsSync(inecPath)) {
      const statesData = JSON.parse(fs.readFileSync(inecPath, 'utf-8'));
      const stateObj = statesData.find((s: any) => s.state.toLowerCase() === agent.stateId);
      if (stateObj) {
        agent.stateName = stateObj.state;
        const lgaObj = stateObj.lgas.find((l: any) => l.lga.toLowerCase().replace(/[\s/]/g, '-') === agent.lgaId);
        if (lgaObj) {
          agent.lgaName = lgaObj.lga;
          const wardObj = lgaObj.wards.find((w: any) => w.ward.toLowerCase().replace(/[\s/]/g, '-') === agent.wardId);
          if (wardObj) {
            agent.wardName = wardObj.ward;
            const puObj = wardObj.polling_units.find((p: any) => p.code === agent.puId);
            if (puObj) {
              agent.puName = `${puObj.name} (${puObj.code})`;
            }
          }
        }
      }
    }

    return NextResponse.json(agent);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ phone: string }> }) {
  try {
    const params = await props.params;
    const dbPath = path.join(process.cwd(), 'prisma', 'agents.json');
    let agents: any[] = [];
    if (fs.existsSync(dbPath)) {
      agents = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }

    const filteredAgents = agents.filter(a => a.phone !== params.phone);
    
    // Only write if something was actually removed
    if (filteredAgents.length < agents.length) {
      fs.writeFileSync(dbPath, JSON.stringify(filteredAgents, null, 2));
      return NextResponse.json({ success: true, message: "Agent deleted successfully" });
    } else {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
