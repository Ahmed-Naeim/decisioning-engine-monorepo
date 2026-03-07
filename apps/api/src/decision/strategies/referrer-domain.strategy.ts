import { Injectable } from '@nestjs/common';
import { RuleStrategy } from './rule-strategy.interface';

@Injectable()
export class ReferrerDomainStrategy implements RuleStrategy {
  isApplicable(attributeName: string): boolean {
    return attributeName === 'referrerDomain';
  }

  evaluate(contextValue: any, ruleValue: any, operator: string): boolean {
    if (typeof contextValue !== 'string') return false;

    // Normalize domains by removing www. and trailing slashes if needed, or just do substring/exact matching
    const contextDomain = contextValue.toLowerCase();
    const ruleDomain = String(ruleValue).toLowerCase();

    switch (operator) {
      case 'equals':
      case 'eq':
        return contextDomain === ruleDomain;
      case 'contains':
        return contextDomain.includes(ruleDomain);
      default:
        return contextDomain === ruleDomain;
    }
  }
}
