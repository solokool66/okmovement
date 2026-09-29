import { NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple in-memory store for OTPs during development to avoid Redis requirement
const otpStore = new Map<string, { otp: string, expires: number }>();

export async function POST(request: Request) {
  try {
    const { phone, channel, isLogin } = await request.json();
    
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Check if agent is already registered BEFORE sending OTP
    const isAgent = await prisma.registration.findUnique({
      where: { phone }
    });
      
    if (!isLogin && isAgent) {
      return NextResponse.json({ error: "This phone number is already registered. Please login instead." }, { status: 409 });
    }
    if (isLogin && !isAgent) {
      return NextResponse.json({ error: "No agent found with this number." }, { status: 404 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in memory for 10 minutes (600 seconds)
    otpStore.set(phone, { otp, expires: Date.now() + 10 * 60 * 1000 });
    
    // Also attach it to global for cross-request sharing in Next.js dev server
    (global as any).otpStore = otpStore;

    const message = `Your OK Movement verification number is: ${otp}. Valid for 10 minutes.`;

    // Send the SMS
    const result = await sendSMS(phone, message, channel);

    if (result.success) {
      return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } else {
      console.error("SMS Provider Failure:", result);
      return NextResponse.json({ error: "Failed to send OTP via SMS provider" }, { status: 500 });
    }

  } catch (error) {
    console.error("OTP Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

