const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const rootDir = path.resolve(__dirname, '..');

function parseEnvValue(raw) {
  let value = String(raw || '').trim();
  if (!value) {
    return '';
  }

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = parseEnvValue(trimmed.slice(separatorIndex + 1));
  }
}

function loadEnvironment() {
  loadEnvFile(path.join(rootDir, '.env'));
  loadEnvFile(path.join(rootDir, '.env.local'));
  loadEnvFile(path.join(rootDir, '.env.example'));
}

function loadSchemas() {
  const schemaDir = path.join(rootDir, 'schemas');
  if (!fs.existsSync(schemaDir)) {
    return;
  }

  const files = fs
    .readdirSync(schemaDir)
    .filter((file) => file.endsWith('.js'))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    require(path.join(schemaDir, file));
  }
}

let connectPromise = null;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectPromise) {
    return connectPromise;
  }

  loadEnvironment();
  loadSchemas();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required. Set it in .env or environment variables.');
  }

  connectPromise = mongoose
    .connect(databaseUrl, {
      autoCreate: false,
      autoIndex: false,
    })
    .finally(() => {
    if (mongoose.connection.readyState !== 1) {
      connectPromise = null;
    }
  });

  return connectPromise;
}

module.exports = {
  connectToDatabase,
  mongoose,
};
