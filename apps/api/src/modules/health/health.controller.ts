import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { checkDatabaseHealth } from '../../db/health.js';

@Controller('health')
export class HealthController {
  @Get()
  async check() {
    try {
      await checkDatabaseHealth();
      return {
        status: 'ok',
        service: 'theblacktrade-api',
        database: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        service: 'theblacktrade-api',
        database: 'down',
        message: error instanceof Error ? error.message : 'Unknown database error',
      });
    }
  }
}
