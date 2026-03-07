export interface RuleCondition {
  attribute: string;
  operator: string;
  value: any;
}

export interface Rule {
  variantId: string;
  headline: string;
  conditions: RuleCondition[];
}

export interface RuleStrategy {
  /**
   * Returns true if this strategy handles the given attribute name
   */
  isApplicable(attributeName: string): boolean;

  /**
   * Evaluates the condition against the user context value
   */
  evaluate(contextValue: any, ruleValue: any, operator: string): boolean;
}
