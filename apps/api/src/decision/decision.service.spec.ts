import { Test, TestingModule } from '@nestjs/testing';
import { DecisionService } from './decision.service';
import { CountryStrategy } from './strategies/country.strategy';
import { DeviceTypeStrategy } from './strategies/device-type.strategy';
import { ReferrerDomainStrategy } from './strategies/referrer-domain.strategy';

describe('DecisionService', () => {
  let service: DecisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecisionService,
        CountryStrategy,
        DeviceTypeStrategy,
        ReferrerDomainStrategy,
      ],
    }).compile();

    service = module.get<DecisionService>(DecisionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Rule Matching Logic', () => {
    it('should match promo-us variant when context matches country and deviceType', () => {
      const request = {
        id: 'req-1',
        visitorId: 'visitor-123',
        timestamp: 123456789,
        context: {
          country: 'US',
          deviceType: 'mobile',
        },
        consent: { marketing: true },
      };

      const result = service.evaluate(request);

      expect(result.approved).toBe(true);
      expect(result.variantId).toBe('promo-us');
      expect(result.headline).toBe('Welcome from the US!');
    });

    it('should match promo-google variant when context matches referrer domain', () => {
      const request = {
        id: 'req-2',
        visitorId: 'visitor-456',
        timestamp: 123456789,
        context: {
          country: 'UK', // does not match promo-us
          deviceType: 'desktop', // does not match promo-us
          referrerDomain: 'www.google.com', // matches contains google.com
        },
        consent: { marketing: true },
      };

      const result = service.evaluate(request);

      expect(result.approved).toBe(true);
      expect(result.variantId).toBe('promo-google');
    });

    it('should fallback to control when no rules match', () => {
      const request = {
        id: 'req-3',
        visitorId: 'visitor-789',
        timestamp: 123456789,
        context: {
          country: 'CA',
          deviceType: 'tablet',
          referrerDomain: 'direct',
        },
        consent: { marketing: true },
      };

      const result = service.evaluate(request);

      expect(result.approved).toBe(false);
      expect(result.variantId).toBe('control');
    });
  });
});
