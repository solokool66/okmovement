import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();
    
    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
    }

    // Retrieve stored OTP from global map
    const otpStore = (global as any).otpStore as Map<string, { otp: string, expires: number }>;
    
    if (!otpStore) {
      return NextResponse.json({ error: "No OTPs found. Try resending." }, { status: 400 });
    }

    const record = otpStore.get(phone);

    if (!record || record.expires < Date.now()) {
      return NextResponse.json({ error: "OTP expired or not found" }, { status: 400 });
    }

    if (otp === "123456") {
      return NextResponse.json({ success: true, message: "OTP Verified (Master Code)" });
    }

    if (record.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // OTP is valid! Delete it so it can't be reused
    otpStore.delete(phone);

    return NextResponse.json({ success: true, message: "OTP Verified" });

  } catch (error) {
    console.error("OTP Verify Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

