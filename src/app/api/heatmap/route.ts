import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      include: {
        pollingUnit: {
          include: {
            ward: {
              include: {
                lga: {
                  include: {
                    state: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const inecPath = path.join(process.cwd(), 'prisma', 'inec_data.json');
    let statesData: any[] = [];
    if (fs.existsSync(inecPath)) {
      statesData = JSON.parse(fs.readFileSync(inecPath, 'utf-8'));
    }

    const heatmapData = statesData.map(state => {
      // Find agents belonging to this state
      const stateAgents = registrations.filter(r => 
        r.pollingUnit?.ward?.lga?.state?.name.toLowerCase() === state.state.toLowerCase()
      );
      
      let totalLgas = state.lgas.length;
      let totalAgents = stateAgents.length;
      let totalPUs = 0;
      let coveredPUs = new Set(stateAgents.map(a => a.pollingUnitId)).size;

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

    heatmapData.sort((a, b) => b.totalAgents - a.totalAgents);

    const activeWards = new Set(registrations.map(a => a.pollingUnit?.wardId).filter(Boolean)).size;
    const coveredPus = new Set(registrations.map(a => a.pollingUnitId)).size;

    return NextResponse.json({
      totalRegistered: registrations.length,
      activeWards,
      coveredPus,
      pendingVerification: 0,
      heatmap: heatmapData
    });
  } catch (error) {
    console.error("Heatmap Error:", error);
    return NextResponse.json({ error: "Failed to load heatmap data" }, { status: 500 });
  }
}
