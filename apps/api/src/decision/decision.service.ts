import { Injectable } from '@nestjs/common';
import type { DecisionRequest, DecisionResponse } from '@palm-interview/shared';
import type { Rule, RuleStrategy } from './strategies/rule-strategy.interface';
import { CountryStrategy } from './strategies/country.strategy';
import { DeviceTypeStrategy } from './strategies/device-type.strategy';
import { ReferrerDomainStrategy } from './strategies/referrer-domain.strategy';

@Injectable()
export class DecisionService {
  private readonly strategies: RuleStrategy[];

  // Dummy configuration for the purpose of the exercise
  private readonly dummyConfig: Record<string, Rule[]> = {
    'site-1': [
      {
        variantId: 'promo-us',
        headline: 'Welcome from the US!',
        conditions: [
          { attribute: 'country', operator: 'eq', value: 'US' },
          { attribute: 'deviceType', operator: 'eq', value: 'mobile' },
        ],
      },
      {
        variantId: 'promo-google',
        headline: 'Thanks for searching on Google!',
        conditions: [
          {
            attribute: 'referrerDomain',
            operator: 'contains',
            value: 'google.com',
          },
        ],
      },
    ],
  };

  constructor(
    private readonly countryStrategy: CountryStrategy,
    private readonly deviceTypeStrategy: DeviceTypeStrategy,
    private readonly referrerDomainStrategy: ReferrerDomainStrategy,
  ) {
    this.strategies = [
      this.countryStrategy,
      this.deviceTypeStrategy,
      this.referrerDomainStrategy,
    ];
  }

  getRuleset(siteId: string): Rule[] {
    return this.dummyConfig[siteId] || [];
  }

  evaluate(request: DecisionRequest): DecisionResponse {
    // Basic implementation: we'll use site-1 rules for evaluation demonstration
    const rules = this.getRuleset('site-1');
    const { context } = request;

    for (const rule of rules) {
      let isMatch = true;

      for (const condition of rule.conditions) {
        // Find the right strategy for this condition attribute
        const strategy = this.strategies.find((s) =>
          s.isApplicable(condition.attribute),
        );

        if (!strategy) {
          // If no strategy found to evaluate this, fail open or close. We'll fail close.
          isMatch = false;
          break;
        }

        const contextValue = context[condition.attribute];
        if (
          !strategy.evaluate(contextValue, condition.value, condition.operator)
        ) {
          isMatch = false;
          break; // Rule failed, move to next rule
        }
      }

      if (isMatch) {
        // First matched rule determines the variant
        return {
          decisionId: `dec-${Date.now()}`,
          approved: true,
          variantId: rule.variantId,
          headline: rule.headline,
          reason: 'Matched ' + rule.variantId,
        };
      }
    }

    // No rules matched, fallback decision
    return {
      decisionId: `dec-${Date.now()}`,
      approved: false,
      reason: 'No matching rules found',
      variantId: 'control',
      headline: 'Welcome to our site!',
    };
  }
}
