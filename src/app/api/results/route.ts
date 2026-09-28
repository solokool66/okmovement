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

    // Tally up nationwide totals
    let totalOk = 0;
    let totalOppA = 0;
    let totalOppB = 0;
    let totalPUsSubmitted = results.length;

    results.forEach((r: any) => {
      totalOk += r.okVotes || 0;
      totalOppA += r.opponents && Array.isArray(r.opponents) && r.opponents[0] ? Number(r.opponents[0].votes) || 0 : (r.oppAVotes || 0);
      totalOppB += r.opponents && Array.isArray(r.opponents) && r.opponents[1] ? Number(r.opponents[1].votes) || 0 : (r.oppBVotes || 0);
    });

    return NextResponse.json({
      summary: { totalOk, totalOppA, totalOppB, totalPUsSubmitted },
      results
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load results" }, { status: 500 });
  }
}
