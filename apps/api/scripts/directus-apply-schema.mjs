import fs from 'node:fs/promises';
import { createDirectus, rest, authentication, readMe, schemaApply } from '@directus/sdk';

const baseUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
const email = process.env.DIRECTUS_ADMIN_EMAIL;
const password = process.env.DIRECTUS_ADMIN_PASSWORD;
const snapshotPath = process.env.DIRECTUS_SCHEMA_PATH || '../../infrastructure/directus/bootstrap/schema.snapshot.example.json';

if (!email || !password) {
  throw new Error('DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD are required');
}

const client = createDirectus(baseUrl).with(authentication()).with(rest());
await client.login(email, password);
await client.request(readMe());
const raw = await fs.readFile(new URL(snapshotPath, import.meta.url), 'utf-8');
const snapshot = JSON.parse(raw);
await client.request(schemaApply(snapshot));
console.log('Directus schema apply completed');
