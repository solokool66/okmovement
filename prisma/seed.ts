import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// This script expects a JSON file containing the INEC dataset.
// Due to the size of the polling unit dataset (176k+ rows), we will process it in chunks.
// Expected JSON structure:
// [
//   {
//     "state": "Rivers",
//     "lgas": [
//       {
//         "lga": "Obio/Akpor",
//         "wards": [
//           {
//             "ward": "Rumuokwuta",
//             "polling_units": [
//               { "name": "Town Hall", "code": "32-11-04-012" }
//             ]
//           }
//         ]
//       }
//     ]
//   }
// ]

async function main() {
  console.log('Starting Database Seeding...');
  
  // Example path for the local dataset file (You will place the downloaded INEC JSON here)
  const dataPath = path.join(process.cwd(), 'prisma', 'inec_data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.warn(`[WARNING] Dataset not found at ${dataPath}.`);
    console.warn('Please download the INEC dataset and place it as inec_data.json in the prisma directory.');
    console.warn('Skipping seeding process.');
    return;
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const statesData = JSON.parse(rawData);

  console.log(`Found ${statesData.length} States to process.`);

  // We use sequential processing to maintain relational integrity and prevent connection pooling exhaustion
  for (const stateData of statesData) {
    console.log(`Processing State: ${stateData.state}`);
    
    // 1. Create State
    const state = await prisma.state.upsert({
      where: { name: stateData.state },
      update: {},
      create: { name: stateData.state },
    });

    for (const lgaData of stateData.lgas) {
      // 2. Create LGA
      const lga = await prisma.lga.upsert({
        where: { name_stateId: { name: lgaData.lga, stateId: state.id } },
        update: {},
        create: { name: lgaData.lga, stateId: state.id },
      });

      for (const wardData of lgaData.wards) {
        // 3. Create Ward
        const ward = await prisma.ward.upsert({
          where: { name_lgaId: { name: wardData.ward, lgaId: lga.id } },
          update: {},
          create: { name: wardData.ward, lgaId: lga.id },
        });

        // 4. Batch Create Polling Units (To handle massive inserts safely)
        const puPayloads = wardData.polling_units.map((pu: any) => ({
          name: pu.name,
          code: pu.code,
          wardId: ward.id,
          target_capacity: 5, // Default capacity
          current_count: 0
        }));

        if (puPayloads.length > 0) {
          await prisma.pollingUnit.createMany({
            data: puPayloads,
            skipDuplicates: true, // Crucial for re-running the seed script safely
          });
        }
      }
    }
  }

  console.log('Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
