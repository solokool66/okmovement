import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'prisma', 'agents.json');
    let agents: any[] = [];
    if (fs.existsSync(dbPath)) {
      agents = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }

    const inecPath = path.join(process.cwd(), 'prisma', 'inec_data.json');
    let statesData: any[] = [];
    if (fs.existsSync(inecPath)) {
      statesData = JSON.parse(fs.readFileSync(inecPath, 'utf-8'));
    }

    // Resolve IDs to human-readable names
    const enrichedAgents = agents.map(agent => {
      let stateName = agent.stateId;
      let lgaName = agent.lgaId;
      let wardName = agent.wardId;
      let puName = agent.puId;

      const stateObj = statesData.find((s: any) => s.state.toLowerCase() === agent.stateId);
      if (stateObj) {
        stateName = stateObj.state;
        const lgaObj = stateObj.lgas.find((l: any) => l.lga.toLowerCase().replace(/[\s/]/g, '-') === agent.lgaId);
        if (lgaObj) {
          lgaName = lgaObj.lga;
          const wardObj = lgaObj.wards.find((w: any) => w.ward.toLowerCase().replace(/[\s/]/g, '-') === agent.wardId);
          if (wardObj) {
            wardName = wardObj.ward;
            const puObj = wardObj.polling_units.find((p: any) => p.code === agent.puId);
            if (puObj) {
              puName = `${puObj.name} (${puObj.code})`;
            }
          }
        }
      }

      return {
        ...agent,
        stateName,
        lgaName,
        wardName,
        puName
      };
    });

    // Sort by newest first
    enrichedAgents.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());

    return NextResponse.json(enrichedAgents);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load agents" }, { status: 500 });
  }
}
