import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: Request, props: { params: Promise<{ phone: string }> }) {
  try {
    const params = await props.params;
    const agent = await prisma.registration.findUnique({
      where: { phone: params.phone },
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

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const enrichedAgent = {
      fullName: agent.fullName,
      phone: agent.phone,
      stateName: agent.pollingUnit?.ward?.lga?.state?.name || "Unknown",
      lgaName: agent.pollingUnit?.ward?.lga?.name || "Unknown",
      wardName: agent.pollingUnit?.ward?.name || "Unknown",
      puName: agent.pollingUnit ? `${agent.pollingUnit.name} (${agent.pollingUnit.code})` : "Unknown",
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
