const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function parseEnvValue(raw) {
  let value = raw.trim();
  if (!value) return '';
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return value;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;
    const rawValue = trimmed.slice(separatorIndex + 1);
    process.env[key] = parseEnvValue(rawValue);
  }
}

function loadEnvironment() {
  const rootDir = path.resolve(__dirname, '..');
  loadEnvFile(path.join(rootDir, '.env'));
  loadEnvFile(path.join(rootDir, '.env.local'));
  loadEnvFile(path.join(rootDir, '.env.example'));
}

function loadSchemas(schemaDir) {
  if (!fs.existsSync(schemaDir)) {
    throw new Error(`Schema directory not found: ${schemaDir}`);
  }

  const files = fs
    .readdirSync(schemaDir)
    .filter((file) => file.endsWith('.js') || file.endsWith('.ts'))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    require(path.join(schemaDir, file));
  }

  return files;
}

async function connectWithRetry(uri, opts = {}, maxRetries = 5, delayMs = 2000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ...opts,
      });
      console.log('MongoDB connected');
      return;
    } catch (err) {
      attempt++;
      console.error(`MongoDB connection attempt ${attempt} failed: ${err.message}`);
      if (attempt >= maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function generateFromSchemas() {
  loadEnvironment();

  const databaseUrl = process.env.DATABASE_URL || process.env.MONGO_URI;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL or MONGO_URI is required. Set it in environment variables or .env file.');
  }

  const rootDir = path.resolve(__dirname, '..');
  const schemaDir = path.join(rootDir, 'schemas');
  const schemaFiles = loadSchemas(schemaDir);

  if (schemaFiles.length === 0) {
    throw new Error('No schema files found in ./schemas.');
  }

  await connectWithRetry(databaseUrl);

  try {
    const models = mongoose.models;
    const modelNames = Object.keys(models).sort((a, b) => a.localeCompare(b));

    if (modelNames.length === 0) {
      throw new Error('No Mongoose models were registered from ./schemas.');
    }

    console.log(`Loaded ${schemaFiles.length} schema files from ./schemas`);

    for (const modelName of modelNames) {
      const model = models[modelName];
      try {
        await model.createCollection();
        const syncResult = await model.syncIndexes();
        console.log(`Synced ${model.collection.collectionName} indexes:`, syncResult);
      } catch (err) {
        console.error(`Failed to sync model ${modelName}:`, err.stack || err.message);
      }
    }

    console.log('Database generation completed from ./schemas');
  } finally {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

generateFromSchemas().catch((error) => {
  console.error('Database generation failed:', error.stack || error.message);
  process.exit(1);
});
