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

    const heatmapData = statesData.map(state => {
      const stateAgents = agents.filter(a => a.stateId === state.state.toLowerCase());
      
      let totalLgas = state.lgas.length;
      let totalAgents = stateAgents.length;
      let totalPUs = 0;
      let coveredPUs = new Set(stateAgents.map(a => a.puId)).size;

      state.lgas.forEach((lga: any) => {
        lga.wards.forEach((ward: any) => {
          totalPUs += ward.polling_units.length;
        });
      });

      const coverage = totalPUs > 0 ? Math.round((coveredPUs / totalPUs) * 100) : 0;
      
      let status = 'Poor';
      let colorClass = 'bg-red-100 text-red-800 border-red-600';
      
      if (coverage >= 80) {
        status = 'Strong';
        colorClass = 'bg-green-100 text-green-800 border-green-600';
      } else if (coverage >= 40) {
        status = 'Partial';
        colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-600';
      }

      return {
        id: state.state.toLowerCase(),
        name: state.state,
        totalLgas,
        totalAgents,
        coverage,
        status,
        colorClass
      };
    });

    // Sort so states with the most agents are at the top!
    heatmapData.sort((a, b) => b.totalAgents - a.totalAgents);

    // Calculate Pending Verification
    const otpsPath = path.join(process.cwd(), 'prisma', 'otps.json');
    let pendingVerification = 0;
    if (fs.existsSync(otpsPath)) {
      const otps = JSON.parse(fs.readFileSync(otpsPath, 'utf-8'));
      // Count unique phone numbers in otps.json that are NOT in agents.json
      const allOtpPhones = new Set(Object.keys(otps));
      agents.forEach(a => allOtpPhones.delete(a.phone));
      pendingVerification = allOtpPhones.size;
    }

    return NextResponse.json({
      totalRegistered: agents.length,
      activeWards: new Set(agents.map(a => a.wardId)).size,
      coveredPus: new Set(agents.map(a => a.puId)).size,
      pendingVerification,
      heatmap: heatmapData
    });
  } catch (error) {
    console.error("Heatmap Error:", error);
    return NextResponse.json({ error: "Failed to load heatmap data" }, { status: 500 });
  }
}
