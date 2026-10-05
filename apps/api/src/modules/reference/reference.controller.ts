import { Controller, Get, Query } from '@nestjs/common';
import { ReferenceService } from './reference.service.js';

@Controller('reference')
export class ReferenceController {
  constructor(private readonly referenceService: ReferenceService) {}

  @Get('assets')
  async listAssets() {
    const items = await this.referenceService.listAssets();
    return { items };
  }

  @Get('networks')
  async listNetworks(
    @Query('asset_code') assetCode?: string,
    @Query('direction_code') directionCode?: string,
    @Query('is_active') isActive?: string,
  ) {
    const normalizedActive = typeof isActive === 'string'
      ? ['true', '1', 'yes'].includes(isActive.toLowerCase())
      : undefined;

    const items = await this.referenceService.listNetworks(assetCode, directionCode, normalizedActive);
    return { items };
  }
}
