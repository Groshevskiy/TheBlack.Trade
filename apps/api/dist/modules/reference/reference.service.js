var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbAssets, tbNetworks } from '../../db/schema.js';
let ReferenceService = class ReferenceService {
    async listAssets() {
        return db.select().from(tbAssets).where(eq(tbAssets.isActive, true)).orderBy(asc(tbAssets.code));
    }
    async listNetworks(assetCode, directionCode, isActive) {
        if (!assetCode && !directionCode && typeof isActive === 'undefined') {
            return db.select().from(tbNetworks).orderBy(asc(tbNetworks.code));
        }
        const conditions = [];
        if (assetCode) {
            const assets = await db.select().from(tbAssets).where(eq(tbAssets.code, assetCode.toUpperCase())).limit(1);
            if (!assets[0])
                return [];
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
};
ReferenceService = __decorate([
    Injectable()
], ReferenceService);
export { ReferenceService };
//# sourceMappingURL=reference.service.js.map