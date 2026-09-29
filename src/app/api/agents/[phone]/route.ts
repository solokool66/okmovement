import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: Request, props: { params: Promise<{ phone: string }> }) {
  try {
    const params = await props.params;
    const agent = await prisma.registration.findUnique({
      where: { phone: params.phone }
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const fs = require('fs');
    const path = require('path');
    const inecPath = path.join(process.cwd(), 'prisma', 'inec_data.json');
    let statesData: any[] = [];
    if (fs.existsSync(inecPath)) {
      statesData = JSON.parse(fs.readFileSync(inecPath, 'utf-8'));
    }

    let stateName = agent.stateId;
    let lgaName = agent.lgaId;
    let wardName = agent.wardId;
    let puName = agent.pollingUnitId;

    const stateObj = statesData.find((s: any) => s.state.toLowerCase() === agent.stateId);
    if (stateObj) {
      stateName = stateObj.state;
      const lgaObj = stateObj.lgas.find((l: any) => l.lga.toLowerCase().replace(/[\s/]/g, '-') === agent.lgaId);
      if (lgaObj) {
        lgaName = lgaObj.lga;
        const wardObj = lgaObj.wards.find((w: any) => w.ward.toLowerCase().replace(/[\s/]/g, '-') === agent.wardId);
        if (wardObj) {
          wardName = wardObj.ward;
          const puObj = wardObj.polling_units.find((p: any) => p.code === agent.pollingUnitId);
          if (puObj) {
            puName = `${puObj.name} (${puObj.code})`;
          }
        }
      }
    }

    const enrichedAgent = {
      fullName: agent.fullName,
      phone: agent.phone,
      stateId: agent.stateId,
      lgaId: agent.lgaId,
      wardId: agent.wardId,
      puId: agent.pollingUnitId,
      stateName,
      lgaName,
      wardName,
      puName,
      status: agent.isVerified ? "Verified" : "Pending",
      registeredAt: agent.createdAt,
      role: agent.role
    };

    return NextResponse.json(enrichedAgent);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ phone: string }> }) {
  try {
    const params = await props.params;
    
    await prisma.registration.delete({
      where: { phone: params.phone }
    });

    return NextResponse.json({ success: true, message: "Agent deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Agent not found or Internal Error" }, { status: 500 });
  }
}
