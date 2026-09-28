import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('id');

    if (!stateId) return NextResponse.json({ error: "Missing state ID" }, { status: 400 });

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

    const stateObj = statesData.find(s => s.state.toLowerCase() === stateId.toLowerCase());
    if (!stateObj) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }

    const stateAgents = agents.filter(a => a.stateId === stateObj.state.toLowerCase());

    const lgasData = stateObj.lgas.map((lga: any) => {
      const lgaId = lga.lga.toLowerCase().replace(/[\s/]/g, '-');
      const lgaAgents = stateAgents.filter(a => a.lgaId === lgaId);
      
      let totalWards = lga.wards.length;
      let totalAgents = lgaAgents.length;
      let totalPUs = 0;
      let coveredPUs = new Set(lgaAgents.map(a => a.puId)).size;

      lga.wards.forEach((ward: any) => {
        totalPUs += ward.polling_units.length;
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
        id: lgaId,
        name: lga.lga,
        totalWards,
        totalAgents,
        coverage,
        status,
        colorClass
      };
    });

    // Sort by agents descending
    lgasData.sort((a: any, b: any) => b.totalAgents - a.totalAgents);

    return NextResponse.json({
      stateName: stateObj.state,
      lgas: lgasData
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load state heatmap data" }, { status: 500 });
  }
}
