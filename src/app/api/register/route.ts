import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { fullName, phone, stateId, lgaId, wardId, puId } = await request.json();

    if (!phone || !stateId || !puId || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if agent already exists
    const existing = await prisma.registration.findUnique({
      where: { phone }
    });

    if (existing) {
      return NextResponse.json({ error: "This phone number is already registered to an agent." }, { status: 409 });
    }

    // Save new agent to Database
    await prisma.registration.create({
      data: {
        fullName,
        phone,
        stateId,
        lgaId,
        wardId,
        pollingUnitId: puId,
        isVerified: true,
        role: "Agent"
      }
    });

    return NextResponse.json({ success: true, message: "Agent Registered Successfully" });
  } catch (err) {
    console.error("Registration Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
