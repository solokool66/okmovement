import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, props: { params: Promise<{ stateId: string }> }) {
  try {
    const params = await props.params;
    const { stateId } = params;

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

    const stateObj = statesData.find((s: any) => s.state.toLowerCase() === stateId.toLowerCase());
    if (!stateObj) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }

    const stateAgents = agents.filter((a: any) => a.stateId === stateId.toLowerCase());

    const lgaHeatmap = stateObj.lgas.map((lga: any) => {
      const lgaId = lga.lga.toLowerCase().replace(/[\s/]/g, '-');
      const lgaAgents = stateAgents.filter((a: any) => a.lgaId === lgaId);
      
      let totalPUs = 0;
      let coveredPUs = new Set(lgaAgents.map((a: any) => a.puId)).size;

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
        totalWards: lga.wards.length,
        totalPUs,
        totalAgents: lgaAgents.length,
        coverage,
        status,
        colorClass
      };
    });

    lgaHeatmap.sort((a: any, b: any) => b.totalAgents - a.totalAgents);

    return NextResponse.json({
      stateName: stateObj.state,
      totalRegistered: stateAgents.length,
      activeLgas: new Set(stateAgents.map((a: any) => a.lgaId)).size,
      coveredPus: new Set(stateAgents.map((a: any) => a.puId)).size,
      totalStatePUs: lgaHeatmap.reduce((sum: number, lga: any) => sum + lga.totalPUs, 0),
      heatmap: lgaHeatmap
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to load state heatmap" }, { status: 500 });
  }
}
