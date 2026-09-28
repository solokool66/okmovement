import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const parentId = searchParams.get('parentId');

  try {
    const dataPath = path.join(process.cwd(), 'prisma', 'inec_data.json');
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ error: "Dataset missing" }, { status: 500 });
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const statesData = JSON.parse(rawData);

    if (type === 'states') {
      const states = statesData.map((s: any) => ({
        id: s.state.toLowerCase(),
        name: s.state
      }));
      return NextResponse.json(states);
    }
    
    if (type === 'lgas' && parentId) {
      const stateObj = statesData.find((s: any) => s.state.toLowerCase() === parentId);
      if (!stateObj) return NextResponse.json([]);
      
      const lgas = stateObj.lgas.map((l: any) => ({
        id: l.lga.toLowerCase().replace(/[\s/]/g, '-'),
        name: l.lga
      }));
      return NextResponse.json(lgas);
    }
    
    if (type === 'wards' && parentId) {
      // Find the LGA across all states
      let foundLga: any = null;
      for (const s of statesData) {
        foundLga = s.lgas.find((l: any) => l.lga.toLowerCase().replace(/[\s/]/g, '-') === parentId);
        if (foundLga) break;
      }
      
      if (!foundLga) return NextResponse.json([]);
      
      const wards = foundLga.wards.map((w: any) => ({
        id: w.ward.toLowerCase().replace(/[\s/]/g, '-'),
        name: w.ward
      }));
      return NextResponse.json(wards);
    }
    
    if (type === 'pus' && parentId) {
      // Find the Ward across all states and LGAs
      let foundWard: any = null;
      for (const s of statesData) {
        for (const l of s.lgas) {
          foundWard = l.wards.find((w: any) => w.ward.toLowerCase().replace(/[\s/]/g, '-') === parentId);
          if (foundWard) break;
        }
        if (foundWard) break;
      }
      
      if (!foundWard) return NextResponse.json([]);
      
      const pus = foundWard.polling_units.map((pu: any) => ({
        id: pu.code,
        name: pu.name
      }));
      return NextResponse.json(pus);
    }

    return NextResponse.json([]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
