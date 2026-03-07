import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { DecisionService } from './decision.service';
import type { DecisionResponse } from '@palm-interview/shared';
import { DecisionRequestDto } from './dto/decision-request.dto';
import { ConsentInterceptor } from '../common/interceptors/consent.interceptor';
import * as crypto from 'crypto';

@Controller('decision')
export class DecisionController {
  constructor(private readonly decisionService: DecisionService) {}

  @Get('config/:siteId')
  getConfig(@Param('siteId') siteId: string, @Res() res: Response) {
    const ruleset = this.decisionService.getRuleset(siteId);

    // Generate ETag representing current ruleset
    const rulesetString = JSON.stringify(ruleset);
    const hash = crypto
      .createHash('sha256')
      .update(rulesetString)
      .digest('hex');
    const etag = `W/"${hash.substring(0, 16)}"`;

    // Set caching headers per requirements
    res.setHeader('ETag', etag);
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=30',
    );

    return res.json(ruleset);
  }

  @Post('decide')
  @UseInterceptors(ConsentInterceptor)
  decide(@Body() request: DecisionRequestDto): DecisionResponse {
    return this.decisionService.evaluate(request);
  }
}
