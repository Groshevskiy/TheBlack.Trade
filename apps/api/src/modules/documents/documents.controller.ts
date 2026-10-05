import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DocumentsService } from './documents.service.js';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async list(@Query() query: Record<string, unknown>) {
    const items = await this.documentsService.list(query);
    return { items };
  }

  @Post()
  async create(@Body() body: Record<string, unknown>) {
    const item = await this.documentsService.create(body);
    return { item };
  }

  @Post(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const item = await this.documentsService.updateStatus(id, body);
    return { item };
  }
}
