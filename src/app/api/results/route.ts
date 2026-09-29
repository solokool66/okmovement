import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { phone, puId, stateId, lgaId, wardId, okVotes, oppAVotes, oppBVotes, totalAccredited, opponents, image } = await request.json();

    if (!phone || !puId || okVotes === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const calculatedOppA = opponents && opponents[0] ? Number(opponents[0].votes) || 0 : Number(oppAVotes) || 0;
    const calculatedOppB = opponents && opponents[1] ? Number(opponents[1].votes) || 0 : Number(oppBVotes) || 0;

    // Check if result for this PU already exists
    const existingResult = await prisma.result.findFirst({
      where: { puId }
    });
    
    if (existingResult) {
      // Overwrite previous submission for this PU
      await prisma.result.update({
        where: { id: existingResult.id },
        data: {
          phone,
          stateId,
          lgaId,
          wardId,
          okVotes: Number(okVotes) || 0,
          oppAVotes: calculatedOppA,
          oppBVotes: calculatedOppB,
          opponents: opponents || [],
          image: image || null,
          totalAccredited: Number(totalAccredited) || 0,
        }
      });
    } else {
      await prisma.result.create({
        data: {
          phone,
          puId,
          stateId,
          lgaId,
          wardId,
          okVotes: Number(okVotes) || 0,
          oppAVotes: calculatedOppA,
          oppBVotes: calculatedOppB,
          opponents: opponents || [],
          image: image || null,
          totalAccredited: Number(totalAccredited) || 0,
          status: "PENDING_VERIFICATION"
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to submit result" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const results = await prisma.result.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const fs = require('fs');
    const path = require('path');
    const inecPath = path.join(process.cwd(), 'prisma', 'inec_data.json');
    let statesData: any[] = [];
    if (fs.existsSync(inecPath)) {
      statesData = JSON.parse(fs.readFileSync(inecPath, 'utf-8'));
    }

    let totalOk = 0;
    let totalOppA = 0;
    let totalOppB = 0;
    let oppAName = "Opponent A";
    let oppBName = "Opponent B";
    let totalPUsSubmitted = results.length;

    const sampleWithOpp = results.find(r => r.opponents && Array.isArray(r.opponents) && r.opponents.length >= 2);
    if (sampleWithOpp) {
      oppAName = (sampleWithOpp.opponents as any)[0].name;
      oppBName = (sampleWithOpp.opponents as any)[1].name;
    }

    const enrichedResults = results.map((r: any) => {
      totalOk += r.okVotes || 0;
      totalOppA += r.opponents && Array.isArray(r.opponents) && r.opponents[0] ? Number(r.opponents[0].votes) || 0 : (r.oppAVotes || 0);
      totalOppB += r.opponents && Array.isArray(r.opponents) && r.opponents[1] ? Number(r.opponents[1].votes) || 0 : (r.oppBVotes || 0);

      let puName = r.puId;
      const stateObj = statesData.find((s: any) => s.state.toLowerCase() === r.stateId);
      if (stateObj) {
        const lgaObj = stateObj.lgas.find((l: any) => l.lga.toLowerCase().replace(/[\s/]/g, '-') === r.lgaId);
        if (lgaObj) {
          const wardObj = lgaObj.wards.find((w: any) => w.ward.toLowerCase().replace(/[\s/]/g, '-') === r.wardId);
          if (wardObj) {
            const puObj = wardObj.polling_units.find((p: any) => p.code === r.puId);
            if (puObj) {
              puName = `${puObj.name} (${puObj.code})`;
            }
          }
        }
      }

      return {
        ...r,
        puName,
        timestamp: r.createdAt
      };
    });

    return NextResponse.json({
      summary: { totalOk, totalOppA, totalOppB, totalPUsSubmitted, oppAName, oppBName },
      results: enrichedResults
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load results" }, { status: 500 });
  }
}
