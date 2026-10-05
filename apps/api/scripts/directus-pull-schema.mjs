import fs from 'node:fs/promises';
import { createDirectus, rest, authentication, schemaSnapshot } from '@directus/sdk';

const baseUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
const email = process.env.DIRECTUS_ADMIN_EMAIL;
const password = process.env.DIRECTUS_ADMIN_PASSWORD;
const outPath = process.env.DIRECTUS_SCHEMA_OUT || '../../infrastructure/directus/bootstrap/schema.snapshot.generated.json';

if (!email || !password) {
  throw new Error('DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD are required');
}

const client = createDirectus(baseUrl).with(authentication()).with(rest());
await client.login(email, password);
const snapshot = await client.request(schemaSnapshot());
await fs.writeFile(new URL(outPath, import.meta.url), JSON.stringify(snapshot, null, 2));
console.log('Directus schema snapshot saved');
