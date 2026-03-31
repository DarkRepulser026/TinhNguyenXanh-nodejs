#!/usr/bin/env node

const { connectToDatabase, mongoose } = require('../utils/mongo-connection');

async function runReset() {
  await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB database connection is not available.');
  }

  const beforeCollections = await db.listCollections().toArray();
  const dropped = await db.dropDatabase();
  const afterCollections = await db.listCollections().toArray();

  console.log('Database reset completed.');
  console.log(`Database drop result: ${dropped ? 'ok' : 'failed'}`);
  console.log(`Collections before drop: ${beforeCollections.length}`);
  console.log(`Collections after drop: ${afterCollections.length}`);
}

runReset()
  .catch((error) => {
    console.error('Database reset failed:', error.stack || error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });
