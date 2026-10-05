import { sql } from 'drizzle-orm';
import { db } from './index.js';
export async function checkDatabaseHealth() {
    const result = await db.execute(sql `select 1 as ok`);
    return result;
}
//# sourceMappingURL=health.js.map