var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbAssets, tbFiatCurrencies, tbNetworks, tbPairs, tbQuotes } from '../../db/schema.js';
import { QuoteCalculateSchema } from './quotes.dto.js';
let QuotesService = class QuotesService {
    async calculate(payload) {
        const parsed = QuoteCalculateSchema.safeParse(payload);
        if (!parsed.success) {
            throw new BadRequestException(parsed.error.flatten());
        }
        const input = parsed.data;
        const assetRows = await db.select().from(tbAssets).where(eq(tbAssets.code, input.asset_code.toUpperCase())).limit(1);
        const asset = assetRows[0];
        if (!asset || !asset.isActive) {
            throw new NotFoundException({ message: 'Asset not found or inactive', asset_code: input.asset_code });
        }
        const networkRows = await db.select().from(tbNetworks).where(and(eq(tbNetworks.assetId, asset.id), eq(tbNetworks.code, input.network_code.toUpperCase()), eq(tbNetworks.directionCode, input.direction_code.toLowerCase()), eq(tbNetworks.isActive, true))).limit(1);
        const network = networkRows[0];
        if (!network) {
            throw new NotFoundException({
                message: 'Network not found for asset and direction',
                asset_code: input.asset_code,
                network_code: input.network_code,
                direction_code: input.direction_code,
            });
        }
        const fiatRows = await db.select().from(tbFiatCurrencies).where(eq(tbFiatCurrencies.code, input.fiat_currency_code.toUpperCase())).limit(1);
        const fiatCurrency = fiatRows[0];
        if (!fiatCurrency || !fiatCurrency.isActive) {
            throw new NotFoundException({
                message: 'Fiat currency not found or inactive',
                fiat_currency_code: input.fiat_currency_code,
            });
        }
        const pairRows = await db.select().from(tbPairs).where(and(eq(tbPairs.directionCode, input.direction_code.toLowerCase()), eq(tbPairs.fiatCurrencyId, fiatCurrency.id), eq(tbPairs.assetId, asset.id), eq(tbPairs.networkId, network.id), eq(tbPairs.isActive, true))).limit(1);
        const pair = pairRows[0];
        if (!pair) {
            throw new NotFoundException({
                message: 'Active pair not found',
                direction_code: input.direction_code,
                fiat_currency_code: input.fiat_currency_code,
                asset_code: asset.code,
                network_code: network.code,
            });
        }
        const rate = input.direction_code === 'buy' ? 100 : 99;
        const feePercent = 0.015;
        const amountIn = input.amount;
        const amountOut = input.amount_type === 'fiat'
            ? Number(((amountIn / rate) * (1 - feePercent)).toFixed(8))
            : Number(((amountIn * rate) * (1 - feePercent)).toFixed(8));
        const quoteUid = `quote_${Date.now()}`;
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await db.insert(tbQuotes).values({
            quoteUid,
            pairId: pair.id,
            amountType: input.amount_type,
            amountIn: String(amountIn),
            amountOut: String(amountOut),
            rate: String(rate),
            feeBreakdown: {
                fee_percent: feePercent,
                asset_code: asset.code,
                network_code: network.code,
                direction_code: network.directionCode,
            },
            expiresAt,
        });
        return {
            quote_id: quoteUid,
            asset_id: asset.id,
            network_id: network.id,
            direction_code: input.direction_code,
            fiat_currency_code: input.fiat_currency_code,
            asset_code: asset.code,
            network_code: network.code,
            amount_type: input.amount_type,
            amount_in: amountIn,
            amount_out: amountOut,
            rate,
            fee_percent: feePercent,
            expires_at: expiresAt.toISOString(),
        };
    }
};
QuotesService = __decorate([
    Injectable()
], QuotesService);
export { QuotesService };
//# sourceMappingURL=quotes.service.js.map