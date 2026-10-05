import { Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbAssets, tbNetworks } from '../../db/schema.js';

@Injectable()
export class ReferenceService {
  async listAssets() {
    return db.select().from(tbAssets).where(eq(tbAssets.isActive, true)).orderBy(asc(tbAssets.code));
  }

  async listNetworks(assetCode?: string, directionCode?: string, isActive?: boolean) {
    if (!assetCode && !directionCode && typeof isActive === 'undefined') {
      return db.select().from(tbNetworks).orderBy(asc(tbNetworks.code));
    }

    const conditions = [] as any[];
    if (assetCode) {
      const assets = await db.select().from(tbAssets).where(eq(tbAssets.code, assetCode.toUpperCase())).limit(1);
      if (!assets[0]) return [];
      conditions.push(eq(tbNetworks.assetId, assets[0].id));
    }
    if (directionCode) {
      conditions.push(eq(tbNetworks.directionCode, directionCode.toLowerCase()));
    }
    if (typeof isActive !== 'undefined') {
      conditions.push(eq(tbNetworks.isActive, isActive));
    }

    return db.select().from(tbNetworks).where(and(...conditions)).orderBy(asc(tbNetworks.code));
  }
}
