import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      orderBy: { createdAt: 'desc' },
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

    const enrichedAgents = registrations.map(reg => ({
      fullName: reg.fullName,
      phone: reg.phone,
      stateName: reg.pollingUnit?.ward?.lga?.state?.name || "Unknown",
      lgaName: reg.pollingUnit?.ward?.lga?.name || "Unknown",
      wardName: reg.pollingUnit?.ward?.name || "Unknown",
      puName: reg.pollingUnit ? `${reg.pollingUnit.name} (${reg.pollingUnit.code})` : "Unknown",
      status: reg.isVerified ? "Verified" : "Pending",
      registeredAt: reg.createdAt,
      role: reg.role
    }));

    return NextResponse.json(enrichedAgents);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load agents" }, { status: 500 });
  }
}
