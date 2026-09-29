import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const inecPath = path.join(process.cwd(), 'prisma', 'inec_data.json');
    let statesData: any[] = [];
    if (fs.existsSync(inecPath)) {
      statesData = JSON.parse(fs.readFileSync(inecPath, 'utf-8'));
    }

    const enrichedAgents = registrations.map(reg => {
      let stateName = reg.stateId;
      let lgaName = reg.lgaId;
      let wardName = reg.wardId;
      let puName = reg.pollingUnitId;

      const stateObj = statesData.find((s: any) => s.state.toLowerCase() === reg.stateId);
      if (stateObj) {
        stateName = stateObj.state;
        const lgaObj = stateObj.lgas.find((l: any) => l.lga.toLowerCase().replace(/[\s/]/g, '-') === reg.lgaId);
        if (lgaObj) {
          lgaName = lgaObj.lga;
          const wardObj = lgaObj.wards.find((w: any) => w.ward.toLowerCase().replace(/[\s/]/g, '-') === reg.wardId);
          if (wardObj) {
            wardName = wardObj.ward;
            const puObj = wardObj.polling_units.find((p: any) => p.code === reg.pollingUnitId);
            if (puObj) {
              puName = `${puObj.name} (${puObj.code})`;
            }
          }
        }
      }

      return {
        fullName: reg.fullName,
        phone: reg.phone,
        stateName,
        lgaName,
        wardName,
        puName,
        status: reg.isVerified ? "Verified" : "Pending",
        registeredAt: reg.createdAt,
        role: reg.role
      };
    });

    return NextResponse.json(enrichedAgents);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load agents" }, { status: 500 });
  }
}
