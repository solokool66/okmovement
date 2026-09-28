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

    // Prepare CSV Header
    let csvData = "Full Name,Phone Number,State,LGA,Ward,Polling Unit Code,Polling Unit Name,Status,Date Registered\n";

    // Prepare CSV Rows
    agents.forEach(agent => {
      let stateName = agent.stateId;
      let lgaName = agent.lgaId;
      let wardName = agent.wardId;
      let puName = agent.puId;
      let puCode = agent.puId;

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
              puName = puObj.name;
            }
          }
        }
      }

      // Escape quotes and commas
      const cleanField = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;

      csvData += `${cleanField(agent.fullName)},${cleanField(agent.phone)},${cleanField(stateName)},${cleanField(lgaName)},${cleanField(wardName)},${cleanField(puCode)},${cleanField(puName)},${cleanField(agent.status)},${cleanField(new Date(agent.registeredAt).toLocaleString())}\n`;
    });

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="ok_movement_agents.csv"',
      },
    });
  } catch (error) {
    return new NextResponse("Failed to export data", { status: 500 });
  }
}
