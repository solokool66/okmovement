import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wardId = searchParams.get('wardId');

  const settingsPath = path.join(process.cwd(), 'prisma', 'settings.json');
  let settings = {
    primaryWhatsAppProvider: "FREE_WHATSAPP",
    primarySmsProvider: "SMART_SMS",
    nationalGroupLink: "https://chat.whatsapp.com/default-national-link"
  };

  if (fs.existsSync(settingsPath)) {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
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
    const settingsPath = path.join(process.cwd(), 'prisma', 'settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
