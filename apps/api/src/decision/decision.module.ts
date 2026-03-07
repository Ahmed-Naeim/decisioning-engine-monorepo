import { Module } from '@nestjs/common';
import { DecisionController } from './decision.controller';
import { DecisionService } from './decision.service';
import { CountryStrategy } from './strategies/country.strategy';
import { DeviceTypeStrategy } from './strategies/device-type.strategy';
import { ReferrerDomainStrategy } from './strategies/referrer-domain.strategy';

@Module({
  controllers: [DecisionController],
  providers: [
    DecisionService,
    CountryStrategy,
    DeviceTypeStrategy,
    ReferrerDomainStrategy,
  ],
  exports: [DecisionService],
})
export class DecisionModule {}
