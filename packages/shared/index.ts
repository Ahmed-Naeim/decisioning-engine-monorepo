export interface ConsentSettings {
   analytics: boolean;
   marketing: boolean;
   necessary: boolean;
}

export interface DecisionRequest {
   id: string;
   userId?: string;
   visitorId?: string | null;
   consent?: ConsentSettings;
   context: Record<string, any>;
   timestamp: number;
}

export interface DecisionResponse {
   decisionId: string;
   approved: boolean;
   reason?: string;
   variantId?: string;
   headline?: string;
}
