import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { phone, incidentType, description, puId, stateId, lgaId, wardId, image } = await request.json();

    if (!phone || !incidentType || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.incident.create({
      data: {
        phone,
        incidentType,
        description,
        puId,
        stateId,
        lgaId,
        wardId,
        image: image || null,
        status: "UNRESOLVED"
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to report incident" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(incidents);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load incidents" }, { status: 500 });
  }
}
