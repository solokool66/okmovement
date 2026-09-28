import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { wardId, link } = await request.json();

    if (!wardId || !link) {
      return NextResponse.json({ error: "wardId and link are required" }, { status: 400 });
    }

    const wardLinksPath = path.join(process.cwd(), 'prisma', 'ward_links.json');
    let wardLinks: Record<string, string> = {};

    if (fs.existsSync(wardLinksPath)) {
      wardLinks = JSON.parse(fs.readFileSync(wardLinksPath, 'utf-8'));
    }

    wardLinks[wardId] = link;
    fs.writeFileSync(wardLinksPath, JSON.stringify(wardLinks, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save ward link" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const wardLinksPath = path.join(process.cwd(), 'prisma', 'ward_links.json');
    let wardLinks = {};
    if (fs.existsSync(wardLinksPath)) {
      wardLinks = JSON.parse(fs.readFileSync(wardLinksPath, 'utf-8'));
    }
    return NextResponse.json(wardLinks);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load ward links" }, { status: 500 });
  }
}
