import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wardId = searchParams.get('wardId');

  let settings = {
    primaryWhatsAppProvider: "FREE_WHATSAPP",
    primarySmsProvider: "SMART_SMS",
    nationalGroupLink: "https://chat.whatsapp.com/default-national-link"
  };

  try {
    const dbSettings = await prisma.setting.findMany();
    dbSettings.forEach(s => {
      (settings as any)[s.key] = s.value;
    });
  } catch (e) {
    // DB table might not exist yet if migrations haven't run, fallback to defaults
  }

  // Look up ward link if requested
  if (wardId) {
    const wardLinksPath = path.join(process.cwd(), 'prisma', 'ward_links.json');
    if (fs.existsSync(wardLinksPath)) {
      const wardLinks = JSON.parse(fs.readFileSync(wardLinksPath, 'utf-8'));
      if (wardLinks[wardId]) {
        (settings as any).wardGroupLink = wardLinks[wardId];
      }
    }
  }

  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Save to database
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        await prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
