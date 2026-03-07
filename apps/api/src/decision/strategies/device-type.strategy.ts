import { Injectable } from '@nestjs/common';
import { RuleStrategy } from './rule-strategy.interface';

@Injectable()
export class DeviceTypeStrategy implements RuleStrategy {
  isApplicable(attributeName: string): boolean {
    return attributeName === 'deviceType';
  }

  evaluate(contextValue: any, ruleValue: any, operator: string): boolean {
    if (typeof contextValue !== 'string') return false;

    switch (operator) {
      case 'equals':
      case 'eq':
        return contextValue.toLowerCase() === String(ruleValue).toLowerCase();
      default:
        return contextValue.toLowerCase() === String(ruleValue).toLowerCase();
    }
  }
}
