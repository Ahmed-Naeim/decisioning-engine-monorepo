import { Injectable } from '@nestjs/common';
import { RuleStrategy } from './rule-strategy.interface';

@Injectable()
export class CountryStrategy implements RuleStrategy {
  isApplicable(attributeName: string): boolean {
    return attributeName === 'country';
  }

  evaluate(contextValue: any, ruleValue: any, operator: string): boolean {
    if (typeof contextValue !== 'string') return false;

    switch (operator) {
      case 'equals':
      case 'eq':
        return contextValue.toLowerCase() === String(ruleValue).toLowerCase();
      case 'in':
        return (
          Array.isArray(ruleValue) &&
          ruleValue.some(
            (v) => String(v).toLowerCase() === contextValue.toLowerCase(),
          )
        );
      default:
        // Default to exact match if operator is unknown or unsupported
        return contextValue.toLowerCase() === String(ruleValue).toLowerCase();
    }
  }
}
